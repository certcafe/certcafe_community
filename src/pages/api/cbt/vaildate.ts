import type { NextApiRequest, NextApiResponse } from 'next';

interface ValidationRequest {
  questionId: string;
  userAnswer: number;
  correctAnswer: number;
  emotionScore: number;
  responseTime: number;
}

interface ValidationResponse {
  isCorrect: boolean;
  factScore: number;
  emotionDrift: number;
  needsRegeneration: boolean;
  feedback: {
    performance: string;
    emotion: string;
    recommendation: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidationResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { questionId, userAnswer, correctAnswer, emotionScore, responseTime }: ValidationRequest = req.body;

    // 1. 기본 정답 여부 확인
    const isCorrect = userAnswer === correctAnswer;

    // 2. 특허③: FactScore 계산 (해설의 사실 정확도)
    const factScore = await calculateFactScore(questionId);

    // 3. 특허③: EmotionDrift 계산
    const emotionDrift = await calculateEmotionDrift(emotionScore, isCorrect, responseTime);

    // 4. 재생성 필요 여부 판단 (특허③ 기준)
    const needsRegeneration = factScore < 0.85 || emotionDrift > 0.15;

    // 5. 맞춤형 피드백 생성
    const feedback = generatePersonalizedFeedback(isCorrect, emotionScore, responseTime, emotionDrift);

    // 6. 학습 로그 저장 (실제 구현에서는 DB에 저장)
    await saveLearningLog({
      questionId,
      userAnswer,
      correctAnswer,
      isCorrect,
      emotionScore,
      responseTime,
      factScore,
      emotionDrift,
      timestamp: new Date()
    });

    return res.status(200).json({
      isCorrect,
      factScore,
      emotionDrift,
      needsRegeneration,
      feedback
    });

  } catch (error) {
    console.error('답안 검증 오류:', error);
    return res.status(500).json({ error: '검증 처리 중 오류가 발생했습니다.' });
  }
}

// 특허③: FactScore 계산
async function calculateFactScore(questionId: string): Promise<number> {
  // 실제 구현에서는 N≥2개의 교사 LLM 앙상블로 검증
  // 현재는 Mock 구현

  // 간단한 휴리스틱으로 FactScore 시뮬레이션
  const mockFactScores: { [key: string]: number } = {
    'default': 0.87,
    'high_quality': 0.93,
    'needs_improvement': 0.79
  };

  // questionId 기반으로 FactScore 반환 (실제로는 LLM 검증)
  return mockFactScores[questionId] || mockFactScores['default'];
}

// 특허③: EmotionDrift 계산
async function calculateEmotionDrift(
  initialEmotionScore: number, 
  isCorrect: boolean, 
  responseTime: number
): Promise<number> {
  // EmotionDrift = EmotionScore_in - EmotionScore_out
  
  // 답안 결과와 소요시간 기반으로 감정 변화 추정
  let emotionChange = 0;
  
  if (isCorrect) {
    emotionChange = 0.1; // 정답 시 긍정적 변화
  } else {
    emotionChange = -0.15; // 오답 시 부정적 변화
  }
  
  // 응답 시간이 너무 길면 추가 스트레스
  if (responseTime > 120000) { // 2분 초과
    emotionChange -= 0.05;
  }
  
  // 현재 감정 점수에서 변화량을 뺀 값
  const finalEmotionScore = Math.max(0, Math.min(1, initialEmotionScore + emotionChange));
  
  // EmotionDrift는 절댓값으로 계산
  return Math.abs(initialEmotionScore - finalEmotionScore);
}

// 개인화된 피드백 생성 (특허③: Emotion-Aware 후처리)
function generatePersonalizedFeedback(
  isCorrect: boolean,
  emotionScore: number,
  responseTime: number,
  emotionDrift: number
) {
  const emotionBand = emotionScore >= 0.7 ? 'High' : 
                    emotionScore >= 0.4 ? 'Medium' : 'Low';

  let performance = '';
  let emotion = '';
  let recommendation = '';

  // 성과 피드백
  if (isCorrect) {
    performance = responseTime < 30000 ? '빠르고 정확한 답변입니다!' : '정답입니다!';
  } else {
    performance = '아쉽지만 오답입니다.';
  }

  // 감정 상태별 피드백 (특허③: EmotionBand 기반)
  switch (emotionBand) {
    case 'High': // 스트레스 높음
      emotion = isCorrect 
        ? '긴장 상태에서도 좋은 결과를 내셨네요.'
        : '지금 상태가 좀 힘드시죠? 잠시 휴식을 취하시는 것이 어떨까요?';
      recommendation = '호흡을 가다듬어 보세요. 충분히 잘 하고 계십니다.';
      break;
      
    case 'Medium': // 보통 상태
      emotion = isCorrect
        ? '안정적인 상태에서 좋은 성과를 보이고 있습니다.'
        : '이런 실수는 충분히 있을 수 있어요.';
      recommendation = '현재 페이스를 유지하면서 계속 진행해보세요.';
      break;
      
    case 'Low': // 집중도 떨어짐
      emotion = isCorrect
        ? '컨디션이 좋지 않은 상태에서도 정답을 맞추셨군요!'
        : '집중력이 떨어져 있는 것 같습니다.';
      recommendation = '자신감을 가지세요! 분명히 더 좋은 결과를 낼 수 있습니다.';
      break;
  }

  // EmotionDrift가 높으면 추가 권장사항
  if (emotionDrift > 0.15) {
    recommendation += ' 감정 변화가 큰 상황이니 잠시 휴식을 권장합니다.';
  }

  return {
    performance,
    emotion,
    recommendation
  };
}

// 학습 로그 저장
async function saveLearningLog(logData: any) {
  // 실제 구현에서는 데이터베이스에 저장
  // 현재는 콘솔에 로그만 출력
  console.log('학습 로그 저장:', {
    timestamp: logData.timestamp,
    questionId: logData.questionId,
    performance: logData.isCorrect ? '정답' : '오답',
    emotionScore: logData.emotionScore,
    factScore: logData.factScore,
    emotionDrift: logData.emotionDrift
  });

  // TODO: 실제 DB 저장 로직
  // await db.learningLogs.create({ data: logData });
}