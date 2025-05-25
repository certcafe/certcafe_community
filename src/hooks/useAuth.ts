import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store';
import type { User } from '@/types/store';

// 쿼리 키 상수
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  profile: (id: string) => [...authKeys.all, 'profile', id] as const,
};

// 현재 사용자 정보 조회
export function useUser() {
  const { setUser } = useAuthStore();

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setUser(null);
        return null;
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      setUser(profile);
      return profile as User;
    },
    enabled: true,
  });
}

// 로그인 뮤테이션
export function useSignIn() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 프로필 정보 가져오기
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;
        return profile as User;
      }

      return null;
    },
    onSuccess: (user) => {
      if (user) {
        setUser(user);
        // 사용자 관련 쿼리 업데이트
        queryClient.setQueryData(authKeys.user(), user);
        // 다른 관련 쿼리들 무효화
        queryClient.invalidateQueries({ queryKey: ['routines'] });
        queryClient.invalidateQueries({ queryKey: ['cbt'] });
      }
    },
  });
}

// 회원가입 뮤테이션
export function useSignUp() {
  return useMutation({
    mutationFn: async ({ 
      email, 
      password, 
      name,
      targetExam 
    }: { 
      email: string; 
      password: string; 
      name: string;
      targetExam: string;
    }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            name,
            target_exam: targetExam,
          });

        if (profileError) throw profileError;
      }

      return data;
    },
  });
}

// 로그아웃 뮤테이션
export function useSignOut() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      setUser(null);
      // 모든 쿼리 캐시 클리어
      queryClient.clear();
    },
  });
}

// 프로필 업데이트 뮤테이션
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  return useMutation({
    mutationFn: async (updates: Partial<User>) => {
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as User;
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(authKeys.user(), updatedUser);
    },
  });
}