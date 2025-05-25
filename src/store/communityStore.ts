// 📁 src/store/communityStore.ts - 완전한 버전 (DB 오류 처리 + 테스트 데이터)
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  sentiment: number;
  created_at: string;
  user_email?: string;
}

interface Post {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: string;
  user_email?: string;
}

type SortOption = 'latest' | 'oldest' | 'popular';

interface CommunityState {
  posts: Post[];
  commentsByPost: Record<string, Comment[]>;
  isLoading: boolean;
  sortBy: SortOption;
  useTestData: boolean; // 🧪 테스트 데이터 모드
  
  fetchPosts: () => Promise<void>;
  addPost: (title: string, body: string) => Promise<void>;
  fetchComments: (postId: string) => Promise<void>;
  addComment: (postId: string, body: string) => Promise<void>;
  subscribeToComments: (postId: string) => () => void;
  setSortBy: (sort: SortOption) => void;
  loadTestData: () => void;
  toggleTestMode: () => void; // 🧪 테스트 모드 토글
}

export const useCommunityStore = create<CommunityState>()(
  immer((set, get) => ({
    posts: [],
    commentsByPost: {},
    isLoading: false,
    sortBy: 'latest',
    useTestData: false,

    fetchPosts: async () => {
      console.log('🔍 [DEBUG] fetchPosts 시작');
      const state = get();
      
      // 🧪 테스트 모드면 바로 테스트 데이터 로드
      if (state.useTestData) {
        console.log('🧪 [DEBUG] 테스트 모드 - 테스트 데이터 사용');
        get().loadTestData();
        return;
      }

      set((state) => {
        state.isLoading = true;
      });

      try {
        const orderDirection = state.sortBy === 'oldest' ? 'asc' : 'desc';
        
        const { data: posts, error } = await supabase
          .from('posts')
          .select(`
            id,
            user_id,
            title,
            body,
            created_at
          `)
          .order('created_at', { ascending: orderDirection === 'asc' });

        if (error) throw error;
        console.log('📄 [DEBUG] 불러온 게시물:', posts?.length || 0);

        set((state) => {
          state.posts = posts?.map(post => ({
            ...post,
            user_email: `사용자-${post.user_id.substring(0, 8)}`
          })) || [];
          state.isLoading = false;
        });
      } catch (error) {
        console.error('❌ [ERROR] 게시물 불러오기 실패:', error);
        
        // 🚨 DB 오류 시 자동으로 테스트 모드로 전환
        console.log('🧪 [DEBUG] DB 오류로 인해 테스트 모드로 전환');
        set((state) => {
          state.useTestData = true;
          state.isLoading = false;
        });
        get().loadTestData();
      }
    },

    addPost: async (title: string, body: string) => {
      console.log('📝 [DEBUG] 게시물 작성 시작:', { title, body });
      const state = get();

      // 🧪 테스트 모드면 로컬에서 추가
      if (state.useTestData) {
        const newPost: Post = {
          id: `test-post-${Date.now()}`,
          user_id: 'current-user',
          title,
          body,
          created_at: new Date().toISOString(),
          user_email: '현재사용자'
        };

        set((state) => {
          state.posts.unshift(newPost);
        });
        console.log('✅ [DEBUG] 테스트 모드: 게시물 추가 완료');
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || 'anonymous-user';

        const { data, error } = await supabase
          .from('posts')
          .insert({
            user_id: userId,
            title,
            body
          })
          .select(`
            id,
            user_id,
            title,
            body,
            created_at
          `)
          .single();

        if (error) throw error;
        console.log('✅ [DEBUG] 게시물 작성 성공:', data);

        set((state) => {
          const newPost = {
            ...data,
            user_email: `사용자-${data.user_id.substring(0, 8)}`
          };
          state.posts.unshift(newPost);
        });
      } catch (error) {
        console.error('❌ [ERROR] 게시물 작성 실패:', error);
        throw error;
      }
    },

    fetchComments: async (postId: string) => {
      console.log(`💬 [DEBUG] fetchComments 시작 - postId: ${postId}`);
      const state = get();
      
      // 🧪 테스트 모드거나 테스트 포스트면 바로 리턴
      if (state.useTestData || postId.startsWith('test-post-')) {
        console.log('🧪 [DEBUG] 테스트 데이터 모드 - 댓글은 이미 로드됨');
        return;
      }
      
      try {
        const { data: comments, error } = await supabase
          .from('comments')
          .select(`
            id,
            post_id,
            user_id,
            body,
            sentiment,
            created_at
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        console.log(`📝 [DEBUG] 불러온 댓글 (postId: ${postId}):`, comments?.length || 0);

        set((state) => {
          state.commentsByPost[postId] = comments?.map(comment => ({
            ...comment,
            user_email: `사용자-${comment.user_id.substring(0, 8)}`
          })) || [];
        });
      } catch (error) {
        console.error(`❌ [ERROR] 댓글 불러오기 실패 (postId: ${postId}):`, error);
        // 댓글 테이블이 없어도 빈 배열로 설정
        set((state) => {
          state.commentsByPost[postId] = [];
        });
      }
    },

    addComment: async (postId: string, body: string) => {
      console.log(`💭 [DEBUG] addComment 시작:`, { postId, body: body.substring(0, 50) + '...' });
      const state = get();

      // 🧪 테스트 모드이거나 테스트 포스트면 로컬에서 추가
      if (state.useTestData || postId.startsWith('test-post-')) {
        const newComment: Comment = {
          id: `test-comment-${Date.now()}`,
          post_id: postId,
          user_id: 'current-user',
          body,
          sentiment: Math.random() * 2 - 1, // -1 ~ 1 랜덤
          created_at: new Date().toISOString(),
          user_email: '현재사용자'
        };

        set((state) => {
          if (!state.commentsByPost[postId]) {
            state.commentsByPost[postId] = [];
          }
          state.commentsByPost[postId].push(newComment);
        });
        
        console.log('✅ [DEBUG] 테스트 모드: 댓글 추가 완료');
        return;
      }
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || 'anonymous-user';

        const { data, error } = await supabase
          .from('comments')
          .insert({
            post_id: postId,
            user_id: userId,
            body
          })
          .select(`
            id,
            post_id,
            user_id,
            body,
            sentiment,
            created_at
          `)
          .single();

        if (error) throw error;
        console.log(`✅ [DEBUG] 댓글 추가 성공:`, data);

        set((state) => {
          const newComment = {
            ...data,
            user_email: `사용자-${data.user_id.substring(0, 8)}`
          };
          
          if (!state.commentsByPost[postId]) {
            state.commentsByPost[postId] = [];
          }
          
          state.commentsByPost[postId].push(newComment);
        });
      } catch (error) {
        console.error(`❌ [ERROR] 댓글 작성 실패:`, error);
        throw error;
      }
    },

    subscribeToComments: (postId: string) => {
      console.log(`🔔 [DEBUG] 실시간 구독 시작 - postId: ${postId}`);
      const state = get();
      
      // 테스트 모드면 구독하지 않음
      if (state.useTestData || postId.startsWith('test-post-')) {
        console.log('🧪 [DEBUG] 테스트 모드 - 실시간 구독 스킵');
        return () => {}; // 빈 함수 반환
      }
      
      const channel = supabase
        .channel(`comments-${postId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        }, (payload) => {
          console.log(`🔥 [DEBUG] 실시간 댓글 수신:`, payload.new);
          
          set((state) => {
            const newComment = payload.new as Comment;
            
            if (!state.commentsByPost[postId]) {
              state.commentsByPost[postId] = [];
            }
            
            const exists = state.commentsByPost[postId].some(
              comment => comment.id === newComment.id
            );
            
            if (!exists) {
              state.commentsByPost[postId].push({
                ...newComment,
                user_email: `사용자-${newComment.user_id.substring(0, 8)}`
              });
            }
          });
        })
        .subscribe();

      return () => {
        console.log(`🔌 [DEBUG] 구독 해제 - postId: ${postId}`);
        supabase.removeChannel(channel);
      };
    },

    setSortBy: (sort: SortOption) => {
      console.log(`🔄 [DEBUG] 정렬 변경: ${sort}`);
      set((state) => {
        state.sortBy = sort;
      });
      
      // 정렬 변경 시 다시 로드
      get().fetchPosts();
    },

    toggleTestMode: () => {
      set((state) => {
        state.useTestData = !state.useTestData;
        console.log(`🧪 [DEBUG] 테스트 모드 ${state.useTestData ? '활성화' : '비활성화'}`);
      });
      
      // 모드 변경 시 다시 로드
      get().fetchPosts();
    },

    // 🧪 테스트 데이터 로드
    loadTestData: () => {
      console.log('🧪 [DEBUG] 테스트 데이터 로드');
      
      const testPosts: Post[] = [
        {
          id: 'test-post-1',
          user_id: 'test-user-1',
          title: '정보처리기사 루틴이 너무 어려워요',
          body: '3주차 루틴을 따라하고 있는데 너무 빡빡해서 힘들어요. 특히 데이터베이스 파트가 이해가 안 돼요. 혹시 다른 분들은 어떻게 하시나요?',
          created_at: new Date().toISOString(),
          user_email: '테스트사용자1'
        },
        {
          id: 'test-post-2',
          user_id: 'test-user-2', 
          title: '컴활 루틴 정말 좋아요!',
          body: '컴활 1급 루틴 따라하고 있는데 정말 체계적이고 좋네요. 엑셀 부분이 특히 도움이 많이 됐습니다. 감사합니다!',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          user_email: '테스트사용자2'
        },
        {
          id: 'test-post-3',
          user_id: 'test-user-3',
          title: '토익 스피킹 루틴 후기',
          body: 'AI가 생성해준 토익 스피킹 루틴 덕분에 Level 6 받았어요! 특히 감정 기반 조정 기능이 정말 신기했습니다.',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          user_email: '테스트사용자3'
        }
      ];

      const testComments: Record<string, Comment[]> = {
        'test-post-1': [
          {
            id: 'test-comment-1',
            post_id: 'test-post-1',
            user_id: 'test-user-4',
            body: '저도 같은 문제가 있어요. 너무 어렵습니다. 포기하고 싶네요.',
            sentiment: -0.7,
            created_at: new Date(Date.now() - 1800000).toISOString(),
            user_email: '테스트사용자4'
          },
          {
            id: 'test-comment-2',
            post_id: 'test-post-1',
            user_id: 'test-user-5',
            body: '데이터베이스는 천천히 하셔야 해요. 기초부터 다시 해보시길 추천드려요.',
            sentiment: 0.5,
            created_at: new Date(Date.now() - 900000).toISOString(),
            user_email: '테스트사용자5'
          },
          {
            id: 'test-comment-3',
            post_id: 'test-post-1',
            user_id: 'test-user-6',
            body: '저는 유튜브 강의랑 병행했어요. 도움이 많이 됐습니다!',
            sentiment: 0.3,
            created_at: new Date(Date.now() - 300000).toISOString(),
            user_email: '테스트사용자6'
          }
        ],
        'test-post-2': [
          {
            id: 'test-comment-4',
            post_id: 'test-post-2',
            user_id: 'test-user-7',
            body: '저도 이 루틴으로 합격했어요! 정말 추천합니다.',
            sentiment: 0.9,
            created_at: new Date(Date.now() - 600000).toISOString(),
            user_email: '테스트사용자7'
          },
          {
            id: 'test-comment-5',
            post_id: 'test-post-2',
            user_id: 'test-user-8',
            body: '엑셀 함수 부분이 특히 좋았어요. 실무에서도 쓸 수 있을 것 같아서 만족스럽습니다.',
            sentiment: 0.8,
            created_at: new Date(Date.now() - 450000).toISOString(),
            user_email: '테스트사용자8'
          }
        ],
        'test-post-3': [
          {
            id: 'test-comment-6',
            post_id: 'test-post-3',
            user_id: 'test-user-9',
            body: '감정 기반 조정이 뭔가요? 궁금해요!',
            sentiment: 0.2,
            created_at: new Date(Date.now() - 400000).toISOString(),
            user_email: '테스트사용자9'
          }
        ]
      };

      set((state) => {
        // 정렬 적용
        let sortedPosts = [...testPosts];
        if (state.sortBy === 'oldest') {
          sortedPosts.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        } else if (state.sortBy === 'latest') {
          sortedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        
        state.posts = sortedPosts;
        state.commentsByPost = testComments;
        state.isLoading = false;
      });

      console.log('✅ [DEBUG] 테스트 데이터 로드 완료');
    }
  }))
);