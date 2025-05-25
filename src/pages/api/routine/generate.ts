// src/pages/api/routine/generate.ts - 완전 수정 버전

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 폴백 루틴 블록 생성 함수
function generateFallbackBlocks(examType: string, studyHours: number, emotionData: any, stressScore: number) {
  const totalMinutes = studyHours * 60;
  const blocks = [];
  
  // 시간 분배 (감정 상태 기반)
  const sessionLength = emotionData.avgFatigue >= 0.6 ? 30 : stressScore >= 0.30 ? 45 : 60;
  const restLength = emotionData.avgFatigue >= 0.6 ? 15 : 10;
  
  let currentTime = "09:00";
  let remainingMinutes = totalMinutes;
  let blockId = 1;
  
  while (remainingMinutes > 0) {
    const studyDuration = Math.min(sessionLength, remainingMinutes);
    
    // 학습 블록
    blocks.push({
      id: `block_${blockId}`,
      type: blockId % 4 === 0 ? "cbt" : blockId % 3 === 0 ? "review" : "theory",
      subject: `${examType} 핵심 학습 ${blockId}`,
      duration: studyDuration,
      startTime: currentTime,
      difficulty: emotionData.avgConfidence < 0.5 ? "easy" : stressScore >= 0.30 ? "medium" : "hard",
      description: `${examType} 주요 개념 학습 및 문제풀이`,
      emotionConsideration: stressScore >= 0.30 ? 
        "높은 스트레스로 인해 휴식 패턴 적용" : 
        "안정된 상태로 집중 학습 진행",
      materials: {
        textbook: `${examType} 추천 교재`,
        lecture: "인기 강사 온라인 강의",
        problems: "최근 3년 기출문제",
        passTip: "기출문제 반복 학습이 핵심입니다"
      },
      strategy: {
        focus: emotionData.avgConfidence < 0.5 ? "기초 이해 중심" : "균형잡힌 학습",
        timeAllocation: `학습 ${studyDuration}분`,
        examTrick: "시간 배분과 선택지 소거법 활용",
        restPattern: `${studyDuration}분 학습 + ${restLength}분 휴식`
      }
    });
    
    remainingMinutes -= studyDuration;
    blockId++;
    
    // 시간 계산 (간단히)
    const [hour, minute] = currentTime.split(':').map(Number);
    const newMinute = minute + studyDuration + restLength;
    const newHour = hour + Math.floor(newMinute / 60);
    currentTime = `${String(newHour % 24).padStart(2, '0')}:${String(newMinute % 60).padStart(2, '0')}`;
    
    if (remainingMinutes > 0 && remainingMinutes >= 15) {
      // 휴식 블록 추가
      blocks.push({
        id: `rest_${blockId}`,
        type: "rest",
        subject: "휴식 시간",
        duration: restLength,
        startTime: currentTime,
        difficulty: "easy",
        description: "충분한 휴식과 재충전",
        emotionConsideration: "스트레스 해소 및 집중력 회복",
        materials: {
          textbook: "",
          lecture: "",
          problems: "",
          passTip: "휴식도 학습의 일부입니다"
        },
        strategy: {
          focus: "완전한 휴식",
          timeAllocation: `휴식 ${restLength}분`,
          examTrick: "깊은 호흡과 스트레칭",
          restPattern: "완전 휴식"
        }
      });
    }
  }
  
  return blocks.slice(0, 8); // 최대 8개 블록
}

// Claude API 호출 함수 (개선된 버전)
async function callClaudeAPI(prompt: string) {
  // 환경 변수 확인
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다.');
  }

  console.log('🔗 Claude API 호출 시작...');
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307', // 더 안정적인 haiku 모델 사용
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  console.log('📡 Claude API 응답 상태:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Claude API 오류 응답:', errorText);
    throw new Error(`Claude API 오류: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ Claude API 성공 응답');
  
  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error('Claude API 응답 형식이 올바르지 않습니다.');
  }

  return data.content[0].text;
}

// 🧠 감정 데이터 조회 함수
async function getEmotionData(userId: string) {
  try {
    const { data, error } = await supabase
      .from('emotions')
      .select(`
        emotion_score,
        stress_level,
        confidence_level,
        motivation_level,
        fatigue_level,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        avgEmotionScore: 0.7,
        avgStressLevel: 0.3,
        avgConfidence: 0.6,
        avgMotivation: 0.7,
        avgFatigue: 0.4,
        recentTrend: 'stable'
      };
    }

    // 평균값 계산
    const avgEmotionScore = data.reduce((sum, item) => sum + (item.emotion_score || 0.7), 0) / data.length;
    const avgStressLevel = data.reduce((sum, item) => sum + (item.stress_level || 0.3), 0) / data.length;
    const avgConfidence = data.reduce((sum, item) => sum + (item.confidence_level || 0.6), 0) / data.length;
    const avgMotivation = data.reduce((sum, item) => sum + (item.motivation_level || 0.7), 0) / data.length;
    const avgFatigue = data.reduce((sum, item) => sum + (item.fatigue_level || 0.4), 0) / data.length;

    // 최근 3일간의 감정 추세 분석
    const recentData = data.slice(0, 3);
    const oldData = data.slice(3, 6);
    
    let recentTrend = 'stable';
    if (recentData.length >= 2 && oldData.length >= 2) {
      const recentAvg = recentData.reduce((sum, item) => sum + (item.emotion_score || 0.7), 0) / recentData.length;
      const oldAvg = oldData.reduce((sum, item) => sum + (item.emotion_score || 0.7), 0) / oldData.length;
      
      if (recentAvg > oldAvg + 0.1) recentTrend = 'improving';
      else if (recentAvg < oldAvg - 0.1) recentTrend = 'declining';
    }

    return {
      avgEmotionScore,
      avgStressLevel,
      avgConfidence,
      avgMotivation,
      avgFatigue,
      recentTrend
    };
  } catch (error) {
    console.error('❌ 감정 데이터 조회 실패:', error);
    return {
      avgEmotionScore: 0.7,
      avgStressLevel: 0.3,
      avgConfidence: 0.6,
      avgMotivation: 0.7,
      avgFatigue: 0.4,
      recentTrend: 'stable'
    };
  }
}

// 📊 학습 성과 데이터 조회 함수
async function getStudyPerformance(userId: string) {
  try {
    const { data, error } = await supabase
      .from('cbt_results')
      .select(`
        score,
        total_questions,
        correct_answers,
        exam_type,
        completed_at
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        avgScore: 70,
        errorRate: 0.3,
        improvementTrend: 'stable',
        weakSubjects: []
      };
    }

    const avgScore = data.reduce((sum, item) => sum + (item.score || 70), 0) / data.length;
    const totalQuestions = data.reduce((sum, item) => sum + (item.total_questions || 100), 0);
    const correctAnswers = data.reduce((sum, item) => sum + (item.correct_answers || 70), 0);
    const errorRate = totalQuestions > 0 ? (totalQuestions - correctAnswers) / totalQuestions : 0.3;

    // 개선 추세 분석
    let improvementTrend = 'stable';
    if (data.length >= 3) {
      const recentScores = data.slice(0, 2).map(item => item.score || 70);
      const oldScores = data.slice(2, 4).map(item => item.score || 70);
      
      const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
      const oldAvg = oldScores.reduce((sum, score) => sum + score, 0) / oldScores.length;
      
      if (recentAvg > oldAvg + 5) improvementTrend = 'improving';
      else if (recentAvg < oldAvg - 5) improvementTrend = 'declining';
    }

    return {
      avgScore,
      errorRate,
      improvementTrend,
      weakSubjects: []
    };
  } catch (error) {
    console.error('❌ 학습 성과 데이터 조회 실패:', error);
    return {
      avgScore: 70,
      errorRate: 0.3,
      improvementTrend: 'stable',
      weakSubjects: []
    };
  }
}

// 🎯 자격증별 합격자 기반 교재/강의 추천 함수 (확장)
function getExamSpecificInfo(examType: string) {
  const examInfo: { [key: string]: any } = {
    '정보처리기사': {
      textbooks: [
        { name: "시나공 정보처리기사 필기", author: "길벗알앤디", rating: 4.8, passRate: 89, price: "35,000원", features: ["최신 기출 반영", "실기 연계", "동영상 강의"] },
        { name: "이기적 정보처리기사 필기", author: "영진닷컴", rating: 4.7, passRate: 85, price: "32,000원", features: ["문제 해설 상세", "실무 예제", "모의고사"] },
        { name: "수제비 정보처리기사", author: "수제비", rating: 4.6, passRate: 83, price: "29,000원", features: ["요약 정리", "암기법", "기출 분석"] }
      ],
      lectures: [
        { instructor: "김선우", platform: "이기적", rating: 4.9, passRate: 92, students: 15420, features: ["실무 경험", "친절한 설명", "질의응답"] },
        { instructor: "오정임", platform: "시나공", rating: 4.8, passRate: 88, students: 12350, features: ["체계적 커리큘럼", "실기 연계", "시험 팁"] },
        { instructor: "장대호", platform: "수제비", rating: 4.7, passRate: 86, students: 9870, features: ["핵심 요약", "암기법", "단기 완성"] }
      ],
      studyTips: "📚 3개월 집중, 기출 3회독, SQL 실습 필수",
      passingScore: "60점 이상",
      difficulty: "중급"
    },
    
    '컴퓨터활용능력 1급': {
      textbooks: [
        { name: "시나공 컴활1급", author: "길벗알앤디", rating: 4.9, passRate: 91, price: "28,000원", features: ["실기 중심", "단축키 정리", "매크로 해설"] },
        { name: "이기적 컴활1급", author: "영진닷컴", rating: 4.8, passRate: 89, price: "26,000원", features: ["함수 완전정복", "실무 예제", "오류 해결법"] },
        { name: "에듀윌 컴활1급", author: "에듀윌", rating: 4.7, passRate: 85, price: "25,000원", features: ["기초부터 고급", "시간 단축 기법", "실전 모의고사"] }
      ],
      lectures: [
        { instructor: "정광석", platform: "이지원", rating: 4.9, passRate: 94, students: 23100, features: ["실무 노하우", "단축키 마스터", "1:1 피드백"] },
        { instructor: "김동균", platform: "에듀윌", rating: 4.8, passRate: 90, students: 18900, features: ["기초 탄탄", "단계별 학습", "실전 대비"] }
      ],
      studyTips: "⚡ 단축키 암기, 실습 위주, 시간 단축이 핵심",
      passingScore: "필기 60점, 실기 70점 이상",
      difficulty: "중급"
    },
    
    '공인중개사': {
      textbooks: [
        { name: "해커스 공인중개사", author: "해커스", rating: 4.8, passRate: 87, price: "89,000원", features: ["4과목 세트", "판례 정리", "계산 문제 특강"] },
        { name: "에듀윌 공인중개사", author: "에듀윌", rating: 4.7, passRate: 84, price: "85,000원", features: ["법령 해설", "실무 사례", "기출 분석"] },
        { name: "박문간행 공인중개사", author: "박문각", rating: 4.6, passRate: 82, price: "82,000원", features: ["조문 중심", "암기법", "모의고사"] }
      ],
      lectures: [
        { instructor: "권혁", platform: "해커스", rating: 4.9, passRate: 89, students: 8950, features: ["20년 경력", "판례 완벽 해설", "암기법 전수"] },
        { instructor: "이동근", platform: "에듀윌", rating: 4.8, passRate: 86, students: 7200, features: ["체계적 정리", "실무 연계", "계산 문제 완벽"] }
      ],
      studyTips: "📖 1,2차 모두 60점, 판례 암기, 계산 문제 반복",
      passingScore: "1차 60점, 2차 60점 이상",
      difficulty: "고급"
    },
    
    '한국사능력검정시험': {
      textbooks: [
        { name: "해커스 한국사", author: "해커스", rating: 4.9, passRate: 93, price: "22,000원", features: ["연표 정리", "테마별 구성", "기출 완벽 분석"] },
        { name: "시대고시 한국사", author: "시대고시", rating: 4.8, passRate: 90, price: "20,000원", features: ["핵심 요약", "암기법", "문제 유형 분석"] },
        { name: "에듀윌 한국사", author: "에듀윌", rating: 4.7, passRate: 88, price: "19,000원", features: ["기초부터 심화", "문화사 특강", "실전 모의고사"] }
      ],
      lectures: [
        { instructor: "설민석", platform: "대성마이맥", rating: 4.9, passRate: 95, students: 45600, features: ["스토리텔링", "재미있는 해설", "완벽한 이해"] },
        { instructor: "고종훈", platform: "해커스", rating: 4.8, passRate: 92, students: 28400, features: ["체계적 정리", "연표 암기법", "기출 분석"] }
      ],
      studyTips: "📚 연표 암기, 문화사 중요, 현대사 비중 높음",
      passingScore: "1급 80점, 2급 70점 이상",
      difficulty: "초급"
    },
    
    '전기기사': {
      textbooks: [
        { name: "성안당 전기기사", author: "성안당", rating: 4.8, passRate: 86, price: "45,000원", features: ["이론 + 실기", "공식 정리", "계산 문제"] },
        { name: "일진사 전기기사", author: "일진사", rating: 4.7, passRate: 83, price: "42,000원", features: ["기초 이론", "실무 해설", "기출 분석"] }
      ],
      lectures: [
        { instructor: "이준호", platform: "전기닷컴", rating: 4.8, passRate: 88, students: 6750, features: ["현장 경험", "공식 유도", "실무 연계"] },
        { instructor: "김전기", platform: "에듀윌", rating: 4.7, passRate: 85, students: 5200, features: ["기초부터 심화", "계산 문제 특화", "암기법"] }
      ],
      studyTips: "⚡ 공식 암기, 계산 연습, 실무 이해 필수",
      passingScore: "필기 60점, 실기 60점 이상",
      difficulty: "고급"
    }
  };
  
  const defaultInfo = {
    textbooks: [
      { name: `${examType} 기본서`, author: "추천 출판사", rating: 4.5, passRate: 80, price: "30,000원", features: ["기출 분석", "핵심 정리", "모의고사"] }
    ],
    lectures: [
      { instructor: "전문 강사", platform: "온라인 강의", rating: 4.5, passRate: 80, students: 1000, features: ["체계적 학습", "질의응답", "시험 대비"] }
    ],
    studyTips: "📚 꾸준한 학습과 기출문제 반복이 핵심입니다",
    passingScore: "60점 이상",
    difficulty: "중급"
  };
  
  return examInfo[examType] || defaultInfo;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      examType, 
      studyHours, 
      daysUntilExam,
      userId
    } = req.body;

    console.log('📥 API 요청 파라미터:', { examType, studyHours, daysUntilExam, userId });

    // 필수 파라미터 검증
    if (!examType || !studyHours || !daysUntilExam) {
      return res.status(400).json({ 
        error: '필수 파라미터가 누락되었습니다: examType, studyHours, daysUntilExam' 
      });
    }

    // 🧠 실시간 감정 데이터 조회
    const emotionData = userId ? await getEmotionData(userId) : {
      avgEmotionScore: 0.7,
      avgStressLevel: 0.3,
      avgConfidence: 0.6,
      avgMotivation: 0.7,
      avgFatigue: 0.4,
      recentTrend: 'stable'
    };

    // 📊 학습 성과 데이터 조회
    const performanceData = userId ? await getStudyPerformance(userId) : {
      avgScore: 70,
      errorRate: 0.3,
      improvementTrend: 'stable',
      weakSubjects: []
    };

    // StressScore 계산 (기존 공식 활용)
    const stressScore = 0.5 * performanceData.errorRate + 0.3 * (1 - emotionData.avgEmotionScore) + 0.2 * emotionData.avgFatigue;

    console.log('🧠 감정 분석 결과:', {
      emotionScore: emotionData.avgEmotionScore,
      stressLevel: emotionData.avgStressLevel,
      confidence: emotionData.avgConfidence,
      motivation: emotionData.avgMotivation,
      fatigue: emotionData.avgFatigue,
      trend: emotionData.recentTrend,
      stressScore: stressScore.toFixed(3)
    });

    // 프롬프트 생성 (실시간 데이터 기반)
    const examData = getExamSpecificInfo(examType);
    const routinePrompt = `당신은 ${examType} 합격자들의 학습 패턴을 분석한 전문 컨설턴트입니다.

📊 학습자 현재 상태 (실시간 데이터 기반):
- 목표: ${examType} (D-${daysUntilExam})
- 일일 학습시간: ${studyHours}시간
- 감정점수: ${emotionData.avgEmotionScore.toFixed(2)}/1.0 (${emotionData.recentTrend === 'improving' ? '📈상승' : emotionData.recentTrend === 'declining' ? '📉하락' : '📊안정'})
- 자신감: ${emotionData.avgConfidence.toFixed(2)}/1.0
- 동기수준: ${emotionData.avgMotivation.toFixed(2)}/1.0
- 피로도: ${emotionData.avgFatigue.toFixed(2)}/1.0
- 최근 평균점수: ${performanceData.avgScore.toFixed(0)}점
- 오답률: ${(performanceData.errorRate * 100).toFixed(0)}%
- StressScore: ${stressScore.toFixed(2)} ${stressScore >= 0.30 ? '(⚠️고스트레스)' : '(😌안정)'}

🎯 ${examType} 합격자 기반 추천 자료:

📚 **추천 교재 (합격률 순위)**:
${examData.textbooks.map((book, idx) => 
`${idx + 1}. **${book.name}** (${book.author})
   - 합격률: ${book.passRate}% | 평점: ${book.rating}/5.0 | 가격: ${book.price}
   - 특징: ${book.features.join(', ')}`).join('\n')}

👨‍🏫 **추천 강의 (합격률 순위)**:
${examData.lectures.map((lecture, idx) => 
`${idx + 1}. **${lecture.instructor} 선생님** (${lecture.platform})
   - 합격률: ${lecture.passRate}% | 평점: ${lecture.rating}/5.0 | 수강생: ${lecture.students.toLocaleString()}명
   - 특징: ${lecture.features.join(', ')}`).join('\n')}

📝 **합격 전략**: ${examData.studyTips}
🎯 **합격 기준**: ${examData.passingScore}
📊 **난이도**: ${examData.difficulty}

🧠 감정 상태 기반 학습 조정:
- 스트레스 관리: ${stressScore >= 0.30 ? '⚠️ 높은 스트레스로 인해 부담 없는 기초 복습과 휴식을 병행' : '😌 안정된 상태로 집중 학습 진행 가능'}
- 자신감 관리: ${emotionData.avgConfidence < 0.4 ? '🆘 자신감 회복이 우선. 쉬운 문제부터 시작하여 성취감 축적' : '🎯 적절한 도전으로 자신감 향상'}

🎯 ${studyHours}시간 분량의 **구체적인 교재/강의 포함** 루틴을 JSON 형식으로 생성해주세요.

응답 형식:
{
  "success": true,
  "recommendedMaterials": {
    "primaryTextbook": {
      "name": "추천 교재명",
      "author": "저자",
      "reason": "선택 이유",
      "studyMethod": "학습 방법"
    },
    "primaryLecture": {
      "instructor": "강사명",
      "platform": "플랫폼",
      "reason": "선택 이유",
      "studyTips": "수강 팁"
    }
  },
  "blocks": [
    {
      "id": "block_1",
      "type": "theory",
      "subject": "구체적 과목명",
      "duration": 60,
      "startTime": "09:00",
      "difficulty": "medium",
      "description": "상세 학습 내용",
      "materials": {
        "textbook": "구체적 교재명 + 페이지",
        "lecture": "구체적 강의명 + 회차",
        "problems": "연도별 기출문제 범위",
        "passTip": "해당 영역 합격 포인트"
      }
    }
  ],
  "message": "루틴 생성 완료 메시지"
}`;

    console.log('🎯 루틴 생성 요청:', { examType, studyHours, daysUntilExam });

    let responseText;
    
    // Claude API 호출 시도
    try {
      responseText = await callClaudeAPI(routinePrompt);
      console.log('🤖 Claude 응답 길이:', responseText?.length || 0);
    } catch (apiError: any) {
      console.error('❌ Claude API 실패:', apiError);
      
      // API 실패 시 폴백 루틴 생성
      console.log('🔄 폴백 모드로 전환...');
      responseText = null;
    }
    
    if (!responseText) {
      console.log('🚨 API 응답이 없어 폴백 루틴 사용');
      
      // 폴백 루틴 생성 (API 실패 시)
      const fallbackRoutine = {
        success: true,
        stressScore: stressScore, // 🔥 추가
        emotionBand: stressScore >= 0.30 ? 'High' : stressScore >= 0.20 ? 'Medium' : 'Low', // 🔥 추가
        emotionAnalysis: {
          currentState: stressScore >= 0.30 ? 'high_stress' : stressScore >= 0.20 ? 'moderate_stress' : 'stable',
          recommendations: `현재 스트레스 수준(${stressScore.toFixed(2)})에 맞는 학습 강도 조절이 필요합니다.`,
          adjustments: emotionData.avgFatigue >= 0.6 ? '짧은 학습 세션과 충분한 휴식' : '표준 학습 패턴 유지'
        },
        blocks: generateFallbackBlocks(examType, studyHours, emotionData, stressScore),
        studyPlan: {
          totalWeeks: Math.ceil(daysUntilExam / 7),
          weeklyGoal: `주차별 단계적 학습 진행 (감정 상태 고려)`,
          finalStrategy: "시험 전 마지막 점검 및 컨디션 관리",
          emotionManagement: stressScore >= 0.30 ? "스트레스 관리 우선" : "현재 상태 유지"
        },
        passerInsights: {
          commonMistakes: ["시간 부족", "기본 개념 부족", "실전 연습 부족"],
          timeManagement: "전체 시간의 60%는 아는 문제, 40%는 어려운 문제에 배분",
          lastWeekTip: "새로운 내용 학습보다는 복습과 컨디션 관리에 집중",
          stressManagement: "적절한 휴식과 긍정적 자기 암시가 중요"
        },
        personalizedTips: {
          confidenceBooster: emotionData.avgConfidence < 0.5 ? "쉬운 문제부터 해결하여 성취감 쌓기" : "현재 자신감 수준 유지",
          motivationTips: emotionData.avgMotivation < 0.5 ? "작은 목표 설정과 보상 시스템 활용" : "장기 목표 향해 꾸준히 진행",
          fatigueManagement: emotionData.avgFatigue >= 0.6 ? "충분한 수면과 짧은 학습 세션" : "현재 컨디션 유지"
        },
        message: `${examType} 기본 학습 루틴이 생성되었습니다. (폴백 모드)`
      };

      console.log('✅ 폴백 루틴 생성 완료');
      return res.status(200).json(fallbackRoutine);
    }

    console.log('🤖 Claude 응답:', responseText.substring(0, 200) + '...');

    // JSON 파싱 시도
    let routineData;
    try {
      // JSON 코드 블록이 있다면 추출
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                       responseText.match(/```\n([\s\S]*?)\n```/) ||
                       [null, responseText];
      
      const jsonString = jsonMatch[1] || responseText;
      routineData = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('❌ JSON 파싱 실패:', parseError);
      
      // 파싱 실패 시 폴백 루틴 사용
      const fallbackRoutine = {
        success: true,
        stressScore: stressScore, // 🔥 추가
        emotionBand: stressScore >= 0.30 ? 'High' : stressScore >= 0.20 ? 'Medium' : 'Low', // 🔥 추가
        blocks: generateFallbackBlocks(examType, studyHours, emotionData, stressScore),
        message: `${examType} 기본 루틴이 생성되었습니다. (파싱 오류로 인한 폴백)`
      };

      console.log('✅ 파싱 실패 폴백 루틴 생성 완료');
      return res.status(200).json(fallbackRoutine);
    }

    console.log('✅ 루틴 생성 완료:', {
      success: routineData.success,
      blocksCount: routineData.blocks?.length || 0
    });

    res.status(200).json(routineData);

  } catch (error) {
    console.error('❌ 루틴 생성 오류:', error);
    
    res.status(500).json({ 
      error: '루틴 생성 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
}