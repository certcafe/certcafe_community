import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { supabase } from '@/lib/supabase';
import type { Routine, RoutineBlock, StressScore } from '@/types/store';

interface RoutineState {
  currentRoutine: Routine | null;
  routines: Routine[];
  isGenerating: boolean;
  isLoading: boolean;
}

interface RoutineActions {
  generateRoutine: (examType: string, availableTime: string, preferences: any) => Promise<void>;
  reorganizeRoutine: (stressScore: number, emotionBand: string) => Promise<void>;
  saveRoutine: (routine: Routine) => Promise<void>;
  loadRoutines: () => Promise<void>;
  exportToICS: (routineId: string) => Promise<string>;
  updateRoutineBlock: (blockId: string, updates: Partial<RoutineBlock>) => void;
}

export const useRoutineStore = create<RoutineState & RoutineActions>()(
  immer((set, get) => ({
    // 상태
    currentRoutine: null,
    routines: [],
    isGenerating: false,
    isLoading: false,

    // 액션
    generateRoutine: async (examType: string, availableTime: string, preferences: any) => {
      set((state) => {
        state.isGenerating = true;
      });

      try {
        // GPT API를 통해 루틴 생성
        const response = await fetch('/api/routine/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            examType,
            availableTime,
            preferences,
          }),
        });

        const { routine } = await response.json();

        // Supabase에 저장
        const { data: savedRoutine, error } = await supabase
          .from('routines')
          .insert({
            user_id: 'current-user-id', // 실제로는 auth store에서 가져와야 함
            title: routine.title,
            description: routine.description,
            schedule: routine.schedule,
            stress_score: 0,
            emotion_band: 'Medium',
          })
          .select()
          .single();

        if (error) throw error;

        set((state) => {
          state.currentRoutine = savedRoutine;
          state.routines.push(savedRoutine);
          state.isGenerating = false;
        });
      } catch (error) {
        set((state) => {
          state.isGenerating = false;
        });
        throw error;
      }
    },

    reorganizeRoutine: async (stressScore: number, emotionBand: string) => {
      const { currentRoutine } = get();
      if (!currentRoutine) return;

      try {
        // StressScore ≥ 0.30이면 휴식 블록 삽입 및 오답 복습 블록 우선 배치
        if (stressScore >= 0.30) {
          const response = await fetch('/api/routine/reorganize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              routineId: currentRoutine.id,
              stressScore,
              emotionBand,
              action: 'stress_relief',
            }),
          });

          const { reorganizedRoutine } = await response.json();

          // 재편성된 루틴으로 업데이트
          await supabase
            .from('routines')
            .update({
              schedule: reorganizedRoutine.schedule,
              stress_score: stressScore,
              emotion_band: emotionBand,
              updated_at: new Date().toISOString(),
            })
            .eq('id', currentRoutine.id);

          set((state) => {
            state.currentRoutine = {
              ...state.currentRoutine!,
              schedule: reorganizedRoutine.schedule,
              stress_score: stressScore,
              emotion_band: emotionBand as any,
            };
          });
        }
      } catch (error) {
        console.error('Failed to reorganize routine:', error);
      }
    },

    saveRoutine: async (routine: Routine) => {
      try {
        const { error } = await supabase
          .from('routines')
          .upsert(routine);

        if (error) throw error;

        set((state) => {
          const index = state.routines.findIndex(r => r.id === routine.id);
          if (index >= 0) {
            state.routines[index] = routine;
          } else {
            state.routines.push(routine);
          }
        });
      } catch (error) {
        throw error;
      }
    },

    loadRoutines: async () => {
      set((state) => {
        state.isLoading = true;
      });

      try {
        const { data: routines, error } = await supabase
          .from('routines')
          .select('*')
          .eq('user_id', 'current-user-id')
          .order('created_at', { ascending: false });

        if (error) throw error;

        set((state) => {
          state.routines = routines || [];
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.isLoading = false;
        });
        throw error;
      }
    },

    exportToICS: async (routineId: string): Promise<string> => {
      try {
        const response = await fetch('/api/routine/export-ics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ routineId }),
        });

        const { icsUrl } = await response.json();
        
        // 루틴에 ICS URL 저장
        await supabase
          .from('routines')
          .update({ ics_url: icsUrl })
          .eq('id', routineId);

        return icsUrl;
      } catch (error) {
        console.error('Failed to export to ICS:', error);
        throw error;
      }
    },

    updateRoutineBlock: (blockId: string, updates: Partial<RoutineBlock>) => {
      set((state) => {
        if (state.currentRoutine) {
          const blockIndex = state.currentRoutine.schedule.findIndex(
            block => block.id === blockId
          );
          if (blockIndex >= 0) {
            Object.assign(state.currentRoutine.schedule[blockIndex], updates);
          }
        }
      });
    },
  }))
);