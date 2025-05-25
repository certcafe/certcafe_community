import OpenAI from 'openai';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GenerateQuestionsRequest {
  subject: string;
  emotionScore: number;
  questionCount: number;
  languageTag: string;
}

export interface Question {
  id: string;
  stem: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  factScore?: number;
}

// 감정 상태에 따른 프롬프트 생성
export function generatePrompt(subject: string, emotionBand: string, questionCount: number): string {
  const difficultyModifier = emotionBand === 'High' ? '쉬운 난이도로' :
                           emotionBand === 'Medium' ? '보통 난이도로' :
                           '기본 난이도로';

  const emotionGuidance = emotionBand === 'High' 
    ? '스트레스 완화를 위한 친근하고 격려하는 어조로 해설을 작성하세요.'
    : emotionBand === 'Low'
    ? '자신감 향상을 위한 격려 메시지를 해설에 포함하세요.'
    : '명확하고 간결한 설명으로 해설을 작성하세요.';

  return `당신은 ${subject} 자격증 시험 문제 출제 전문가입니다.

**요구사항:**
- ${difficultyModifier} ${questionCount}개의 5지선다 문제 생성
- 실제 시험 출제 경향 반영
- ${emotionGuidance}

**출력 형식:**
각 문제를 다음 JSON 형식으로 정확히 출력하세요:

{
  "questions": [
    {
      "id": "q1",
      "stem": "문제 본문",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4", "선택지5"],
      "correctAnswer": 정답_인덱스(0-4),
      "explanation": "상세한 해설",
      "difficulty": "${emotionBand === 'High' ? 'easy' : emotionBand === 'Medium' ? 'medium' : 'hard'}",
      "topic": "세부 주제명"
    }
  ]
}

**주의사항:**
1. 반드시 유효한 JSON 형식으로만 응답
2. 문제는 명확하고 공정해야 함
3. 해설은 이해하기 쉽게 단계별로 설명
4. 함정 선택지 포함하되 공정성 유지

JSON으로만 응답하세요:`;
}

// GPT를 사용한 문제 생성
export async function generateQuestions(
  subject: string, 
  emotionScore: number, 
  questionCount: number = 3
): Promise<Question[]> {
  try {
    // EmotionBand 결정
    const emotionBand = emotionScore >= 0.7 ? 'High' : 
                      emotionScore >= 0.4 ? 'Medium' : 'Low';

    console.log(`문제 생성 시작 - 과목: ${subject}, 감정: ${emotionBand}, 개수: ${questionCount}`);

    // GPT 프롬프트 생성
    const prompt = generatePrompt(subject, emotionBand, questionCount);

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 비용 효율적인 모델
      messages: [
        {
          role: "system",
          content: "당신은 전문적인 자격증 시험 문제 출제자입니다. 항상 정확한 JSON 형식으로만 응답하세요."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7, // 창의성과 일관성의 균형
      max_tokens: 2000,
      response_format: { type: "json_object" } // JSON 형식 강제
    });

    const response = completion.choices[0].message.content;
    
    if (!response) {
      throw new Error('GPT 응답이 비어있습니다');
    }

    console.log('GPT 원본 응답:', response);

    // JSON 파싱
    const parsed = JSON.parse(response);
    
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('GPT 응답 형식이 올바르지 않습니다');
    }

    // 문제 검증 및 가공
    const questions: Question[] = parsed.questions.map((q: any, index: number) => ({
      id: `gpt_${Date.now()}_${index}`,
      stem: q.stem || '문제를 생성하지 못했습니다.',
      options: Array.isArray(q.options) && q.options.length === 5 
        ? q.options 
        : ['선택지 1', '선택지 2', '선택지 3', '선택지 4', '선택지 5'],
      correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 4 
        ? q.correctAnswer 
        : 0,
      explanation: q.explanation || '해설을 생성하지 못했습니다.',
      difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
      topic: q.topic || subject,
      factScore: 0.9 // GPT 생성 문제는 기본적으로 높은 점수
    }));

    console.log(`문제 생성 완료: ${questions.length}개`);
    return questions;

  } catch (error) {
    console.error('GPT 문제 생성 오류:', error);
    
    // Fallback: Mock 데이터 반환
    return getFallbackQuestions(subject, emotionScore);
  }
}

// Fallback 문제 (GPT 실패 시)
function getFallbackQuestions(subject: string, emotionScore: number): Question[] {
  const emotionBand = emotionScore >= 0.7 ? 'High' : 
                     emotionScore >= 0.4 ? 'Medium' : 'Low';
  
  return [
    {
      id: 'fallback_1',
      stem: `${subject} 관련 기본 문제입니다. 다음 중 가장 중요한 개념은 무엇인가요?`,
      options: [
        '기본 개념 A',
        '기본 개념 B', 
        '기본 개념 C',
        '기본 개념 D',
        '기본 개념 E'
      ],
      correctAnswer: 0,
      explanation: emotionBand === 'High' 
        ? 'GPT 서비스가 일시적으로 불가능하여 기본 문제를 제공합니다. 실제 서비스에서는 맞춤형 문제가 제공됩니다!'
        : 'AI 문제 생성 서비스 준비 중입니다. 조금만 기다려주세요.',
      difficulty: 'medium' as const,
      topic: '기본 개념',
      factScore: 0.85
    }
  ];
}

export default openai;