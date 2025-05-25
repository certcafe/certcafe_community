// src/pages/api/community/correct-routine.ts - 기존 코드 개선
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GPT 루틴 보정 프롬프트 생성
function generateCorrectionPrompt(
  originalRoutine: any,
  feedbackAnalysis: any,
  emotionScore: number,
  errorRate: number
): string {
  return `당신은 학습 루틴 최적화 전문가입니다. 
커뮤니티 피드백을 분석하여 기존 루틴을 개선해주세요.

## 기존 루틴 정보
${JSON.stringify(originalRoutine, null, 2)}

## 커뮤니티 피드백 분석
- 부정 피드백 비율 (τ_neg): ${(feedbackAnalysis.tauNeg * 100).toFixed(1)}%
- 보정 강도 (Δ): ${feedbackAnalysis.delta.toFixed(2)}
- 평균 감정 점수: ${feedbackAnalysis.details?.avgSentiment?.toFixed(2) || 'N/A'}
- 총 댓글 수: ${feedbackAnalysis.details?.totalComments || 0}개

## 사용자 현재 상태
- 감정 점수: ${emotionScore.toFixed(2)}
- 오답률: ${(errorRate * 100).toFixed(1)}%

## 보정 지침
1. 부정 피드백이 10-30% 범위에 있으므로 적절한 조정이 필요합니다
2. 학습 부담을 줄이고 휴식 시간을 늘려주세요
3. 어려운 내용은 단계별로 나누어 제시하세요
4. 격려 메시지를 더 친근하게 작성해주세요

다음 JSON 형식으로 보정된 루틴을 반환해주세요:
{
  "title": "보정된 루틴 제목",
  "message": "보정 이유와 변경사항 설명",
  "blocks": [
    {
      "id": "unique_id",
      "type": "theory|practice|review|rest|cbt",
      "subject": "학습 주제",
      "duration": 60,
      "startTime": "09:00",
      "difficulty": "easy|medium|hard",
      "description": "상세 설명 (격려 메시지 포함)"
    }
  ],
  "improvements": [
    "개선사항 1",
    "개선사항 2",
    "개선사항 3"
  ]
}`
}

// 🆕 폴백 루틴 생성 (GPT 실패 시 사용)
function generateFallbackRoutine(feedbackAnalysis: any, emotionScore: number, errorRate: number) {
  const tauNegPercent = Math.round(feedbackAnalysis.tauNeg * 100);
  
  return {
    title: `피드백 반영 개선 루틴 (자동 생성)`,
    message: `부정 피드백 ${tauNegPercent}%를 반영하여 학습 부담을 줄이고 휴식을 늘린 루틴입니다.`,
    blocks: [
      {
        id: `block-${Date.now()}-1`,
        type: "theory",
        subject: "기초 개념 복습",
        duration: 45, // 기존보다 15분 단축
        startTime: "09:00",
        difficulty: "easy",
        description: "🌟 천천히 기초부터 다시 시작해요. 부담 갖지 마세요!"
      },
      {
        id: `block-${Date.now()}-2`,
        type: "rest",
        subject: "휴식 및 정리",
        duration: 20, // 휴식 시간 증가
        startTime: "09:45",
        difficulty: "easy",
        description: "☕ 잠깐 쉬면서 배운 내용을 정리해보세요."
      },
      {
        id: `block-${Date.now()}-3`,
        type: "practice",
        subject: "쉬운 문제 연습",
        duration: 30, // 짧은 연습
        startTime: "10:05",
        difficulty: "easy",
        description: "💪 쉬운 문제부터 자신감을 키워보세요!"
      }
    ],
    improvements: [
      `학습 시간 20% 단축 (부담 완화)`,
      `휴식 시간 50% 증가 (${tauNegPercent}% 부정 피드백 반영)`,
      `난이도 하향 조정 (자신감 회복 목적)`,
      `격려 메시지 강화 (정서적 지원)`
    ]
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { routineId, feedbackAnalysis, emotionScore = 0.5, errorRate = 0.3 } = req.body;

    if (!routineId || !feedbackAnalysis) {
      return res.status(400).json({ error: 'routineId and feedbackAnalysis are required' });
    }

    console.log(`[GPT Correction] 루틴 보정 시작: ${routineId}`);

    // 🆕 OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      console.warn('[GPT Correction] OpenAI API 키가 없음 - 폴백 루틴 사용');
      const fallbackRoutine = generateFallbackRoutine(feedbackAnalysis, emotionScore, errorRate);
      
      return res.status(200).json({
        success: true,
        correctedRoutineId: `fallback-${Date.now()}`,
        correctedRoutine: fallbackRoutine,
        feedbackAnalysis,
        message: `🤖 자동 보정 완료! (GPT 미사용)`,
        fallback: true
      });
    }

    // 기존 루틴 조회
    const { data: routine, error: routineError } = await supabase
      .from('routines')
      .select('*')
      .eq('id', routineId)
      .single();

    if (routineError || !routine) {
      console.error('[GPT Correction] 루틴 조회 오류:', routineError);
      
      // 🆕 루틴이 없어도 폴백 제공
      const fallbackRoutine = generateFallbackRoutine(feedbackAnalysis, emotionScore, errorRate);
      return res.status(200).json({
        success: true,
        correctedRoutineId: `fallback-${Date.now()}`,
        correctedRoutine: fallbackRoutine,
        feedbackAnalysis,
        message: '🤖 기본 보정 루틴 생성 완료!',
        fallback: true,
        warning: '원본 루틴을 찾을 수 없어 기본 템플릿을 사용했습니다.'
      });
    }

    let correctedRoutine;

    // OpenAI API 호출 (타임아웃 추가)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15초 타임아웃

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: '당신은 학습 루틴 최적화 전문가입니다. 커뮤니티 피드백을 바탕으로 루틴을 개선하는 것이 전문 분야입니다.'
            },
            {
              role: 'user',
              content: generateCorrectionPrompt(routine, feedbackAnalysis, emotionScore, errorRate)
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json();
        console.error('[GPT Correction] OpenAI API 오류:', errorData);
        throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const gptResult = await openaiResponse.json();
      console.log('[GPT Correction] GPT 응답 받음');

      try {
        const content = gptResult.choices[0].message.content.trim();
        console.log('[GPT Correction] GPT 응답:', content.substring(0, 500) + '...');
        
        // JSON 코드 블록 제거
        const cleanContent = content
          .replace(/```json\n?/g, '')
          .replace(/\n?```/g, '')
          .trim();
        
        correctedRoutine = JSON.parse(cleanContent);
        
        // 🆕 기본 유효성 검사
        if (!correctedRoutine.title || !correctedRoutine.blocks) {
          throw new Error('GPT 응답이 올바른 형식이 아닙니다');
        }
        
      } catch (parseError) {
        console.error('[GPT Correction] JSON 파싱 오류:', parseError);
        throw new Error('GPT 응답을 파싱할 수 없습니다');
      }

    } catch (gptError) {
      console.error('[GPT Correction] GPT 호출 실패:', gptError);
      
      // 🆕 GPT 실패 시 폴백 사용
      console.log('[GPT Correction] 폴백 루틴 사용');
      correctedRoutine = generateFallbackRoutine(feedbackAnalysis, emotionScore, errorRate);
    }

    // 보정된 루틴을 새 버전으로 저장 (Supabase가 연결된 경우)
    try {
      const { data: newRoutine, error: insertError } = await supabase
        .from('routines')
        .insert({
          user_id: routine.user_id,
          title: correctedRoutine.title || `${routine.title} (커뮤니티 보정)`,
          exam_type: routine.exam_type,
          study_hours: routine.study_hours,
          exam_date: routine.exam_date,
          current_level: routine.current_level,
          schedule: correctedRoutine,
          stress_score: routine.stress_score,
          parent_routine_id: routineId, // 원본 루틴 참조
          correction_reason: 'community_feedback',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('[GPT Correction] 보정 루틴 저장 오류:', insertError);
        // 저장 실패해도 보정된 루틴은 반환
      } else {
        // 피드백 이벤트 업데이트 (보정 완료 표시)
        await supabase
          .from('feedback_events')
          .update({
            correction_applied: true,
            resolved_time: new Date().toISOString(),
            delta_value: feedbackAnalysis.delta,
            metadata: {
              ...feedbackAnalysis.details,
              corrected_routine_id: newRoutine.id,
              correction_time: new Date().toISOString(),
              gpt_model: 'gpt-4'
            }
          })
          .eq('routine_id', routineId)
          .eq('correction_applied', false);

        console.log(`[GPT Correction] 보정 완료: ${newRoutine.id}`);
      }
    } catch (dbError) {
      console.error('[GPT Correction] DB 저장 오류 (무시하고 계속):', dbError);
    }

    return res.status(200).json({
      success: true,
      originalRoutineId: routineId,
      correctedRoutineId: `corrected-${Date.now()}`,
      correctedRoutine,
      feedbackAnalysis: {
        tauNeg: feedbackAnalysis.tauNeg,
        delta: feedbackAnalysis.delta,
        shouldCorrect: feedbackAnalysis.shouldCorrect
      },
      message: `🎯 커뮤니티 피드백 기반 루틴 보정 완료! τ_neg=${(feedbackAnalysis.tauNeg*100).toFixed(1)}%`
    });

  } catch (error: any) {
    console.error('[GPT Correction] 전체 오류:', error);
    
    // 🆕 완전 실패 시에도 기본 응답 제공
    const fallbackRoutine = generateFallbackRoutine(
      req.body.feedbackAnalysis || { tauNeg: 0.2, delta: 0.1 }, 
      req.body.emotionScore || 0.5, 
      req.body.errorRate || 0.3
    );
    
    return res.status(200).json({
      success: true,
      correctedRoutineId: `emergency-fallback-${Date.now()}`,
      correctedRoutine: fallbackRoutine,
      message: '🛠️ 기본 보정 루틴이 생성되었습니다.',
      fallback: true,
      warning: '일부 기능에 오류가 있어 기본 템플릿을 사용했습니다.'
    });
  }
}