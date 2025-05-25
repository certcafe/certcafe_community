import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore, useEmotionStore } from '@/store';
import type { CBTQuestion } from '@/types/store';

// 쿼리 키 상수
export const cbtKeys = {
  all: ['cbt'] as const,
  questions: () => [...cbtKeys.all, 'questions'] as const,
  question: (filters: Record<string, any>) => [...cbtKeys.questions(), filters] as const,
  sessions: () => [...cbtKeys.all, 'sessions'] as const,
  session: (id: string) => [...cbtKeys.sessions(), id] as const,
};

// CBT 문제 생성
export function useGenerateCBT() {
  const { user } = useAuthStore();
  const { band: emotionBand } = useEmotionStore();

  return useMutation({
    mutationFn: async ({ 
      subject, 
      difficulty, 
      count = 10 
    }: { 
      subject: string; 
      difficulty: 'easy' | 'medium' | 'hard'; 
      count?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('/api/generate-cbt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          difficulty,
          count,
          emotionBand,
          userId: user.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate CBT questions');
      
      const questions = await response.json();
      return questions as CBTQuestion[];
    },
  });
}

// CBT 세션 결과 저장
export function useSubmitCBTSession() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      questions,
      answers,
      timeSpent,
    }: {
      questions: CBTQuestion[];
      answers: Record<string, number>;
      timeSpent: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // 점수 계산
      let correctCount = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correct_answer) {
          correctCount++;
        }
      });

      const score = (correctCount / questions.length) * 100;

      const { data, error } = await supabase
        .from('cbt_sessions')
        .insert({
          user_id: user.id,
          questions_total: questions.length,
          questions_correct: correctCount,
          score,
          duration: timeSpent,
          subject: questions[0]?.subject || 'mixed',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // 세션 목록 무효화
      queryClient.invalidateQueries({ queryKey: cbtKeys.sessions() });
    },
  });
}

// CBT 세션 기록 조회
export function useCBTSessions() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: cbtKeys.sessions(),
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('cbt_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}