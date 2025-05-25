import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCommunityStore } from '@/store';
import { useAuthStore } from '@/store';

// 피드백 제출 hook
export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  const { submitFeedback } = useCommunityStore();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ 
      postId, 
      vote, 
      comment 
    }: { 
      postId: string; 
      vote: 'up' | 'down'; 
      comment?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      await submitFeedback(postId, vote, comment);
    },
    onSuccess: () => {
      // 커뮤니티 데이터 새로고침
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['community-feedback'] });
    },
    onError: (error) => {
      console.error('Failed to submit feedback:', error);
    },
  });
}

// 커뮤니티 게시글 가져오기 hook
export function useCommunityPosts() {
  const { fetchPosts, posts, isLoading } = useCommunityStore();

  const query = useQuery({
    queryKey: ['community-posts'],
    queryFn: fetchPosts,
    staleTime: 5 * 60 * 1000, // 5분
  });

  return {
    posts,
    isLoading: isLoading || query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// 새 게시글 작성 hook
export function useCreatePost() {
  const queryClient = useQueryClient();
  const { createPost } = useCommunityStore();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ 
      title, 
      content 
    }: { 
      title: string; 
      content: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      await createPost(title, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onError: (error) => {
      console.error('Failed to create post:', error);
    },
  });
}

// 댓글 추가 hook
export function useAddComment() {
  const queryClient = useQueryClient();
  const { addComment } = useCommunityStore();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ 
      postId, 
      content 
    }: { 
      postId: string; 
      content: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      await addComment(postId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['community-comments'] });
    },
    onError: (error) => {
      console.error('Failed to add comment:', error);
    },
  });
}