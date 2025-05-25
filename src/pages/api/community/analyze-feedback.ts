// 📁 src/pages/api/community/analyze-feedback.ts - 피드백 분석 API
import type { NextApiRequest, NextApiResponse } from 'next';

interface FeedbackAnalysis {
  tauNeg: number;
  delta: number;
  shouldCorrect: boolean;
  details: {
    totalComments: number;
    negativeComments: number;
    avgSentiment: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { routineId } = req.body;
    
    console.log('📊 [API] 피드백 분석 시작:', routineId);

    // 실제로는 Supabase에서 댓글 데이터를 가져와야 하지만
    // 현재는 테스트 데이터로 시뮬레이션
    
    // 댓글 데이터 시뮬레이션
    const mockComments = [
      { sentiment: -0.6, body: '너무 어려워요' },
      { sentiment: 0.4, body: '도움이 됐어요' },
      { sentiment: -0.3, body: '시간이 부족해요' },
      { sentiment: 0.7, body: '정말 좋네요!' },
      { sentiment: -0.2, body: '좀 더 쉬웠으면...' }
    ];

    const totalComments = mockComments.length;
    const negativeComments = mockComments.filter(c => c.sentiment < -0.1).length;
    const avgSentiment = mockComments.reduce((sum, c) => sum + c.sentiment, 0) / totalComments;
    
    // τ_neg 계산 (부정 피드백 비율)
    const tauNeg = negativeComments / totalComments;
    
    // Δ 계산 (변화량)
    const delta = Math.abs(avgSentiment) * tauNeg;
    
    // 보정 필요 여부 (10% ≤ τ_neg ≤ 30%)
    const shouldCorrect = tauNeg >= 0.10 && tauNeg <= 0.30;

    const analysis: FeedbackAnalysis = {
      tauNeg,
      delta,
      shouldCorrect,
      details: {
        totalComments,
        negativeComments,
        avgSentiment
      }
    };

    console.log('✅ [API] 피드백 분석 완료:', analysis);

    // 2초 지연 (실제 분석 시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 2000));

    res.status(200).json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('❌ [API] 피드백 분석 오류:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze feedback'
    });
  }
}