// 📁 src/components/community/CommentList.tsx - 디버깅 로그 추가
import { useEffect } from 'react';
import { useCommunityStore } from '@/store/communityStore';

interface CommentListProps {
  postId: string;
}

function getSentimentText(score: number): string {
  if (score > 0.1) return '😊 긍정';
  if (score < -0.1) return '😔 부정';
  return '😐 중립';
}

function getSentimentColor(score: number): string {
  if (score > 0.1) return 'text-green-600';
  if (score < -0.1) return 'text-red-600';
  return 'text-gray-600';
}

export default function CommentList({ postId }: CommentListProps) {
  const { 
    commentsByPost, 
    fetchComments, 
    subscribeToComments 
  } = useCommunityStore();

  const comments = commentsByPost[postId] || [];

  // 🔍 디버깅: 현재 상태 출력
  useEffect(() => {
    console.log(`🎯 [CommentList DEBUG] 렌더링:`, {
      postId,
      commentsCount: comments.length,
      allPostIds: Object.keys(commentsByPost),
      comments: comments.map(c => ({ id: c.id, body: c.body.substring(0, 30) + '...' }))
    });
  }, [postId, comments, commentsByPost]);

  useEffect(() => {
    console.log(`🔄 [CommentList DEBUG] useEffect 실행 - postId: ${postId}`);
    
    // 댓글 로드
    fetchComments(postId);

    // 실시간 구독
    const unsubscribe = subscribeToComments(postId);

    return () => {
      console.log(`🧹 [CommentList DEBUG] 컴포넌트 언마운트 - postId: ${postId}`);
      unsubscribe();
    };
  }, [postId, fetchComments, subscribeToComments]);

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>아직 댓글이 없습니다.</p>
        <p className="text-sm">첫 번째 댓글을 작성해보세요! 💬</p>
        <p className="text-xs text-red-500 mt-2">
          🔍 DEBUG: postId = {postId}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">
        💬 댓글 {comments.length}개
        <span className="text-xs text-blue-500 ml-2">
          (postId: {postId})
        </span>
      </h3>
      
      {comments.map((comment, index) => (
        <div 
          key={comment.id} 
          className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-200"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">
                {comment.user_email || '익명'}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${getSentimentColor(comment.sentiment)}`}>
                {getSentimentText(comment.sentiment)}
              </span>
              <span className="text-xs text-purple-500">
                #{index + 1}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(comment.created_at).toLocaleString('ko-KR')}
            </span>
          </div>
          
          <p className="text-gray-800 leading-relaxed">
            {comment.body}
          </p>
          
          <div className="text-xs text-gray-400 mt-2">
            🔍 ID: {comment.id} | PostID: {comment.post_id}
          </div>
        </div>
      ))}
    </div>
  );
}