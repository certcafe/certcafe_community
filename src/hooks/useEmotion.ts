import { useMutation } from '@tanstack/react-query';
import { useEmotionStore } from '@/store';

// 감정 분석 뮤테이션
export function useAnalyzeEmotion() {
  const { updateEmotionScore, updateStressLevel, updateFatigueLevel } = useEmotionStore();

  return useMutation({
    mutationFn: async ({
      inputType,
      data,
    }: {
      inputType: 'text' | 'voice' | 'webcam';
      data: any;
    }) => {
      const response = await fetch('/api/analyze-emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputType, data }),
      });

      if (!response.ok) throw new Error('Failed to analyze emotion');
      
      const result = await response.json();
      return result;
    },
    onSuccess: (result) => {
      updateEmotionScore(result.emotionScore);
      updateStressLevel(result.stressLevel);
      updateFatigueLevel(result.fatigueLevel);
    },
  });
}

### 👥 `src/hooks/useCommunity.ts`
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store';
import type { CommunityFeedback } from '@/types/store';

// 쿼리 키 상수
export const communityKeys = {
  all: ['community'] as const,
  feedbacks: () => [...communityKeys.all, 'feedbacks'] as const,
  feedback: (routineId: string) => [...communityKeys.feedbacks(), routineId] as const,
};

// 루틴 피드백 조회
export function useRoutineFeedbacks(routineId: string) {
  return useQuery({
    queryKey: communityKeys.feedback(routineId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_feedbacks')
        .select('*')
        .eq('routine_id', routineId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CommunityFeedback[];
    },
    enabled: !!routineId,
  });
}

// 피드백 제출 뮤테이션
export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      routineId,
      rating,
      comment,
    }: {
      routineId: string;
      rating: number;
      comment: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('community_feedbacks')
        .insert({
          routine_id: routineId,
          user_id: user.id,
          rating,
          comment,
          negative_ratio: rating < 3 ? 1 : 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as CommunityFeedback;
    },
    onSuccess: (newFeedback) => {
      // 해당 루틴의 피드백 목록 업데이트
      queryClient.invalidateQueries({ 
        queryKey: communityKeys.feedback(newFeedback.routine_id) 
      });
    },
  });
}