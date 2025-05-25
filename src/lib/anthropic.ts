import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// 루틴 생성용 최적화된 프롬프트
export async function generateStudyRoutine(params: {
  emotionScore: number;
  stressScore: number;
  subjects: string[];
  timeAvailable: number;
  weakAreas: string[];
}) {
  const { emotionScore, stressScore, subjects, timeAvailable, weakAreas } = params;
  
  const message = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229', // 고품질 추론용
    max_tokens: 1000,
    temperature: 0.3, // 일관성 있는 루틴 생성
    messages: [{
      role: 'user',
      content: `감정 기반 맞춤 학습 루틴을 생성해주세요.

현재 상태:
- 감정 점수: ${emotionScore}/100 (높을수록 긍정적)
- 스트레스 점수: ${stressScore}/100 (높을수록 스트레스 많음)
- 학습 가능 시간: ${timeAvailable}분
- 약점 영역: ${weakAreas.join(', ')}
- 학습 과목: ${subjects.join(', ')}

다음 JSON 형식으로 응답해주세요:
{
  "routine": [
    {
      "time": "09:00-09:30",
      "subject": "과목명",
      "activity": "활동 내용",
      "intensity": "low|medium|high",
      "reason": "선택 이유"
    }
  ],
  "emotionTip": "감정 상태 기반 학습 조언",
  "breakSuggestion": "휴식 추천"
}`
    }]
  });

  return message.content[0].text;
}

// CBT 문제 생성 (빠른 응답용)
export async function generateCBTQuestions(params: {
  subject: string;
  difficulty: string;
  count: number;
  topics: string[];
}) {
  const { subject, difficulty, count, topics } = params;
  
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307', // 빠른 생성용
    max_tokens: 2000,
    temperature: 0.7, // 다양한 문제 생성
    messages: [{
      role: 'user',
      content: `${subject} 자격증 CBT 문제 ${count}개를 생성해주세요.

요구사항:
- 난이도: ${difficulty}
- 주제: ${topics.join(', ')}
- 실제 기출문제 스타일로 작성
- 해설까지 포함

JSON 형식:
{
  "questions": [
    {
      "id": 1,
      "question": "문제 내용",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "correct": 0,
      "explanation": "정답 해설",
      "topic": "해당 주제",
      "difficulty": "${difficulty}"
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
    model: 'claude-3-sonnet-20240229', // 이미지 분석 정확도
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'text',
          text: `업로드된 ${subject} 자격증 문제를 분석해주세요.

다음 정보를 JSON으로 추출해주세요:
{
  "question": "문제 내용",
  "options": ["선택지들"],
  "topic": "주제 분류",
  "difficulty": "예상 난이도",
  "keywords": ["핵심 키워드들"],
  "studyTip": "학습 조언",
  "relatedTopics": ["연관 주제들"]
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

// 커뮤니티 피드백 분석
export async function analyzeCommunityFeedback(feedbacks: Array<{
  content: string;
  rating: number;
  user_emotion: number;
}>) {
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307', // 빠른 분석용
    max_tokens: 800,
    temperature: 0.2, // 객관적 분석
    messages: [{
      role: 'user',
      content: `다음 커뮤니티 피드백들을 분석해서 루틴 개선점을 찾아주세요:

${feedbacks.map((f, i) => 
  `피드백 ${i+1}: ${f.content} (평점: ${f.rating}/5, 감정점수: ${f.user_emotion}/100)`
).join('\n')}

JSON 응답:
{
  "overallSentiment": "positive|neutral|negative",
  "commonIssues": ["문제점들"],
  "suggestions": ["개선 제안들"],
  "emotionPattern": "감정 패턴 분석"
}`
    }]
  });

  return message.content[0].text;
}

export default anthropic;