import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// CBT 문제 생성 (빠른 응답용)
export async function generateCBTProblems(params: {
  subject: string;
  difficulty: string;
  count: number;
}) {
  const { subject, difficulty, count } = params;
  
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307', // 빠른 생성용
    max_tokens: 3000,
    temperature: 0.7,
    messages: [{
      role: 'user',
      content: `${subject} 자격증 CBT 문제 ${count}개를 생성해주세요.

요구사항:
- 난이도: ${difficulty}
- 실제 기출문제 스타일로 작성
- 선택지 4개 (A, B, C, D)
- 상세한 해설 포함

JSON 형식으로 응답:
{
  "success": true,
  "problems": [
    {
      "question": "문제 내용",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "correct": 0,
      "explanation": "정답 해설 및 이유"
    }
  ]
}`
    }]
  });

  return message.content[0].text;
}

// 문제 분석 (이미지 OCR + 분석)
export async function analyzeProblemImage(imageBase64: string, subject: string) {
  const message = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229', 
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'text',
          text: `업로드된 ${subject} 자격증 문제를 분석해주세요.

JSON으로 응답:
{
  "question": "문제 내용",
  "options": ["선택지들"],
  "topic": "주제 분류",
  "difficulty": "예상 난이도",
  "keywords": ["핵심 키워드들"],
  "studyTip": "학습 조언"
}`
        },
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: imageBase64
          }
        }
      ]
    }]
  });

  return message.content[0].text;
}