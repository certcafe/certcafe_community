// src/hooks/useRoutines.ts - 완전 수정 버전
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore, useEmotionStore } from '@/store';

// 쿼리 키 상수
export const routineKeys = {
  all: ['routines'] as const,
  lists: () => [...routineKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...routineKeys.lists(), filters] as const,
  details: () => [...routineKeys.all, 'detail'] as const,
  detail: (id: string) => [...routineKeys.details(), id] as const,
  current: () => [...routineKeys.all, 'current'] as const,
};

// 타입 정의
interface StudyRoutine {
  id: string;
  title: string;
  description?: string;
  subjects: any[];
  totalDuration: number;
  emotionScore: number;
  isActive: boolean;
  createdAt: string;
}

interface CreateRoutineParams {
  examType: string;
  availableHours: number;
  subjects: string[];
  examDate?: string;
  preferredTime?: string;
  studyStyle?: string;
  difficulty?: string;
}

// 루틴 목록 조회
export function useRoutines() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: routineKeys.list({ userId: user?.id || 'anonymous' }),
    queryFn: async () => {
      // 임시 더미 데이터 반환 (Supabase 연동 전)
      return [] as StudyRoutine[];
    },
    enabled: true, // 항상 활성화
  });
}

// 현재 활성 루틴 조회
export function useCurrentRoutine() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: routineKeys.current(),
    queryFn: async () => {
      // 임시 더미 데이터 반환
      return null as StudyRoutine | null;
    },
    enabled: true,
  });
}

// 🔥 루틴 생성 뮤테이션 (핵심 기능)
export function useCreateRoutine() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { currentEmotion } = useEmotionStore();

  return useMutation({
    mutationFn: async (params: CreateRoutineParams) => {
      console.log('🚀 루틴 생성 뮤테이션 실행:', params);

      // 🔥 시험까지 남은 일수 계산
      const daysUntilExam = params.examDate 
        ? Math.max(1, Math.ceil((new Date(params.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
        : 30; // 기본값 30일

      // /api/routine/generate 호출
      const response = await fetch('/api/routine/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // 🔥 API에서 요구하는 필수 파라미터들
          examType: params.examType,           // ✅ 필수
          studyHours: params.availableHours,   // ✅ 필수 (이름 주의)
          daysUntilExam,                       // ✅ 필수 (추가됨)
          userId: user?.id || null,            // 🔥 감정 데이터 조회용
          
          // 🔥 추가 데이터 (선택사항)
          examDate: params.examDate,
          weakTopics: params.subjects,
          emotionScore: currentEmotion.score,
          errorRate: (1 - currentEmotion.confidence) * 0.5,
          enhancedEmotion: currentEmotion,
          useRealTimeEmotion: true,
          preferredTime: params.preferredTime,
          studyStyle: params.studyStyle,
          difficulty: params.difficulty
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`루틴 생성 실패: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ 루틴 생성 성공:', result);

      return result;
    },
    onSuccess: (newRoutine) => {
      console.log('🎉 루틴 생성 완료, 캐시 업데이트');
      
      // 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: routineKeys.current() });
      queryClient.invalidateQueries({ queryKey: routineKeys.lists() });
    },
    onError: (error) => {
      console.error('❌ 루틴 생성 오류:', error);
    }
  });
}

// 루틴 재편성 뮤테이션
export function useReconfigureRoutine() {
  const queryClient = useQueryClient();
  const { currentEmotion } = useEmotionStore();

  return useMutation({
    mutationFn: async (routineId: string) => {
      console.log('🔄 루틴 재편성 요청:', routineId);

      const response = await fetch('/api/routine/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routineId,
          emotionScore: currentEmotion.score,
          errorRate: (1 - currentEmotion.confidence) * 0.5,
          reconfigure: true
        }),
      });

      if (!response.ok) throw new Error('루틴 재편성 실패');
      
      return await response.json();
    },
    onSuccess: (updatedRoutine) => {
      queryClient.setQueryData(routineKeys.current(), updatedRoutine);
      queryClient.invalidateQueries({ queryKey: routineKeys.lists() });
    },
  });
}

// 블록 완료 뮤테이션
export function useCompleteBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ routineId, blockId }: { routineId: string; blockId: string }) => {
      console.log('✅ 블록 완료:', { routineId, blockId });
      
      // 임시로 성공 응답 반환
      return { success: true, blockId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routineKeys.current() });
    },
  });
}

// 🔧 추가 유틸리티 훅들
export function useRoutineStats() {
  return useQuery({
    queryKey: ['routine-stats'],
    queryFn: async () => {
      // 임시 통계 데이터
      return {
        totalRoutines: 0,
        completedBlocks: 0,
        totalStudyTime: 0,
        averageScore: 0
      };
    },
  });
}

export function useExportRoutineToICS() {
  return useMutation({
    mutationFn: async (routineId: string) => {
      const response = await fetch(`/api/routine/export-ics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routineId }),
      });

      if (!response.ok) throw new Error('ICS 내보내기 실패');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // 파일 다운로드
      const a = document.createElement('a');
      a.href = url;
      a.download = `study-routine-${routineId}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    },
  });
}