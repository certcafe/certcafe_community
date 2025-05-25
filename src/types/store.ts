// 기본 타입들
export interface User {
  id: string;
  email: string;
  name: string;
  target_exam: string;
  exam_date?: string;
  created_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  subject: string;
  duration: number;
  questions_solved: number;
  correct_answers: number;
  emotion_score: number;
  stress_score: number;
  created_at: string;
}

export interface CBTQuestion {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  emotion_band: 'high' | 'medium' | 'low';
}

export interface StudyRoutine {
  id: string;
  user_id: string;
  title: string;
  subjects: RoutineBlock[];
  total_duration: number;
  emotion_score: number;
  is_active: boolean;
  created_at: string;
}

export interface RoutineBlock {
  id: string;
  type: 'study' | 'break' | 'review' | 'cbt';
  subject: string;
  duration: number;
  order: number;
  completed: boolean;
}

export interface CommunityFeedback {
  id: string;
  routine_id: string;
  user_id: string;
  rating: number;
  comment: string;
  negative_ratio: number;
  created_at: string;
}

// 감정 상태 타입
export interface EmotionState {
  score: number; // -1 ~ 1
  band: 'high' | 'medium' | 'low';
  stress_level: number; // 0 ~ 1
  fatigue_level: number; // 0 ~ 1
  last_updated: string;
}
```