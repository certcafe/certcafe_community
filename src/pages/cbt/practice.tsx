// src/pages/cbt/practice.tsx - EmotionStore 완전 연동 버전
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEmotionStore } from '@/store/emotionStore';

interface Problem {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

// 🔥 CBT 설정 인터페이스
interface CBTSettings {
  questionCount: number;
  timeLimit: number;
  difficulty: string;
  showTimer: boolean;
}

// 🔥 문항수 옵션
const QUESTION_COUNT_OPTIONS = [
  { value: 5, label: '5문항 (빠른 체크)', time: 10, description: '빠르게 실력 점검' },
  { value: 10, label: '10문항 (미니 테스트)', time: 20, description: '단원별 확인' },
  { value: 20, label: '20문항 (단원별 테스트)', time: 40, description: '심화 학습' },
  { value: 40, label: '40문항 (중간 모의고사)', time: 80, description: '실전 대비' },
  { value: 60, label: '60문항 (실전 모의고사)', time: 120, description: '완전 실전' },
  { value: 100, label: '100문항 (완전 실전)', time: 200, description: '최고 난이도' }
];

const SUBJECT_MAPPING: Record<string, string> = {
  'computer-applications-1': '컴퓨터활용능력 1급',
  'industrial-safety': '산업안전기사',
  'accounting-tax': '전산세무회계',
  'social-worker': '사회복지사 1급',
  'info-processing': '정보처리기사',
  'craftsman-cook': '조리기능사',
  'korean-history': '한국사능력검정시험',
  'real-estate-agent': '공인중개사',
  'forklift-operator': '지게차운전기능사',
  'korean-cuisine': '한식조리기능사',
  'electrical-craftsman': '전기기능사',
  'confectionery': '제과기능사',
  'bakery': '제빵기능사',
  'electrical-engineer': '전기기사',
  'word-processor': '워드프로세서',
  'computer-applications-2': '컴퓨터활용능력 2급',
  'beautician': '미용사(일반)',
  'construction-safety': '건설안전기사',
  'hazardous-materials': '위험물산업기사',
  'western-cuisine': '양식조리기능사'
};

// Fallback 문제 (API 실패 시 사용)
const FALLBACK_PROBLEMS: Problem[] = [
  {
    question: "다음 중 객체지향 프로그래밍의 특징이 아닌 것은?",
    options: ["추상화", "캡슐화", "다형성", "상속", "순차실행"],
    correct: 4,
    explanation: "순차실행은 절차형 프로그래밍의 특징으로, 객체지향 프로그래밍의 특징인 추상화, 캡슐화, 다형성, 상속과는 다릅니다."
  },
  {
    question: "데이터베이스 정규화의 주요 목적은?",
    options: ["데이터 중복 제거", "검색 속도 향상", "저장 공간 증가", "백업 용이성", "보안 강화"],
    correct: 0,
    explanation: "데이터베이스 정규화의 주요 목적은 데이터 중복을 제거하고 데이터 무결성을 보장하는 것입니다."
  },
  {
    question: "다음 중 네트워크 계층 모델에서 물리계층은 몇 번째 계층인가?",
    options: ["1계층", "2계층", "3계층", "4계층", "7계층"],
    correct: 0,
    explanation: "OSI 7계층 모델에서 물리계층은 1계층으로, 전기적 신호를 통한 데이터 전송을 담당합니다."
  },
  {
    question: "다음 중 알고리즘의 시간 복잡도가 가장 효율적인 것은?",
    options: ["O(n²)", "O(n log n)", "O(n)", "O(log n)", "O(1)"],
    correct: 4,
    explanation: "O(1)은 상수 시간 복잡도로 입력 크기에 관계없이 일정한 시간이 걸리므로 가장 효율적입니다."
  },
  {
    question: "관계형 데이터베이스에서 기본키(Primary Key)의 특징은?",
    options: ["중복 가능", "NULL 값 허용", "유일성과 최소성", "외래키와 동일", "선택적 속성"],
    correct: 2,
    explanation: "기본키는 각 행을 유일하게 식별하는 속성으로 유일성과 최소성을 만족해야 하며, NULL 값을 허용하지 않습니다."
  }
];

export default function CBTPracticePage() {
  const router = useRouter();
  const { subject, emotion, questionCount, timeLimit, showTimer, activityId, difficulty } = router.query;
  
  // 🔥 EmotionStore 완전 연동 (함수명 수정)
  const { 
    currentEmotion, 
    updateFullEmotion,
    shouldTakeBreak,
    getMotivationalMessage,
    startActivity,
    endActivity,
    connectSystem,
    subscribeToEmotionChanges
  } = useEmotionStore();
  
  // 🔥 CBT 설정 상태 추가
  const [settings, setSettings] = useState<CBTSettings>({
    questionCount: parseInt(questionCount as string) || 5,
    timeLimit: parseInt(timeLimit as string) || 10,
    difficulty: difficulty as string || '보통',
    showTimer: showTimer === 'true'
  });
  
  // 🔥 설정 단계 표시 여부
  const [showSettings, setShowSettings] = useState(false);
  
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  
  // 🔥 타이머 상태 추가
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [cbtStartTime, setCbtStartTime] = useState<Date | null>(null);
  const [currentActivityId, setCurrentActivityId] = useState<string>('');
  
  // 🔥 감정 변화 추적
  const [initialEmotion, setInitialEmotion] = useState(currentEmotion);
  const [emotionChanges, setEmotionChanges] = useState<any[]>([]);
  
  const emotionScore = parseFloat(emotion as string) || currentEmotion.score;
  const subjectName = SUBJECT_MAPPING[subject as string] || subject as string;

  // 🔥 EmotionStore 연결 및 감정 변화 구독
  useEffect(() => {
    connectSystem('cbt-practice');
    console.log('🔗 CBT Practice가 감정 모니터링에 연결되었습니다.');
    
    setInitialEmotion(currentEmotion);
    
    const unsubscribe = subscribeToEmotionChanges((emotion) => {
      console.log('🧠 [CBT] 감정 변화 감지:', emotion);
      setEmotionChanges(prev => [...prev, {
        timestamp: new Date().toISOString(),
        emotion,
        questionIndex: currentIndex
      }]);
      
      // 극심한 스트레스 증가 시 알림
      if (emotion.stress > 0.8 && currentEmotion.stress < 0.8) {
        console.log('⚠️ 높은 스트레스 감지 - 휴식 권장');
        if (confirm('스트레스 수준이 높아졌습니다. 잠시 휴식하시겠어요?')) {
          pauseCBT();
        }
      }
    });

    return unsubscribe;
  }, [connectSystem, subscribeToEmotionChanges, currentIndex]);

  // 🔥 문항수 변경 시 시간 자동 조정
  const handleQuestionCountChange = (count: number) => {
    const option = QUESTION_COUNT_OPTIONS.find(opt => opt.value === count);
    setSettings(prev => ({
      ...prev,
      questionCount: count,
      timeLimit: option?.time || count * 2
    }));
  };

  // 🔥 CBT 시작
  const handleStartCBT = async () => {
    setShowSettings(false);
    setCbtStartTime(new Date());
    
    // 🔥 활동 시작 기록
    const id = await startActivity('cbt', { 
      subjectName,
      questionCount: settings.questionCount,
      timeLimit: settings.timeLimit,
      difficulty: settings.difficulty,
      initialEmotion: currentEmotion
    });
    setCurrentActivityId(id);
    
    generateProblems();
    
    if (settings.showTimer) {
      setTimeRemaining(settings.timeLimit * 60);
      setIsTimerActive(true);
    }
  };

  // 🔥 CBT 일시정지
  const pauseCBT = () => {
    setIsTimerActive(false);
    alert('💆‍♀️ 잠시 휴식을 취하세요. 준비되면 계속 버튼을 눌러주세요.');
  };

  // 🔥 CBT 재개
  const resumeCBT = () => {
    if (settings.showTimer) {
      setIsTimerActive(true);
    }
  };

  // 🔥 타이머 효과
  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && isTimerActive) {
      handleFinishCBT();
    }
  }, [isTimerActive, timeRemaining]);

  // 🔥 CBT 종료
  const handleFinishCBT = async () => {
    setIsTimerActive(false);
    
    if (currentActivityId) {
      const finalAccuracy = score.total > 0 ? score.correct / score.total : 0;
      const timeSpent = cbtStartTime ? (new Date().getTime() - cbtStartTime.getTime()) / 1000 : 0;
      
      await endActivity(currentActivityId, finalAccuracy, {
        subjectName,
        totalQuestions: score.total,
        correctAnswers: score.correct,
        accuracy: finalAccuracy,
        timeSpent,
        emotionChanges: emotionChanges.length,
        finalEmotion: currentEmotion,
        usingFallback
      });
      
      // 🔥 최종 감정 상태 기록 (로컬스토리지)
      try {
        const finalEmotionRecord = {
          id: `cbt-final-${Date.now()}`,
          timestamp: new Date().toISOString(),
          emotionScore: currentEmotion.score,
          stressLevel: currentEmotion.stress,
          focusLevel: currentEmotion.focus,
          confidenceLevel: currentEmotion.confidence,
          activity: `CBT 완료 - ${subjectName}`,
          activityDetails: {
            accuracy: finalAccuracy,
            totalQuestions: score.total,
            correctAnswers: score.correct,
            timeSpent
          }
        };
        
        const existing = localStorage.getItem('certcafe_emotion_final');
        const records = existing ? JSON.parse(existing) : [];
        records.unshift(finalEmotionRecord);
        
        if (records.length > 20) {
          records.splice(20);
        }
        
        localStorage.setItem('certcafe_emotion_final', JSON.stringify(records));
        console.log('✅ 최종 감정 기록 저장');
      } catch (error) {
        console.error('❌ 최종 감정 기록 실패:', error);
      }
    }
    
    setShowExplanation(true);
  };

  // 🔥 시간 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 완전 방어적 CBT 문제 생성
  const generateProblems = async () => {
    if (!subject) {
      console.log('❌ subject가 없습니다');
      setError('과목 정보가 없습니다');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    setUsingFallback(false);
    
    try {
      console.log('🚀 CBT API 호출 시작:', { 
        subject: subjectName, 
        emotion: emotionScore,
        questionCount: settings.questionCount,
        difficulty: settings.difficulty
      });
      
      const requestBody = {
        subject: subjectName,
        difficulty: currentEmotion.confidence >= 0.7 ? '어려움' : 
                   currentEmotion.confidence >= 0.4 ? '보통' : '쉬움',
        count: settings.questionCount,
        emotionData: {
          score: currentEmotion.score,
          stress: currentEmotion.stress,
          focus: currentEmotion.focus,
          confidence: currentEmotion.confidence
        }
      };
      
      console.log('📤 요청 데이터:', requestBody);
      
      const response = await fetch('/api/cbt/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 API 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API 응답 오류:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`API 오류 (${response.status}): ${errorText.substring(0, 200)}`);
      }

      let data;
      try {
        const responseText = await response.text();
        console.log('📄 원본 응답 텍스트:', responseText.substring(0, 500));
        data = JSON.parse(responseText);
        console.log('✅ JSON 파싱 성공:', data);
      } catch (parseError) {
        console.error('❌ JSON 파싱 실패:', parseError);
        throw new Error('서버 응답을 파싱할 수 없습니다');
      }
      
      // 응답 구조 안전하게 확인
      console.log('🔍 응답 구조 검사:', {
        hasSuccess: 'success' in data,
        success: data.success,
        hasProblems: 'problems' in data,
        problemsType: typeof data.problems,
        problemsIsArray: Array.isArray(data.problems),
        problemsLength: data.problems?.length
      });
      
      if (!data.success) {
        console.error('❌ API가 실패를 반환:', data.error || data.message);
        throw new Error(data.error || data.message || 'API 처리 실패');
      }
      
      if (!data.problems || !Array.isArray(data.problems)) {
        console.error('❌ 문제 배열이 없음:', data.problems);
        throw new Error('문제 데이터가 올바르지 않습니다');
      }
      
      if (data.problems.length === 0) {
        console.error('❌ 빈 문제 배열');
        throw new Error('생성된 문제가 없습니다');
      }

      // 각 문제 구조 검증
      const validProblems = data.problems.filter((problem: any, index: number) => {
        const isValid = problem && 
          typeof problem.question === 'string' &&
          Array.isArray(problem.options) &&
          problem.options.length === 5 &&
          typeof problem.correct === 'number' &&
          problem.correct >= 0 && problem.correct <= 4 &&
          typeof problem.explanation === 'string';
        
        if (!isValid) {
          console.warn(`⚠️ 문제 ${index + 1} 구조 오류:`, problem);
        }
        
        return isValid;
      });

      if (validProblems.length === 0) {
        console.error('❌ 유효한 문제가 없음');
        throw new Error('유효한 문제가 생성되지 않았습니다');
      }

      console.log(`✅ 성공: ${validProblems.length}개 문제 로드됨`);
      setProblems(validProblems);
      setCurrentIndex(0);
      setScore({ correct: 0, total: 0 });
      
    } catch (error: any) {
      console.error('💥 CBT 생성 전체 오류:', error);
      
      // Fallback 문제 사용
      console.log('🔄 Fallback 문제로 전환');
      setProblems(FALLBACK_PROBLEMS.slice(0, settings.questionCount));
      setCurrentIndex(0);
      setScore({ correct: 0, total: 0 });
      setUsingFallback(true);
      setError(`AI 문제 생성 실패 (${error.message}). 기본 문제로 연습합니다.`);
      
    } finally {
      setLoading(false);
    }
  };

  // 🔥 답안 제출 (감정 추적 포함)
  const handleSubmit = async () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === problems[currentIndex].correct;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    // 🔥 정답/오답에 따른 감정 업데이트 (함수명 수정)
    try {
      const newScore = isCorrect ? 
        Math.min(1.0, currentEmotion.score + 0.1) : 
        Math.max(0.0, currentEmotion.score - 0.05);
      
      updateFullEmotion({
        score: newScore,
        stress: currentEmotion.stress,
        focus: currentEmotion.focus,
        confidence: isCorrect ? 
          Math.min(1.0, currentEmotion.confidence + 0.05) : 
          Math.max(0.0, currentEmotion.confidence - 0.03)
      });
      
      console.log('✅ 감정 상태 업데이트:', { isCorrect, newScore });
    } catch (error) {
      console.error('❌ 감정 업데이트 실패:', error);
    }
    
    // 🔥 문제별 감정 상태 기록 (로컬스토리지)
    try {
      const emotionRecord = {
        id: `cbt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        emotionScore: currentEmotion.score,
        stressLevel: currentEmotion.stress,
        focusLevel: currentEmotion.focus,
        confidenceLevel: currentEmotion.confidence,
        activity: `CBT 문제 ${currentIndex + 1}`,
        activityDetails: {
          subjectName,
          questionIndex: currentIndex,
          isCorrect,
          selectedAnswer,
          correctAnswer: problems[currentIndex].correct
        }
      };
      
      const existing = localStorage.getItem('certcafe_cbt_sessions');
      const sessions = existing ? JSON.parse(existing) : [];
      sessions.unshift(emotionRecord);
      
      if (sessions.length > 50) {
        sessions.splice(50);
      }
      
      localStorage.setItem('certcafe_cbt_sessions', JSON.stringify(sessions));
      console.log('✅ CBT 세션 기록 저장');
    } catch (error) {
      console.error('❌ CBT 세션 기록 실패:', error);
    }
    
    setShowExplanation(true);
  };

  // 다음 문제
  const nextProblem = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  // 🔥 감정 기반 격려 메시지 (EmotionStore 연동)
  const getEncouragementMessage = () => {
    const accuracy = score.total > 0 ? score.correct / score.total : 0;
    
    if (currentEmotion.stress > 0.7) {
      return "🤗 스트레스가 높아 보이네요. 깊게 호흡하고 천천히 해보세요.";
    }
    
    if (currentEmotion.focus < 0.4) {
      return "😵‍💫 집중도가 낮습니다. 잠시 휴식이 필요할 수 있어요.";
    }
    
    if (currentEmotion.confidence > 0.7 && accuracy >= 0.8) {
      return "🔥 자신감과 실력이 모두 뛰어나네요! 이대로 계속하세요!";
    }
    
    if (accuracy >= 0.8) {
      return "👏 정답률이 높아요! 실력이 늘고 있습니다!";
    }
    
    if (accuracy >= 0.6) {
      return "😊 좋은 흐름이에요! 조금만 더 집중해보세요!";
    }
    
    return getMotivationalMessage(); // EmotionStore의 메시지 사용
  };

  // 🔥 현재 컨디션 분석
  const getCurrentConditionAnalysis = () => {
    const { score: mood, stress, focus, confidence } = currentEmotion;
    
    if (stress > 0.7) return { color: 'text-red-600', message: '⚠️ 높은 스트레스', icon: '😰' };
    if (focus < 0.4) return { color: 'text-orange-600', message: '⚠️ 집중력 저하', icon: '😵‍💫' };
    if (mood > 0.7 && focus > 0.7) return { color: 'text-green-600', message: '✨ 최상 컨디션', icon: '🔥' };
    if (mood > 0.5) return { color: 'text-blue-600', message: '😊 좋은 상태', icon: '😊' };
    return { color: 'text-gray-600', message: '😐 보통 상태', icon: '😐' };
  };

  // 초기 로딩 시 설정 확인
  useEffect(() => {
    if (subject && !showSettings && problems.length === 0) {
      if (questionCount && timeLimit) {
        // URL 파라미터로 설정이 전달된 경우 바로 시작
        handleStartCBT();
      } else {
        // 설정이 없으면 설정 화면 표시
        setShowSettings(true);
      }
    }
  }, [subject, questionCount, timeLimit]);

  // 🔥 CBT 설정 화면
  if (showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          
          {/* 헤더 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center">
              <Link href="/cbt" className="text-blue-600 hover:text-blue-800 transition-colors">
                ← 과목 선택으로
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                🎯 {subjectName} CBT 설정
              </h1>
              <div></div>
            </div>
          </div>

          {/* 🧠 실시간 감정 분석 카드 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              🧠 실시간 감정 분석 결과
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl mb-1">
                  {currentEmotion.score > 0.6 ? '😊' : currentEmotion.score < 0.4 ? '😔' : '😐'}
                </div>
                <div className="text-xs text-gray-600">기분</div>
                <div className="text-sm font-bold text-blue-600">{Math.round(currentEmotion.score * 100)}%</div>
              </div>
              
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xl mb-1">
                  {currentEmotion.stress < 0.3 ? '😌' : currentEmotion.stress > 0.7 ? '😰' : '😅'}
                </div>
                <div className="text-xs text-gray-600">스트레스</div>
                <div className="text-sm font-bold text-red-600">{Math.round(currentEmotion.stress * 100)}%</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl mb-1">
                  {currentEmotion.focus > 0.7 ? '🎯' : currentEmotion.focus < 0.4 ? '😵‍💫' : '🤔'}
                </div>
                <div className="text-xs text-gray-600">집중도</div>
                <div className="text-sm font-bold text-green-600">{Math.round(currentEmotion.focus * 100)}%</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl mb-1">
                  {currentEmotion.confidence > 0.7 ? '💪' : currentEmotion.confidence < 0.4 ? '😰' : '🤞'}
                </div>
                <div className="text-xs text-gray-600">자신감</div>
                <div className="text-sm font-bold text-purple-600">{Math.round(currentEmotion.confidence * 100)}%</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg text-center">
              <div className="font-semibold">💬 Claude AI 추천: {getMotivationalMessage()}</div>
            </div>
          </div>

          {/* 설정 폼 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              📋 CBT 모의고사 설정
            </h2>

            {/* 문항수 선택 */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                문항수 선택 
                <span className="text-blue-600 ml-1">
                  (추천: {currentEmotion.focus < 0.4 ? '5문항' : currentEmotion.focus < 0.7 ? '10-20문항' : '20문항 이상'})
                </span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {QUESTION_COUNT_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleQuestionCountChange(option.value)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      settings.questionCount === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-lg mb-1">{option.value}문항</div>
                    <div className="text-sm text-gray-600 mb-1">{option.description}</div>
                    <div className="text-xs text-gray-500">
                      예상 시간: {option.time}분
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 시간 설정 */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시험 시간: <span className="text-blue-600 font-bold">{settings.timeLimit}분</span>
              </label>
              <input
                type="range"
                min="5"
                max="240"
                step="5"
                value={settings.timeLimit}
                onChange={(e) => setSettings(prev => ({ ...prev, timeLimit: Number(e.target.value) }))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>5분</span>
                <span>240분 (4시간)</span>
              </div>
            </div>

            {/* 타이머 표시 여부 */}
            <div className="mb-8">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.showTimer}
                  onChange={(e) => setSettings(prev => ({ ...prev, showTimer: e.target.checked }))}
                  className="mr-3 w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">타이머 표시</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">실제 시험과 같은 시간 제한 환경</p>
            </div>

            {/* 설정 요약 */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-8">
              <h3 className="font-semibold text-blue-800 mb-2">📋 CBT 설정 요약</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>자격증: <span className="font-medium">{subjectName}</span></div>
                <div>문항수: <span className="font-medium text-blue-600">{settings.questionCount}문항</span></div>
                <div>시험시간: <span className="font-medium text-blue-600">{settings.timeLimit}분</span></div>
                <div>현재 컨디션: <span className={`font-medium ${getCurrentConditionAnalysis().color}`}>
                  {getCurrentConditionAnalysis().icon} {getCurrentConditionAnalysis().message}
                </span></div>
              </div>
            </div>

            {/* 휴식 권장 경고 */}
            {shouldTakeBreak() && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
                <div className="flex items-center text-red-700">
                  <span className="text-xl mr-2">⚠️</span>
                  <div>
                    <div className="font-semibold">휴식을 권장합니다</div>
                    <div className="text-sm">현재 스트레스가 높거나 집중도가 낮습니다. 5-10분 휴식 후 더 좋은 성과를 낼 수 있어요.</div>
                  </div>
                </div>
              </div>
            )}

            {/* 시작 버튼 */}
            <button
              onClick={handleStartCBT}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 ${
                shouldTakeBreak() 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white'
              }`}
            >
              🚀 {shouldTakeBreak() ? '⚠️ 휴식 권장 (계속하려면 클릭)' : `${subjectName} CBT 모의고사 시작`}
              <div className="text-sm mt-1">({settings.questionCount}문항, {settings.timeLimit}분)</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            🤖 Claude AI가 {subjectName} 문제를 생성하고 있습니다
          </h2>
          <p className="text-gray-600 mb-2">
            {settings.questionCount}문항의 문제를 준비하고 있습니다...
          </p>
          <div className="text-sm text-blue-600">
            현재 컨디션: {getCurrentConditionAnalysis().icon} {getCurrentConditionAnalysis().message}
          </div>
        </div>
      </div>
    );
  }

  // 오류 상태
  if (error && problems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-6xl mb-4">😅</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">문제 생성 실패</h2>
          {error && (
            <p className="text-red-600 text-sm mb-6 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </p>
          )}
          <div className="space-y-3">
            <button 
              onClick={() => setShowSettings(true)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ⚙️ 설정으로 돌아가기
            </button>
            <Link href="/cbt">
              <button className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors">
                ← 과목 선택으로 돌아가기
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (problems.length === 0) return null;

  const currentProblem = problems[currentIndex];
  const isLastProblem = currentIndex === problems.length - 1;
  const progressPercent = ((currentIndex + 1) / problems.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        
        {/* 헤더 (타이머 추가) */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link href="/cbt" className="text-blue-600 hover:text-blue-800 transition-colors">
              ← 과목 선택으로
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                📝 {subjectName} CBT
              </h1>
              {usingFallback && (
                <p className="text-sm text-orange-600 mt-1">⚠️ 기본 문제로 연습 중</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {currentIndex + 1} / {problems.length}
              </div>
              {/* 🔥 타이머 표시 */}
              {settings.showTimer && isTimerActive && (
                <div className={`px-3 py-1 rounded text-sm font-medium ${
                  timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  ⏰ {formatTime(timeRemaining)}
                </div>
              )}
              {/* 🔥 일시정지 버튼 */}
              {isTimerActive && (
                <button
                  onClick={pauseCBT}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200"
                >
                  ⏸️ 일시정지
                </button>
              )}
              {!isTimerActive && settings.showTimer && (
                <button
                  onClick={resumeCBT}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                >
                  ▶️ 재개
                </button>
              )}
            </div>
          </div>
          
          {/* 진행률 바 */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          
          {/* 🔥 실시간 상태 (EmotionStore 연동) */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                정답률: <span className="font-bold text-blue-600">{score.total > 0 ? ((score.correct / score.total) * 100).toFixed(1) : 0}%</span>
              </span>
              <span className={`font-medium ${getCurrentConditionAnalysis().color}`}>
                컨디션: {getCurrentConditionAnalysis().icon} {getCurrentConditionAnalysis().message}
              </span>
            </div>
            {score.total > 0 && (
              <span className="text-green-600 font-medium">
                {getEncouragementMessage()}
              </span>
            )}
          </div>
          
          {/* 🔥 감정 변화 추적 */}
          {emotionChanges.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              감정 변화: {emotionChanges.length}회 기록됨
            </div>
          )}
        </div>

        {/* 기존 문제 풀이 화면 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {/* 문제 내용 */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
              {currentProblem.question}
            </h2>
          </div>

          {/* 선택지 */}
          <div className="space-y-4 mb-8">
            {currentProblem.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showExplanation && setSelectedAnswer(index)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  showExplanation
                    ? index === currentProblem.correct
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : selectedAnswer === index && index !== currentProblem.correct
                      ? 'border-red-500 bg-red-50 text-red-800'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                    : selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-bold mr-4 text-lg">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-lg">{option}</span>
                  </div>
                  {showExplanation && index === currentProblem.correct && (
                    <span className="text-green-600 text-xl">✓</span>
                  )}
                  {showExplanation && selectedAnswer === index && index !== currentProblem.correct && (
                    <span className="text-red-600 text-xl">✗</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* 해설 */}
          {showExplanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-blue-900 mb-3 text-lg">
                💡 {usingFallback ? '기본' : 'Claude AI'} 해설
              </h3>
              <p className="text-blue-800 leading-relaxed text-lg">
                {currentProblem.explanation}
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowSettings(true)}
              className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-colors"
            >
              ⚙️ 설정 변경
            </button>
            
            <div className="space-x-4">
              {!showExplanation ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
                >
                  답안 제출
                </button>
              ) : (
                <button
                  onClick={nextProblem}
                  className={`px-8 py-3 rounded-xl text-lg font-semibold transition-colors ${
                    isLastProblem
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isLastProblem ? '🎯 완료' : '다음 문제 →'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 🔥 최종 결과 (감정 변화 포함) */}
        {isLastProblem && showExplanation && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
            <h2 className="text-3xl font-bold text-center mb-8">🎉 CBT 완료!</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="bg-white bg-opacity-20 p-6 rounded-xl text-center">
                <div className="text-4xl font-bold mb-2">{score.correct}/{score.total}</div>
                <div className="text-blue-100">정답 수</div>
              </div>
              <div className="bg-white bg-opacity-20 p-6 rounded-xl text-center">
                <div className="text-4xl font-bold mb-2">
                  {((score.correct / score.total) * 100).toFixed(1)}%
                </div>
                <div className="text-blue-100">정답률</div>
              </div>
              <div className="bg-white bg-opacity-20 p-6 rounded-xl text-center">
                <div className="text-4xl font-bold mb-2">{settings.questionCount}</div>
                <div className="text-blue-100">총 문항</div>
              </div>
              <div className="bg-white bg-opacity-20 p-6 rounded-xl text-center">
                <div className="text-4xl font-bold mb-2">{emotionChanges.length}</div>
                <div className="text-blue-100">감정 변화</div>
              </div>
              <div className="bg-white bg-opacity-20 p-6 rounded-xl text-center">
                <div className="text-4xl font-bold mb-2">
                  {getCurrentConditionAnalysis().icon}
                </div>
                <div className="text-blue-100">최종 컨디션</div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold mb-6">
                {getEncouragementMessage()}
              </p>
              <div className="space-x-4">
                <button 
                  onClick={() => setShowSettings(true)}
                  className="bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
                >
                  🔄 다시 도전하기
                </button>
                <Link href="/cbt">
                  <button className="bg-blue-800 text-white px-6 py-3 rounded-xl hover:bg-blue-900 transition-colors font-semibold">
                    📚 다른 과목 선택
                  </button>
                </Link>
                <Link href="/emotion">
                  <button className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors font-semibold">
                    🧠 감정 대시보드 보기
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}