// src/pages/cbt/index.tsx - 완성된 20개 자격증 + 이모션스코어 연동 + 최적화

import { useEmotionStore } from '@/store/emotionStore';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Subject {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  questionCount: number;
  topics: string[];
  color: string;
  rank: number;
  category: string;
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

// 🎯 완성된 20개 인기 자격증 데이터 (이모션스코어 기반 최적화)
const subjects: Subject[] = [
  {
    id: 'korean-history',
    name: '한국사능력검정시험',
    description: '한국사에 대한 종합적 이해도를 검정하는 국가 공인 시험',
    difficulty: 'intermediate',
    estimatedTime: 25,
    questionCount: 5,
    topics: ['선사~통일신라', '고려시대', '조선시대', '일제강점기', '현대사'],
    color: '#4f46e5',
    rank: 1,
    category: '교양'
  },
  {
    id: 'computer-applications-1',
    name: '컴퓨터활용능력 1급',
    description: 'Excel, PowerPoint, Access 등 Office 프로그램 활용 능력을 평가하는 국가기술자격증',
    difficulty: 'intermediate',
    estimatedTime: 25,
    questionCount: 5,
    topics: ['Excel 함수', 'PowerPoint 기능', 'Access 데이터베이스', '컴퓨터 일반'],
    color: '#3b82f6',
    rank: 2,
    category: 'IT'
  },
  {
    id: 'real-estate-agent',
    name: '공인중개사',
    description: '부동산 중개업무 전문가 양성을 위한 국가자격증',
    difficulty: 'advanced',
    estimatedTime: 40,
    questionCount: 5,
    topics: ['부동산학개론', '민법', '부동산공법', '중개업법', '공시법'],
    color: '#f97316',
    rank: 3,
    category: '부동산'
  },
  {
    id: 'info-processing',
    name: '정보처리기사',
    description: '정보시스템 개발 및 운영에 필요한 실무능력을 평가',
    difficulty: 'advanced',
    estimatedTime: 40,
    questionCount: 5,
    topics: ['소프트웨어 설계', '데이터베이스', '프로그래밍 언어', '정보시스템'],
    color: '#6366f1',
    rank: 4,
    category: 'IT'
  },
  {
    id: 'industrial-safety',
    name: '산업안전기사',
    description: '산업현장의 안전관리 전문가 양성을 위한 국가기술자격증',
    difficulty: 'advanced',
    estimatedTime: 35,
    questionCount: 5,
    topics: ['안전관리론', '인간공학', '시스템안전공학', '안전보건법규'],
    color: '#dc2626',
    rank: 5,
    category: '건설/안전'
  },
  {
    id: 'craftsman-cook',
    name: '조리기능사',
    description: '한식, 양식, 중식, 일식 조리 기능을 평가하는 국가기술자격증',
    difficulty: 'beginner',
    estimatedTime: 20,
    questionCount: 5,
    topics: ['식품학', '조리이론', '위생관리', '영양학'],
    color: '#16a34a',
    rank: 6,
    category: '조리/식품'
  },
  {
    id: 'accounting-tax',
    name: '전산세무회계',
    description: '세무회계 업무의 전산화 능력을 평가하는 민간자격증',
    difficulty: 'intermediate',
    estimatedTime: 30,
    questionCount: 5,
    topics: ['부가세', '소득세', '법인세', '전산회계'],
    color: '#059669',
    rank: 7,
    category: '회계/세무'
  },
  {
    id: 'social-worker',
    name: '사회복지사 1급',
    description: '사회복지 전문가로서의 자질과 능력을 검정하는 국가자격증',
    difficulty: 'intermediate',
    estimatedTime: 35,
    questionCount: 5,
    topics: ['사회복지개론', '사회복지정책론', '사회복지실천론', '사회복지법제론'],
    color: '#7c3aed',
    rank: 8,
    category: '사회복지'
  },
  {
    id: 'forklift-operator',
    name: '지게차운전기능사',
    description: '지게차 운전 및 안전관리 능력을 평가하는 국가기술자격증',
    difficulty: 'beginner',
    estimatedTime: 15,
    questionCount: 5,
    topics: ['지게차구조', '운전기능', '안전관리', '관련법규'],
    color: '#ea580c',
    rank: 9,
    category: '운전/기계'
  },
  {
    id: 'korean-cuisine',
    name: '한식조리기능사',
    description: '한국 전통음식 조리 기능을 평가하는 국가기술자격증',
    difficulty: 'beginner',
    estimatedTime: 20,
    questionCount: 5,
    topics: ['한국조리', '식품학', '조리이론', '위생관리'],
    color: '#be185d',
    rank: 10,
    category: '조리/식품'
  },
  {
    id: 'electrical-craftsman',
    name: '전기기능사',
    description: '전기설비 설치 및 유지보수 능력을 평가하는 국가기술자격증',
    difficulty: 'intermediate',
    estimatedTime: 30,
    questionCount: 5,
    topics: ['전기이론', '전기기기', '전력공학', '전기설비'],
    color: '#0891b2',
    rank: 11,
    category: '전기/전자'
  },
  {
    id: 'confectionery',
    name: '제과기능사',
    description: '제과제빵 기술과 이론을 평가하는 국가기술자격증',
    difficulty: 'beginner',
    estimatedTime: 25,
    questionCount: 5,
    topics: ['제과이론', '재료학', '위생관리', '제과실무'],
    color: '#c2410c',
    rank: 12,
    category: '조리/식품'
  },
  {
    id: 'bakery',
    name: '제빵기능사',
    description: '제빵 기술과 이론을 평가하는 국가기술자격증',
    difficulty: 'beginner',
    estimatedTime: 25,
    questionCount: 5,
    topics: ['제빵이론', '재료학', '위생관리', '제빵실무'],
    color: '#a16207',
    rank: 13,
    category: '조리/식품'
  },
  {
    id: 'electrical-engineer',
    name: '전기기사',
    description: '전기공학 전문지식과 실무능력을 평가하는 국가기술자격증',
    difficulty: 'advanced',
    estimatedTime: 40,
    questionCount: 5,
    topics: ['전력공학', '전기기기', '제어공학', '전기설비기술기준'],
    color: '#1e40af',
    rank: 14,
    category: '전기/전자'
  },
  {
    id: 'word-processor',
    name: '워드프로세서',
    description: '문서작성 및 편집 능력을 평가하는 국가기술자격증',
    difficulty: 'beginner',
    estimatedTime: 15,
    questionCount: 5,
    topics: ['워드프로세싱 실무', '컴퓨터 일반', '문서편집', '표작성'],
    color: '#4338ca',
    rank: 15,
    category: 'IT'
  },
  {
    id: 'computer-applications-2',
    name: '컴퓨터활용능력 2급',
    description: 'Excel, PowerPoint 등 기본적인 Office 활용 능력을 평가',
    difficulty: 'beginner',
    estimatedTime: 20,
    questionCount: 5,
    topics: ['Excel 기초', 'PowerPoint 기초', '컴퓨터 일반', '인터넷 활용'],
    color: '#7c2d12',
    rank: 16,
    category: 'IT'
  },
  {
    id: 'beautician',
    name: '미용사(일반)',
    description: '헤어 미용 기술과 이론을 평가하는 국가기술자격증',
    difficulty: 'intermediate',
    estimatedTime: 30,
    questionCount: 5,
    topics: ['모발학', '미용기법', '두피관리', '염색학'],
    color: '#be123c',
    rank: 17,
    category: '서비스'
  },
  {
    id: 'construction-safety',
    name: '건설안전기사',
    description: '건설현장의 안전관리 전문가 양성을 위한 국가기술자격증',
    difficulty: 'advanced',
    estimatedTime: 35,
    questionCount: 5,
    topics: ['건설안전관리론', '건설시공학', '안전보건법규', '위험성평가'],
    color: '#dc2626',
    rank: 18,
    category: '건설/안전'
  },
  {
    id: 'hazardous-materials',
    name: '위험물산업기사',
    description: '위험물 취급 및 관리에 필요한 지식과 기술을 평가',
    difficulty: 'intermediate',
    estimatedTime: 30,
    questionCount: 5,
    topics: ['위험물화학', '위험물법령', '화재예방', '안전관리'],
    color: '#b91c1c',
    rank: 19,
    category: '건설/안전'
  },
  {
    id: 'western-cuisine',
    name: '양식조리기능사',
    description: '서양식 조리 기능을 평가하는 국가기술자격증',
    difficulty: 'beginner',
    estimatedTime: 20,
    questionCount: 5,
    topics: ['양식조리', '식품학', '조리이론', '위생관리'],
    color: '#15803d',
    rank: 20,
    category: '조리/식품'
  }
];

export default function CBTSubjectSelector() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🔥 CBT 설정 상태 추가
  const [settings, setSettings] = useState<CBTSettings>({
    questionCount: 20,  // 기본값 20문항
    timeLimit: 40,      // 기본값 40분
    difficulty: '보통',
    showTimer: true
  });
  
  // 🔥 설정 단계 표시 여부
  const [showSettings, setShowSettings] = useState(false);
  
  // EmotionStore 연동
  const { 
    currentEmotion, 
    getCBTDifficulty, 
    startActivity, 
    getMotivationalMessage,
    shouldTakeBreak,
    updateFullEmotion,
    connectSystem
  } = useEmotionStore();

  useEffect(() => {
    connectSystem('cbt');
    console.log('🔗 CBT 시스템이 감정 모니터링에 연결되었습니다.');
  }, [connectSystem]);

  const categories = ['전체', 'IT', '건설/안전', '전기/전자', '조리/식품', '교양', '부동산', '운전/기계', '서비스', '사회복지', '회계/세무'];

  // 🚀 성능 최적화: useMemo로 필터링 최적화
  const filteredSubjects = useMemo(() => {
    return subjects.filter(subject => {
      const matchesCategory = selectedCategory === '전체' || subject.category === selectedCategory;
      const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           subject.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => a.rank - b.rank);
  }, [selectedCategory, searchTerm]);

  // 🔥 문항수 변경 시 시간 자동 조정
  const handleQuestionCountChange = (count: number) => {
    const option = QUESTION_COUNT_OPTIONS.find(opt => opt.value === count);
    setSettings(prev => ({
      ...prev,
      questionCount: count,
      timeLimit: option?.time || count * 2
    }));
  };

  // 🔥 과목 선택 후 설정 화면 표시
  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowSettings(true);
  };

  // 🔥 CBT 시작 (이모션스코어 기반 추천 + 사용자 선택권 존중)
  const handleStartCBT = async () => {
    if (!selectedSubject) return;
    
    // 🧠 감정 상태 기반 추천 (강제하지 않음)
    const emotionRecommendation = {
      questionCount: currentEmotion.focus < 0.4 ? 5 : currentEmotion.focus < 0.7 ? 10 : 20,
      difficulty: getCBTDifficulty(),
      message: currentEmotion.stress > 0.7 ? 
        "높은 스트레스가 감지되었지만, 원하신다면 계속 진행하세요!" : 
        currentEmotion.focus < 0.4 ? 
        "집중도가 낮지만, 도전하고 싶으시면 계속하세요!" :
        "좋은 컨디션이네요! 마음껏 도전해보세요!"
    };
    
    // 💪 사용자 의지 존중 - 경고만 표시하고 강제하지 않음
    if (shouldTakeBreak()) {
      const userChoice = confirm(
        `🧠 AI 분석 결과:\n` +
        `• 스트레스: ${Math.round(currentEmotion.stress * 100)}%\n` +
        `• 집중도: ${Math.round(currentEmotion.focus * 100)}%\n` +
        `• 추천 문항수: ${emotionRecommendation.questionCount}문항\n\n` +
        `${emotionRecommendation.message}\n\n` +
        `✋ 잠시 휴식을 취하시겠어요?\n` +
        `(아니오를 누르면 원하는 설정으로 CBT를 계속 진행합니다)`
      );
      
      if (userChoice) {
        alert('💆‍♀️ 5-10분 휴식 후 더 좋은 컨디션으로 도전해보세요! 🌟');
        return;
      }
      // 사용자가 "아니오"를 선택하면 계속 진행
      console.log('💪 사용자가 휴식 권장을 거부하고 CBT 계속 진행을 선택');
    }
    
    // 활동 시작 추적
    const activityId = await startActivity('cbt', { 
      subjectId: selectedSubject.id,
      subjectName: selectedSubject.name,
      questionCount: settings.questionCount, // 🔥 사용자가 선택한 문항수 사용
      timeLimit: settings.timeLimit,
      originalDifficulty: selectedSubject.difficulty,
      recommendedDifficulty: emotionRecommendation.difficulty,
      emotionScore: currentEmotion.score,
      stressLevel: currentEmotion.stress,
      focusLevel: currentEmotion.focus,
      confidenceLevel: currentEmotion.confidence,
      userOverrodeRecommendation: shouldTakeBreak() // 사용자가 추천을 무시했는지 기록
    });
    
    console.log(`🎯 CBT 시작 - ${selectedSubject.name} (사용자 선택: ${settings.questionCount}문항, AI 추천: ${emotionRecommendation.questionCount}문항)`);
    
    // 설정값을 쿼리 파라미터로 전달
    router.push({
      pathname: '/cbt/practice',
      query: { 
        subject: selectedSubject.id,
        questionCount: settings.questionCount, // 🔥 사용자 선택 존중
        timeLimit: settings.timeLimit,
        showTimer: settings.showTimer,
        activityId: activityId,
        emotion: currentEmotion.score,
        difficulty: emotionRecommendation.difficulty
      }
    });
  };

  const getDifficultyText = (difficulty: Subject['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
    }
  };

  const getDifficultyColor = (difficulty: Subject['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
    }
  };

  // 🧠 감정 상태 기반 추천 정보
  const getRecommendedDifficultyInfo = () => {
    const recommended = getCBTDifficulty();
    const colors = {
      easy: { bg: '#f0fdf4', text: '#16a34a', label: '쉬움' },
      normal: { bg: '#fef3c7', text: '#d97706', label: '보통' },
      hard: { bg: '#fef2f2', text: '#dc2626', label: '어려움' }
    };
    return colors[recommended];
  };

  // 🧠 감정 기반 맞춤 메시지
  const getPersonalizedMessage = () => {
    const { score, stress, focus, confidence } = currentEmotion;
    
    if (stress > 0.7) return '😰 스트레스가 높습니다. 심호흡을 하고 차분히 시작해보세요.';
    if (focus < 0.4) return '😵‍💫 집중도가 낮습니다. 짧은 시간 집중해서 풀어보세요.';
    if (confidence < 0.3) return '🤗 자신감을 가지세요! 쉬운 문제부터 차근차근 해보아요.';
    if (score > 0.8 && focus > 0.7) return '🔥 최고의 컨디션이네요! 도전적인 문제에 도전해보세요!';
    if (score > 0.6) return '😊 좋은 상태입니다. 꾸준히 문제를 풀어보세요!';
    return '💪 오늘도 열심히 공부해보아요!';
  };

  // 🔥 CBT 설정 화면
  if (showSettings && selectedSubject) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* 헤더 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '25px',
            marginBottom: '30px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  color: '#3b82f6',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ← 과목 선택으로
              </button>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                🎯 {selectedSubject.name} CBT 설정
              </h1>
              <div></div>
            </div>
          </div>

          {/* 🧠 실시간 감정 분석 카드 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '15px', color: '#1f2937' }}>
              🧠 실시간 감정 분석 결과
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
              gap: '10px', 
              marginBottom: '15px' 
            }}>
              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                <div style={{ fontSize: '1rem', marginBottom: '3px' }}>
                  {currentEmotion.score > 0.6 ? '😊' : currentEmotion.score < 0.4 ? '😔' : '😐'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>기분</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#3b82f6' }}>
                  {Math.round(currentEmotion.score * 100)}%
                </div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                <div style={{ fontSize: '1rem', marginBottom: '3px' }}>
                  {currentEmotion.stress < 0.3 ? '😌' : currentEmotion.stress > 0.7 ? '😰' : '😅'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>스트레스</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ef4444' }}>
                  {Math.round(currentEmotion.stress * 100)}%
                </div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                <div style={{ fontSize: '1rem', marginBottom: '3px' }}>
                  {currentEmotion.focus > 0.7 ? '🎯' : currentEmotion.focus < 0.4 ? '😵‍💫' : '🤔'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>집중도</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#10b981' }}>
                  {Math.round(currentEmotion.focus * 100)}%
                </div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                <div style={{ fontSize: '1rem', marginBottom: '3px' }}>
                  {currentEmotion.confidence > 0.7 ? '💪' : currentEmotion.confidence < 0.4 ? '😰' : '🤞'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>자신감</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {Math.round(currentEmotion.confidence * 100)}%
                </div>
              </div>
            </div>
            <div style={{
              padding: '10px',
              backgroundColor: '#f0f9ff',
              borderRadius: '6px',
              textAlign: 'center',
              fontSize: '0.9rem',
              color: '#0369a1'
            }}>
              💬 {getPersonalizedMessage()}
            </div>
          </div>

          {/* 설정 폼 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '30px'
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '25px', color: '#1f2937' }}>
              📋 CBT 모의고사 설정
            </h2>

            {/* 문항수 선택 */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                문항수 선택
                <div className="mt-1 text-sm">
                  <span className="text-blue-600">
                    💡 AI 추천: {currentEmotion.focus < 0.4 ? '5문항 (집중도 낮음)' : currentEmotion.focus < 0.7 ? '10-20문항 (보통)' : '20문항 이상 (좋은 컨디션)'}
                  </span>
                  <span className="text-gray-500 ml-2">• 하지만 원하는 만큼 선택하세요!</span>
                </div>
              </label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px' 
              }}>
                {QUESTION_COUNT_OPTIONS.map(option => {
                  const isRecommended = (
                    (currentEmotion.focus < 0.4 && option.value === 5) ||
                    (currentEmotion.focus >= 0.4 && currentEmotion.focus < 0.7 && [10, 20].includes(option.value)) ||
                    (currentEmotion.focus >= 0.7 && option.value >= 20)
                  );
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleQuestionCountChange(option.value)}
                      style={{
                        padding: '15px',
                        borderRadius: '8px',
                        border: settings.questionCount === option.value ? '2px solid #3b82f6' : 
                               isRecommended ? '2px solid #10b981' : '2px solid #e5e7eb',
                        backgroundColor: settings.questionCount === option.value ? '#eff6ff' : 
                                        isRecommended ? '#f0fdf4' : 'white',
                        color: settings.questionCount === option.value ? '#1d4ed8' : 
                               isRecommended ? '#059669' : '#374151',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.3s',
                        position: 'relative'
                      }}
                    >
                      {isRecommended && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          fontSize: '12px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '10px'
                        }}>
                          AI 추천
                        </div>
                      )}
                      <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '5px' }}>
                        {option.value}문항
                      </div>
                      <div style={{ fontSize: '0.8rem', marginBottom: '3px' }}>
                        {option.description}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        예상 시간: {option.time}분
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💪 <strong>본인의 의지가 가장 중요합니다!</strong> AI 추천과 다르게 선택해도 괜찮아요.
              </p>
            </div>

            {/* 시간 설정 */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.9rem', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '10px' 
              }}>
                시험 시간: <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{settings.timeLimit}분</span>
              </label>
              <input
                type="range"
                min="5"
                max="240"
                step="5"
                value={settings.timeLimit}
                onChange={(e) => setSettings(prev => ({ ...prev, timeLimit: Number(e.target.value) }))}
                style={{
                  width: '100%',
                  height: '12px',
                  background: '#e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginTop: '8px' }}>
                <span>5분</span>
                <span>240분 (4시간)</span>
              </div>
            </div>

            {/* 타이머 표시 설정 */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={settings.showTimer}
                  onChange={(e) => setSettings(prev => ({ ...prev, showTimer: e.target.checked }))}
                  style={{ marginRight: '12px', width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>
                  타이머 표시
                </span>
              </label>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '5px', marginLeft: '28px' }}>
                실제 시험과 같은 시간 제한 환경
              </p>
            </div>

            {/* 설정 요약 */}
            <div style={{
              background: 'linear-gradient(to right, #eff6ff, #dbeafe)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              marginBottom: '30px'
            }}>
              <h3 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '15px', fontSize: '1rem' }}>
                📋 CBT 설정 요약
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                <div>자격증: <span style={{ fontWeight: '500' }}>{selectedSubject.name}</span></div>
                <div>문항수: <span style={{ fontWeight: '500', color: '#3b82f6' }}>{settings.questionCount}문항</span></div>
                <div>시험시간: <span style={{ fontWeight: '500', color: '#3b82f6' }}>{settings.timeLimit}분</span></div>
                <div>추천 난이도: <span style={{ fontWeight: '500', color: getRecommendedDifficultyInfo().text }}>{getRecommendedDifficultyInfo().label}</span></div>
              </div>
            </div>

            {/* 휴식 권장 경고 (강제하지 않음) */}
            {shouldTakeBreak() && (
              <div style={{
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px',
                border: '1px solid #f59e0b'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', color: '#d97706' }}>
                  <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>💡</span>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>AI 건강 체크 알림</div>
                    <div style={{ fontSize: '0.9rem', marginBottom: '5px' }}>
                      현재 스트레스가 높거나 집중도가 낮습니다. 휴식을 권장하지만, <strong>선택은 본인의 자유입니다!</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#92400e' }}>
                      💪 "오늘은 꼭 해야겠다!" 싶으시면 마음껏 도전하세요. 의지력도 실력의 일부입니다.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 시작 버튼 */}
            <button
              onClick={handleStartCBT}
              style={{
                width: '100%',
                padding: '15px 30px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ marginRight: '8px' }}>🚀</span>
                <div>
                  <div>{selectedSubject.name} CBT 시작하기</div>
                  <div style={{ fontSize: '0.9rem', marginTop: '2px', opacity: 0.9 }}>
                    선택: {settings.questionCount}문항 • {settings.timeLimit}분
                    {shouldTakeBreak() && (
                      <span style={{ color: '#fbbf24', marginLeft: '8px' }}>
                        💪 의지력 모드
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 기본 과목 선택 화면
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '15px' 
          }}>
            🎯 인기 자격증 CBT 모의고사 (20개)
          </h1>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '1.1rem',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Claude AI가 실시간 감정 상태를 분석하여 맞춤형 문제와 해설을 제공합니다.<br/>
            원하는 자격증을 선택하여 CBT 모의고사를 시작하세요!
          </p>
        </div>

        {/* 실시간 감정 상태 대시보드 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '25px',
          marginBottom: '30px'
        }}>
          <h2 style={{ 
            fontSize: '1.3rem', 
            fontWeight: '600', 
            color: '#1f2937', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            🧠 실시간 감정 상태 분석
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '15px', 
            marginBottom: '20px' 
          }}>
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>
                {currentEmotion.score > 0.6 ? '😊' : currentEmotion.score < 0.4 ? '😔' : '😐'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>기분</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#3b82f6' }}>
                {Math.round(currentEmotion.score * 100)}%
              </div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>
                {currentEmotion.stress < 0.3 ? '😌' : currentEmotion.stress > 0.7 ? '😰' : '😅'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>스트레스</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#ef4444' }}>
                {Math.round(currentEmotion.stress * 100)}%
              </div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>
                {currentEmotion.focus > 0.7 ? '🎯' : currentEmotion.focus < 0.4 ? '😵‍💫' : '🤔'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>집중도</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#10b981' }}>
                {Math.round(currentEmotion.focus * 100)}%
              </div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>
                {currentEmotion.confidence > 0.7 ? '💪' : currentEmotion.confidence < 0.4 ? '😰' : '🤞'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>자신감</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                {Math.round(currentEmotion.confidence * 100)}%
              </div>
            </div>
          </div>

          <div style={{
            padding: '15px',
            backgroundColor: getRecommendedDifficultyInfo().bg,
            borderRadius: '8px',
            border: `1px solid ${getRecommendedDifficultyInfo().text}20`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: getRecommendedDifficultyInfo().text, marginBottom: '5px' }}>
              🤖 Claude AI 추천 난이도: {getRecommendedDifficultyInfo().label}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#0369a1' }}>
              💬 {getMotivationalMessage()}
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '25px',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input
              type="text"
              placeholder="🔍 자격증 검색... (예: 컴활, 정보처리, 조리, 안전기사 등)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '15px 20px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
            />
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    backgroundColor: selectedCategory === category ? '#3b82f6' : '#f3f4f6',
                    color: selectedCategory === category ? 'white' : '#6b7280'
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 자격증 그리드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => handleSubjectSelect(subject)}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: selectedSubject?.id === subject.id 
                  ? '0 0 0 3px rgba(59, 130, 246, 0.3)' 
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: selectedSubject?.id === subject.id ? '2px solid #3b82f6' : '2px solid transparent',
                position: 'relative'
              }}
            >
              {/* 인기 순위 배지 */}
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                backgroundColor: subject.rank <= 5 ? '#ef4444' : subject.rank <= 10 ? '#f59e0b' : '#6b7280',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {subject.rank}위
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: subject.color 
                }}></div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    backgroundColor: subject.category === 'IT' ? '#dbeafe' : 
                                   subject.category === '건설/안전' ? '#fef3c7' : 
                                   subject.category === '전기/전자' ? '#ede9fe' : 
                                   subject.category === '조리/식품' ? '#dcfce7' : 
                                   subject.category === '교양' ? '#f3e8ff' :
                                   subject.category === '부동산' ? '#fef2f2' :
                                   subject.category === '운전/기계' ? '#ecfccb' :
                                   subject.category === '서비스' ? '#fdf2f8' :
                                   subject.category === '사회복지' ? '#f0f9ff' :
                                   subject.category === '회계/세무' ? '#f0fdf4' : '#f3f4f6',
                    color: subject.category === 'IT' ? '#1e40af' : 
                           subject.category === '건설/안전' ? '#d97706' : 
                           subject.category === '전기/전자' ? '#7c3aed' : 
                           subject.category === '조리/식품' ? '#16a34a' : 
                           subject.category === '교양' ? '#9333ea' :
                           subject.category === '부동산' ? '#dc2626' :
                           subject.category === '운전/기계' ? '#65a30d' :
                           subject.category === '서비스' ? '#be185d' :
                           subject.category === '사회복지' ? '#0369a1' :
                           subject.category === '회계/세무' ? '#059669' : '#6b7280'
                  }}>
                    {subject.category}
                  </span>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    backgroundColor: getDifficultyColor(subject.difficulty) + '20',
                    color: getDifficultyColor(subject.difficulty)
                  }}>
                    {getDifficultyText(subject.difficulty)}
                  </span>
                </div>
              </div>
              
              <h3 style={{ 
                fontSize: '1.2rem', 
                fontWeight: 'bold', 
                color: '#1f2937', 
                marginBottom: '10px',
                paddingRight: '40px'
              }}>
                {subject.name}
              </h3>
              
              <p style={{ 
                color: '#6b7280', 
                fontSize: '0.9rem', 
                marginBottom: '15px',
                lineHeight: '1.5'
              }}>
                {subject.description}
              </p>
              
              <div style={{ paddingTop: '15px', borderTop: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '8px' }}>주요 출제 분야</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {subject.topics.slice(0, 3).map((topic, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280',
                        fontSize: '0.75rem',
                        borderRadius: '6px'
                      }}
                    >
                      {topic}
                    </span>
                  ))}
                  {subject.topics.length > 3 && (
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      fontSize: '0.75rem',
                      borderRadius: '6px'
                    }}>
                      +{subject.topics.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 📊 통계 카드 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '25px',
          marginBottom: '30px'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '15px', color: '#1f2937', textAlign: 'center' }}>
            📊 자격증 현황
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '15px',
            textAlign: 'center'
          }}>
            <div style={{ padding: '10px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>20</div>
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>총 자격증 수</div>
            </div>
            <div style={{ padding: '10px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{filteredSubjects.length}</div>
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>필터링된 자격증</div>
            </div>
            <div style={{ padding: '10px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{categories.length - 1}</div>
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>분야별 카테고리</div>
            </div>
            <div style={{ padding: '10px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>AI</div>
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Claude 기반</div>
            </div>
          </div>
        </div>

        {/* 하단 링크 */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/" style={{ 
            color: '#3b82f6', 
            textDecoration: 'none', 
            fontWeight: '500',
            fontSize: '1.1rem'
          }}>
            ← 메인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}