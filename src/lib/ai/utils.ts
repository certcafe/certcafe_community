// GPT 프롬프트 템플릿
export const PROMPT_TEMPLATES = {
  // 특허2: 루틴 생성
  ROUTINE_GENERATION: `
당신은 자격증 학습 루틴 전문가입니다.
다음 정보를 바탕으로 개인화된 학습 루틴을 생성해주세요:

사용자 정보:
- 목표 자격증: {certification}
- 시험 일정: {examDate}
- 학습 가능 시간: {availableTime}
- 현재 실력: {currentLevel}

감정 상태:
- EmotionScore: {emotionScore}
- StressScore: {stressScore}
- EmotionBand: {emotionBand}

JSON 형태로 응답해주세요:
{
  "daily_schedule": [...],
  "study_blocks": [...],
  "break_intervals": [...],
  "difficulty_adjustment": "..."
}
  `,

  // 특허1: CBT 해설 생성
  CBT_EXPLANATION: `
다음 CBT 문제에 대한 해설을 생성해주세요.
사용자의 감정 상태에 맞춰 설명 톤을 조정하세요.

문제 정보:
- 문제: {question}
- 정답: {correctAnswer}
- 사용자 답안: {userAnswer}

감정 정보:
- EmotionBand: {emotionBand}
- StressScore: {stressScore}

요구사항:
- FactScore 0.85 이상 유지
- EmotionDrift 0.15 이하 유지
- {emotionBand}에 맞는 격려 메시지 포함
  `,

  // 특허3: 커뮤니티 피드백 분석
  FEEDBACK_ANALYSIS: `
다음 커뮤니티 피드백을 분석하여 감정 점수를 매겨주세요:

피드백 내용: {content}

JSON 형태로 응답:
{
  "sentiment_score": number, // -1 ~ 1
  "emotion_category": string,
  "needs_attention": boolean
}
  `
}

// OpenAI API 호출 함수
export async function callOpenAI(
  prompt: string,
  maxTokens: number = 500,
  temperature: number = 0.2
): Promise<string> {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        maxTokens,
        temperature,
      }),
    })

    if (!response.ok) {
      throw new Error('AI API 호출 실패')
    }

    const data = await response.json()
    return data.content
  } catch (error) {
    console.error('OpenAI API 에러:', error)
    throw error
  }
}

// 스트리밍 응답 처리
export async function* streamOpenAI(
  prompt: string,
  maxTokens: number = 500
): AsyncGenerator<string, void, unknown> {
  try {
    const response = await fetch('/api/ai/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        maxTokens,
      }),
    })

    if (!response.ok || !response.body) {
      throw new Error('스트리밍 API 호출 실패')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.content) {
              yield data.content
            }
          } catch (e) {
            // JSON 파싱 에러 무시
          }
        }
      }
    }
  } catch (error) {
    console.error('스트리밍 에러:', error)
    throw error
  }
}

/* ================================= */