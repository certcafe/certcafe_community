import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types/store';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  immer((set, get) => ({
    // 상태
    user: null,
    isLoading: false,
    isAuthenticated: false,

    // 액션
    signIn: async (email: string, password: string) => {
      set((state) => {
        state.isLoading = true;
      });

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          set((state) => {
            state.user = profile;
            state.isAuthenticated = true;
            state.isLoading = false;
          });
        }
      } catch (error) {
        set((state) => {
          state.isLoading = false;
        });
        throw error;
      }
    },

    signUp: async (email: string, password: string, name: string) => {
      set((state) => {
        state.isLoading = true;
      });

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          await supabase.from('users').insert({
            id: data.user.id,
            email,
            name,
            target_exam: '',
          });
        }

        set((state) => {
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.isLoading = false;
        });
        throw error;
      }
    },

    signOut: async () => {
      await supabase.auth.signOut();
      set((state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
    },

    updateProfile: async (updates: Partial<User>) => {
      const user = get().user;
      if (!user) return;

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      set((state) => {
        if (state.user) {
          Object.assign(state.user, updates);
        }
      });
    },

    setUser: (user: User | null) => {
      set((state) => {
        state.user = user;
        state.isAuthenticated = !!user;
      });
    },

    checkSession: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set((state) => {
          state.user = profile;
          state.isAuthenticated = true;
        });
      }
    },
  }))
);