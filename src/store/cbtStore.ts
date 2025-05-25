import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { supabase } from '@/lib/supabase';
import type { CBTSession, CBTQuestion, CBTAnswer } from '@/types/store';

interface CBTState {
  currentSession: CBTSession | null;
  questions: CBTQuestion[];
  answers: CBTAnswer[];
  currentQuestionIndex: number;
  isLoading: boolean;
  factScore: number;
  emotionDrift: number;
}

interface CBTActions {
  startSession: (examType: string) => Promise<void>;
  submitAnswer: (questionId: string, selectedOption: number, timeSpent: number) => void;
  generateExplanation: (questionId: string) => Promise<string>;
  calculateFactScore: () => number;
  finishSession: () => Promise<void>;
  resetSession: () => void;
}

export const useCBTStore = create<CBTState & CBTActions>()(
  immer((set, get) => ({
    // 상태
    currentSession: null,
    questions: [],
    answers: [],
    currentQuestionIndex: 0,
    isLoading: false,
    factScore: 0,
    emotionDrift: 0,

    // 액션
    startSession: async (examType: string) => {
      set((state) => {
        state.isLoading = true;
      });

      try {
        // GPT API를 통해 CBT 문제 생성
        const response = await fetch('/api/cbt/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ examType, questionCount: 10 }),
        });

        const { questions } = await response.json();

        // 새 세션 생성
        const { data: session, error } = await supabase
          .from('cbt_sessions')
          .insert({
            user_id: 'current-user-id', // 실제로는 auth store에서 가져와야 함
            questions,
            answers: [],
          })
          .select()
          .single();

        if (error) throw error;

        set((state) => {
          state.currentSession = session;
          state.questions = questions;
          state.answers = [];
          state.currentQuestionIndex = 0;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.isLoading = false;
        });
        throw error;
      }
    },

    submitAnswer: (questionId: string, selectedOption: number, timeSpent: number) => {
      const { questions } = get();
      const question = questions.find(q => q.id === questionId);
      const isCorrect = question ? question.correct_answer === selectedOption : false;

      const answer: CBTAnswer = {
        question_id: questionId,
        selected_option: selectedOption,
        is_correct: isCorrect,
        time_spent: timeSpent,
      };

      set((state) => {
        state.answers.push(answer);
        if (state.currentQuestionIndex < state.questions.length - 1) {
          state.currentQuestionIndex++;
        }
      });
    },

    generateExplanation: async (questionId: string): Promise<string> => {
      try {
        const response = await fetch('/api/cbt/explanation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId }),
        });

        const { explanation } = await response.json();
        return explanation;
      } catch (error) {
        console.error('Failed to generate explanation:', error);
        return '해설을 생성할 수 없습니다.';
      }
    },

    calculateFactScore: (): number => {
      const { answers } = get();
      if (answers.length === 0) return 0;

      const correctAnswers = answers.filter(a => a.is_correct).length;
      const score = correctAnswers / answers.length;
      
      set((state) => {
        state.factScore = score;
      });

      return score;
    },

    finishSession: async () => {
      const { currentSession, answers, factScore } = get();
      if (!currentSession) return;

      try {
        await supabase
          .from('cbt_sessions')
          .update({
            answers,
            fact_score: factScore,
            emotion_drift: get().emotionDrift,
            completed_at: new Date().toISOString(),
          })
          .eq('id', currentSession.id);
      } catch (error) {
        console.error('Failed to save session:', error);
      }
    },

    resetSession: () => {
      set((state) => {
        state.currentSession = null;
        state.questions = [];
        state.answers = [];
        state.currentQuestionIndex = 0;
        state.factScore = 0;
        state.emotionDrift = 0;
      });
    },
  }))
);