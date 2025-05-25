import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5분간 캐시 유지
      staleTime: 1000 * 60 * 5,
      // 브라우저 포커스 시 자동 재요청 비활성화
      refetchOnWindowFocus: false,
      // 네트워크 재연결 시 자동 재요청
      refetchOnReconnect: true,
      // 에러 발생 시 재시도 설정
      retry: (failureCount, error: any) => {
        // 401, 403 에러는 재시도하지 않음
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // 최대 3번까지 재시도
        return failureCount < 3;
      },
      // 재시도 지연 시간 (지수적 증가)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // 에러 발생 시 재시도하지 않음
      retry: false,
      // 에러 시 자동으로 관련 쿼리 무효화
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});