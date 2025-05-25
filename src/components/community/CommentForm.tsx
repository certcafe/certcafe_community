// 📁 src/components/community/CommentForm.tsx - 게시물별 댓글 작성
import { useState } from 'react';
import { useCommunityStore } from '@/store/communityStore';

interface CommentFormProps {
  postId: string;
}

export default function CommentForm({ postId }: CommentFormProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addComment } = useCommunityStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 🎯 특정 게시물에만 댓글 추가
      await addComment(postId, comment.trim());
      setComment(''); // 성공 시 입력창 초기화
      
      // 🎉 성공 피드백
      console.log(`게시물 ${postId}에 댓글이 추가되었습니다.`);
      
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor={`comment-${postId}`} className="block text-sm font-medium text-gray-700 mb-2">
          💬 댓글 작성
        </label>
        <textarea
          id={`comment-${postId}`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          disabled={isSubmitting}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {comment.length}/500자
        </span>
        <button
          type="submit"
          disabled={isSubmitting || !comment.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              작성 중...
            </>
          ) : (
            '댓글 추가'
          )}
        </button>
      </div>
    </form>
  );
}