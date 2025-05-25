// src/pages/routine/create.tsx - 완전 수정 버전
import { useEmotionStore } from '@/store/emotionStore';
import { useAuthStore } from '@/store'; // 🔥 추가
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// 🔥 업데이트된 인터페이스들
interface StudyBlock {
  id: string;
  type: 'theory' | 'practice' | 'review' | 'rest' | 'cbt';
  subject: string;
  duration: number;
  startTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  materials?: {  // 🔥 추가
    textbook?: string;
    lecture?: string;
    problems?: string;
    passTip?: string;
  };
}

interface RoutineResult {
  success: boolean;
  stressScore?: number;  // 🔥 추가
  emotionBand?: 'High' | 'Medium' | 'Low';  // 🔥 추가
  recommendedMaterials?: {  // 🔥 새로 추가
    primaryTextbook?: {
      name: string;
      author: string;
      reason: string;
      studyMethod: string;
    };
    primaryLecture?: {
      instructor: string;
      platform: string;
      reason: string;
      studyTips: string;
    };
  };
  blocks: StudyBlock[];
  icsUrl?: string;
  message: string;
}

const EXAM_TYPES = [
  '한국사능력검정시험',
  '컴퓨터활용능력 1급',
  '공인중개사',
  '지게차운전기능사',
  '한식조리기능사',
  '전기기능사',
  '제과기능사',
  '제빵기능사',
  '산업안전기사',
  '전기기사',
  '정보처리기사',
  '산업안전산업기사',
  '전기산업기사',
  '워드프로세서',
  '컴퓨터활용능력 2급',
  '미용사(일반)',
  '사회복지사 1급',
  '건설안전기사',
  '위험물산업기사',
  '양식조리기능사',
  '기타'
];

const WEAK_TOPICS = [
  '스프레드시트', '데이터베이스', '프로그래밍', '시스템분석',
  '네트워크', '보안', '알고리즘', '자료구조', '운영체제',
  '산업안전관리', '위험물관리', '건설안전', '인간공학', '시스템안전',
  '전기이론', '전기기기', '전력공학', '전기설비', '회로이론',
  '한식조리', '양식조리', '제과이론', '제빵이론', '위생관리',
  '한국사', '부동산법', '민법', '사회복지', '미용이론'
];

export default function CreateRoutinePage() {
  // 🔥 useAuthStore 추가
  const { user } = useAuthStore();
  
  // 🔥 EmotionStore 연동
  const { 
    currentEmotion, 
    getOptimalRoutine, 
    startActivity, 
    endActivity,
    shouldTakeBreak,
    getMotivationalMessage,
    updateFullEmotion,
    connectSystem,
    subscribeToEmotionChanges
  } = useEmotionStore();

  // Form State
  const [examType, setExamType] = useState('');
  const [examDate, setExamDate] = useState('');
  const [studyHours, setStudyHours] = useState(4);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [useRealTimeEmotion, setUseRealTimeEmotion] = useState(true);
  const [manualEmotionScore, setManualEmotionScore] = useState(0.7);
  const [manualErrorRate, setManualErrorRate] = useState(0.3);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RoutineResult | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activityId, setActivityId] = useState<string>('');

  // 🔥 컴포넌트 마운트 시 루틴 시스템 연결 및 감정 변화 구독
  useEffect(() => {
    connectSystem('routine');
    console.log('🔗 루틴 시스템이 감정 모니터링에 연결되었습니다.');

    const unsubscribe = subscribeToEmotionChanges((emotion) => {
      console.log('🧠 [루틴페이지] 감정 변화 감지:', emotion);
      if (useRealTimeEmotion && result && shouldTakeBreak()) {
        console.log('⚠️ 감정 변화로 인한 휴식 권장');
      }
    });

    return unsubscribe;
  }, [connectSystem, subscribeToEmotionChanges, useRealTimeEmotion, result, shouldTakeBreak]);

  const handleWeakTopicToggle = (topic: string) => {
    setWeakTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  // 🔥 AI 기반 스마트 루틴 생성 (EmotionStore와 연동)
  const handleGenerateSmartRoutine = async () => {
    if (!examType || !examDate) {
      alert('시험 종류와 시험 날짜를 입력해주세요.');
      return;
    }

    if (useRealTimeEmotion && shouldTakeBreak()) {
      const shouldContinue = window.confirm(
        '현재 스트레스가 높거나 집중도가 낮습니다. 잠시 휴식을 취하시겠어요? (취소하면 루틴 생성을 계속 진행합니다)'
      );
      if (shouldContinue) {
        alert('💆‍♀️ 5-10분 휴식 후 다시 시도해보세요!');
        return;
      }
    }

    setIsLoading(true);
    setResult(null);
    setLoadingStep(0);

    const id = await startActivity('routine', { 
      examType, 
      examDate, 
      studyHours,
      useRealTimeEmotion
    });
    setActivityId(id);

    const loadingSteps = [
      '🧠 실시간 감정 상태 분석 중...',
      '⚡ 특허 StressScore 계산 중...',
      '🤖 Claude 기반 루틴 생성 중...',
      '🎯 개인화 최적화 중...',
      '✅ 완료!'
    ];

    const loadingInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(loadingInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    try {
      const emotionBasedRecommendation = await getOptimalRoutine();
      
      const emotionScore = useRealTimeEmotion ? currentEmotion.score : manualEmotionScore;
      const errorRate = useRealTimeEmotion ? (1 - currentEmotion.confidence) * 0.5 : manualErrorRate;

      // 🔥 시험까지 남은 일수 계산
      const daysUntilExam = examDate 
        ? Math.max(1, Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
        : 30;

      console.log('🚀 스마트 루틴 생성 요청:', {
        examType,
        studyHours,
        daysUntilExam,
        userId: user?.id || null,
        examDate,
        weakTopics,
        emotionScore,
        errorRate,
        currentEmotion,
        emotionBasedRecommendation
      });

      const response = await fetch('/api/routine/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examType,                         
          studyHours,                       
          daysUntilExam,                    
          userId: user?.id || null,         
          
          examDate,
          weakTopics,
          emotionScore,
          errorRate,
          enhancedEmotion: useRealTimeEmotion ? currentEmotion : null,
          emotionRecommendation: emotionBasedRecommendation,
          useRealTimeEmotion
        })
      });

      console.log('📥 루틴 API 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 루틴 API 오류:', response.status, errorText);
        throw new Error(`API 오류 (${response.status}): ${errorText}`);
      }

      const data: RoutineResult = await response.json();
      console.log('📋 스마트 루틴 생성 결과:', data);
      
      setResult(data);

      const successRate = data.success ? 0.85 : 0.3;
      await endActivity(id, successRate, {
        examType,
        blocksGenerated: data.blocks?.length || 0,
        stressScore: data.stressScore || 0,
        useRealTimeEmotion
      });
      
    } catch (error: any) {
      console.error('💥 루틴 생성 실패:', error);
      await endActivity(id, 0.1, { error: error.message });
      
      setResult({
        success: false,
        stressScore: 0,
        emotionBand: 'Medium',
        blocks: [],
        message: `루틴 생성 중 오류가 발생했습니다: ${error.message}`
      });
    } finally {
      clearInterval(loadingInterval);
      setIsLoading(false);
    }
  };

  const handleDownloadICS = () => {
    alert('ICS 다운로드 기능은 준비 중입니다.');
  };

  const calculateRealTimeStressScore = () => {
    if (useRealTimeEmotion) {
      const errorRate = (1 - currentEmotion.confidence) * 0.5;
      return (0.6 * errorRate + 0.4 * (1 - currentEmotion.score)).toFixed(2);
    } else {
      return (0.6 * manualErrorRate + 0.4 * (1 - manualEmotionScore)).toFixed(2);
    }
  };

  const getEmotionBasedRecommendation = () => {
    if (!useRealTimeEmotion) return '수동 모드에서는 입력한 값을 사용합니다.';
    
    const { stress, focus, energy, confidence } = currentEmotion;
    
    if (stress > 0.7) return '🔴 스트레스가 높습니다. 휴식 중심의 가벼운 루틴을 추천합니다.';
    if (focus > 0.8 && energy > 0.7) return '🟢 최상의 컨디션! 집중적인 학습 루틴을 추천합니다.';
    if (energy < 0.4) return '🟡 에너지가 부족합니다. 짧은 세션 중심의 루틴을 추천합니다.';
    if (confidence < 0.4) return '🟠 자신감 향상이 필요합니다. 쉬운 문제부터 시작하는 루틴을 추천합니다.';
    return '🟢 좋은 상태입니다. 균형잡힌 학습 루틴을 추천합니다.';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      theory: 'bg-blue-100 text-blue-800 border-blue-200',
      practice: 'bg-green-100 text-green-800 border-green-200', 
      review: 'bg-orange-100 text-orange-800 border-orange-200',
      rest: 'bg-gray-100 text-gray-800 border-gray-200',
      cbt: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-500',
      medium: 'bg-yellow-500',
      hard: 'bg-red-500'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <>
      <Head>
        <title>감정 연동 AI 루틴 생성 - CertCafe</title>
        <meta name="description" content="실시간 감정 분석 기반 맞춤형 학습 루틴을 AI가 자동으로 생성합니다" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* 헤더 */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link 
                href="/"
                className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <span className="mr-2">←</span>
                홈으로 돌아가기
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                🧠 감정 연동 AI 루틴봇
              </h1>
              <div></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 서브 헤더 */}
          <div className="text-center mb-8">
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              실시간 감정 상태와 오답률을 분석하여 개인화된 학습 루틴을 생성합니다
            </p>
            <div className="mt-4 flex justify-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">🧠 특허 기술 적용</span>
              <span className="flex items-center">⚡ Claude 기반</span>
              <span className="flex items-center">💓 실시간 감정 연동</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 입력 폼 (기존과 동일) */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                🧠 학습 정보 입력
              </h2>

              <div className="space-y-6">
                {/* 실시간 감정 사용 토글 */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-purple-800">💓 실시간 감정 분석</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={useRealTimeEmotion}
                        onChange={(e) => setUseRealTimeEmotion(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  
                  {useRealTimeEmotion ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center p-2 bg-white rounded-lg">
                          <div className="text-lg">
                            {currentEmotion.score > 0.6 ? '😊' : currentEmotion.score < 0.4 ? '😔' : '😐'}
                          </div>
                          <div className="text-xs text-gray-600">기분</div>
                          <div className="font-bold text-purple-600">{Math.round(currentEmotion.score * 100)}%</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg">
                          <div className="text-lg">
                            {currentEmotion.stress < 0.3 ? '😌' : currentEmotion.stress > 0.7 ? '😰' : '😅'}
                          </div>
                          <div className="text-xs text-gray-600">스트레스</div>
                          <div className="font-bold text-red-600">{Math.round(currentEmotion.stress * 100)}%</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg">
                          <div className="text-lg">
                            {currentEmotion.focus > 0.7 ? '🎯' : currentEmotion.focus < 0.4 ? '😵‍💫' : '🤔'}
                          </div>
                          <div className="text-xs text-gray-600">집중도</div>
                          <div className="font-bold text-green-600">{Math.round(currentEmotion.focus * 100)}%</div>
                        </div>
                      </div>
                      <div className="text-xs text-purple-700 bg-white p-2 rounded-lg">
                        💡 {getEmotionBasedRecommendation()}
                      </div>
                      {shouldTakeBreak() && (
                        <div className="text-xs text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                          ⚠️ 휴식이 필요한 상태입니다. 루틴 생성 시 자동으로 휴식 시간이 포함됩니다.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      수동 입력 모드 - 아래에서 감정 점수와 오답률을 직접 설정하세요.
                    </div>
                  )}
                </div>

                {/* 시험 정보 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시험 종류
                  </label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">선택하세요</option>
                    {EXAM_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시험 날짜
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    일일 학습 시간: <span className="text-indigo-600 font-bold">{studyHours}시간</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={studyHours}
                    onChange={(e) => setStudyHours(Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1시간</span>
                    <span>12시간</span>
                  </div>
                </div>

                {/* 약점 주제 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    약점 주제 (복수 선택 가능)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WEAK_TOPICS.map(topic => (
                      <button
                        key={topic}
                        onClick={() => handleWeakTopicToggle(topic)}
                        className={`px-3 py-2 text-sm rounded-full border transition-all ${
                          weakTopics.includes(topic) 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                            : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 수동 감정 입력 */}
                {!useRealTimeEmotion && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      📊 수동 감정 입력
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          감정 점수: <span className="font-medium text-gray-800">{manualEmotionScore.toFixed(2)}</span>
                          <span className="ml-2">
                            {manualEmotionScore >= 0.7 ? '😊 좋음' : manualEmotionScore >= 0.4 ? '😐 보통' : '😔 나쁨'}
                          </span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={manualEmotionScore}
                          onChange={(e) => setManualEmotionScore(Number(e.target.value))}
                          className="w-full h-3 bg-gradient-to-r from-red-200 to-green-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          최근 오답률: <span className="font-medium text-gray-800">{(manualErrorRate * 100).toFixed(0)}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={manualErrorRate}
                          onChange={(e) => setManualErrorRate(Number(e.target.value))}
                          className="w-full h-3 bg-gradient-to-r from-green-200 to-red-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* StressScore 미리보기 */}
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600 mb-1">🧮 특허 알고리즘 계산 결과:</div>
                  <div className="text-lg font-bold">
                    StressScore: <span className={Number(calculateRealTimeStressScore()) >= 0.30 ? 'text-red-600' : 'text-green-600'}>
                      {calculateRealTimeStressScore()}
                    </span>
                    {Number(calculateRealTimeStressScore()) >= 0.30 && (
                      <span className="text-red-600 ml-2 text-sm">⚠️ 자동 휴식 모드 활성화</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    공식: 0.6 × 오답률 + 0.4 × (1 - 감정점수)
                    {useRealTimeEmotion && <span className="text-indigo-600 ml-1">(실시간 데이터 사용)</span>}
                  </div>
                  {useRealTimeEmotion && (
                    <div className="mt-2 text-xs text-indigo-600">
                      💬 {getMotivationalMessage()}
                    </div>
                  )}
                </div>

                {/* 생성 버튼 */}
                <button
                  onClick={handleGenerateSmartRoutine}
                  disabled={isLoading || !examType || !examDate}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all transform hover:scale-105 ${
                    isLoading || !examType || !examDate
                      ? 'bg-gray-400 cursor-not-allowed'
                      : useRealTimeEmotion 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      {useRealTimeEmotion ? '🧠 스마트 루틴 생성 중...' : 'AI 루틴 생성 중...'}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">{useRealTimeEmotion ? '🧠' : '⚡'}</span>
                      {useRealTimeEmotion ? '🚀 감정 연동 스마트 루틴 생성' : '🚀 AI 루틴 생성하기'}
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* 🔥 결과 영역 (교재/강의 추천 포함) */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                📅 생성된 {useRealTimeEmotion ? '스마트' : 'AI'} 루틴
              </h2>

              {/* 로딩 상태 */}
              {isLoading && (
                <div className="space-y-6 text-center">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 absolute top-0 left-0"></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-800 font-medium mb-2">
                      {['🧠 실시간 감정 상태 분석 중...', '⚡ 특허 StressScore 계산 중...', '🤖 Claude 기반 루틴 생성 중...', '🎯 개인화 최적화 중...', '✅ 완료!'][loadingStep]}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(loadingStep + 1) * 20}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* 결과 표시 */}
              {result && (
                <div className="space-y-6">
                  {/* 상태 요약 */}
                  <div className="bg-gradient-to-r from-gray-50 to-indigo-50 p-5 rounded-xl border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-3">
                      <div className="flex items-center">
                        <span className="text-gray-600 font-medium">StressScore:</span>
                        <span className={`ml-2 font-bold text-lg ${(result.stressScore || 0) >= 0.30 ? 'text-red-600' : 'text-green-600'}`}>
                          {(result.stressScore || 0).toFixed(2)}
                          {(result.stressScore || 0) >= 0.30 && <span className="inline ml-1">⚠️</span>}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 font-medium">감정 상태:</span>
                        <span className="ml-2 font-bold text-lg">
                          {(result.emotionBand || 'Medium') === 'High' ? '😊 좋음' : 
                           (result.emotionBand || 'Medium') === 'Medium' ? '😐 보통' : '😔 주의'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border-l-4 border-indigo-500">
                      💡 {result.message || '루틴이 생성되었습니다.'}
                    </div>
                    {useRealTimeEmotion && (
                      <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded-lg mt-2">
                        🧠 실시간 감정 데이터를 활용한 맞춤형 루틴입니다
                      </div>
                    )}
                  </div>

                  {/* 🔥 추천 교재/강의 섹션 (새로 추가) */}
                  {result.recommendedMaterials && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-xl border border-blue-200">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        🎯 합격자 기반 추천 자료
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 추천 교재 */}
                        {result.recommendedMaterials.primaryTextbook && (
                          <div className="bg-white p-4 rounded-lg border border-blue-100">
                            <div className="flex items-center mb-2">
                              <span className="text-lg mr-2">📚</span>
                              <h4 className="font-bold text-blue-800">추천 교재</h4>
                            </div>
                            <div className="space-y-2">
                              <div className="font-semibold text-gray-800">
                                {result.recommendedMaterials.primaryTextbook.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                저자: {result.recommendedMaterials.primaryTextbook.author}
                              </div>
                              <div className="text-xs bg-blue-100 text-blue-800 p-2 rounded">
                                💡 {result.recommendedMaterials.primaryTextbook.reason}
                              </div>
                              <div className="text-xs text-gray-500">
                                📖 {result.recommendedMaterials.primaryTextbook.studyMethod}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 추천 강의 */}
                        {result.recommendedMaterials.primaryLecture && (
                          <div className="bg-white p-4 rounded-lg border border-purple-100">
                            <div className="flex items-center mb-2">
                              <span className="text-lg mr-2">👨‍🏫</span>
                              <h4 className="font-bold text-purple-800">추천 강의</h4>
                            </div>
                            <div className="space-y-2">
                              <div className="font-semibold text-gray-800">
                                {result.recommendedMaterials.primaryLecture.instructor} 선생님
                              </div>
                              <div className="text-sm text-gray-600">
                                플랫폼: {result.recommendedMaterials.primaryLecture.platform}
                              </div>
                              <div className="text-xs bg-purple-100 text-purple-800 p-2 rounded">
                                💡 {result.recommendedMaterials.primaryLecture.reason}
                              </div>
                              <div className="text-xs text-gray-500">
                                🎯 {result.recommendedMaterials.primaryLecture.studyTips}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 루틴 블록들 */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {result.blocks.map((block, index) => (
                      <div key={block.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(block.type)}`}>
                              {block.type}
                            </span>
                            <span className="font-semibold text-gray-800">{block.subject}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${getDifficultyColor(block.difficulty)}`}></div>
                            <span className="text-sm text-gray-500 capitalize">{block.difficulty}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 space-x-4 mb-2">
                          <div className="flex items-center">
                            <span className="mr-1">🕒</span>
                            <span className="font-medium">{block.startTime}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-green-600">{block.duration}분</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg mb-3">
                          {block.description}
                        </div>

                        {/* 🔥 구체적 교재/강의 정보 (새로 추가) */}
                        {block.materials && (
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <h5 className="text-xs font-bold text-blue-800 mb-2">📚 학습 자료</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              {block.materials.textbook && (
                                <div className="flex items-start">
                                  <span className="mr-1">📖</span>
                                  <div>
                                    <div className="font-medium text-gray-700">교재</div>
                                    <div className="text-gray-600">{block.materials.textbook}</div>
                                  </div>
                                </div>
                              )}
                              {block.materials.lecture && (
                                <div className="flex items-start">
                                  <span className="mr-1">🎥</span>
                                  <div>
                                    <div className="font-medium text-gray-700">강의</div>
                                    <div className="text-gray-600">{block.materials.lecture}</div>
                                  </div>
                                </div>
                              )}
                              {block.materials.problems && (
                                <div className="flex items-start">
                                  <span className="mr-1">📝</span>
                                  <div>
                                    <div className="font-medium text-gray-700">문제</div>
                                    <div className="text-gray-600">{block.materials.problems}</div>
                                  </div>
                                </div>
                              )}
                              {block.materials.passTip && (
                                <div className="flex items-start">
                                  <span className="mr-1">💡</span>
                                  <div>
                                    <div className="font-medium text-gray-700">합격 팁</div>
                                    <div className="text-gray-600">{block.materials.passTip}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 다운로드 버튼 */}
                  {result.success && (
                    <button
                      onClick={handleDownloadICS}
                      className="w-full py-3 px-6 border-2 border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-600 hover:text-white transition-all flex items-center justify-center"
                    >
                      <span className="mr-2">📥</span>
                      📅 캘린더로 내보내기 (.ics)
                    </button>
                  )}
                </div>
              )}

              {/* 초기 상태 */}
              {!isLoading && !result && (
                <div className="text-center text-gray-500 py-12">
                  <div className="mb-6">
                    <div className="text-6xl mb-4">{useRealTimeEmotion ? '🧠' : '🤖'}</div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    {useRealTimeEmotion ? '감정 연동 AI가 대기 중입니다' : 'AI가 대기 중입니다'}
                  </h3>
                  <p className="text-gray-500">좌측 정보를 입력하고 AI 루틴을 생성해보세요!</p>
                  <div className="mt-4 text-xs text-gray-400">
                    {useRealTimeEmotion 
                      ? '실시간 감정 분석과 특허 기술이 적용된 개인화 알고리즘' 
                      : '특허 기술이 적용된 개인화 알고리즘으로 최적의 학습 계획을 제공'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}