'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import Rating from '@/components/ui/Rating';
import { useSubmitFeedback } from '@/hooks/useCommunity';
import { useAuthStore } from '@/store';
import { MessageSquare, Send, ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackFormProps {
  routineId: string;
  onSubmitSuccess?: () => void;
  className?: string;
}

export default function FeedbackForm({ routineId, onSubmitSuccess, className }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | null>(null);
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});

  const { user } = useAuthStore();
  const submitFeedback = useSubmitFeedback();

  const validateForm = () => {
    const newErrors: { rating?: string; comment?: string } = {};
    
    if (rating === 0) {
      newErrors.rating = '평점을 선택해주세요';
    }
    
    if (!comment.trim()) {
      newErrors.comment = '피드백을 입력해주세요';
    } else if (comment.length < 10) {
      newErrors.comment = '최소 10자 이상 입력해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await submitFeedback.mutateAsync({
        routineId,
        rating,
        comment: comment.trim()
      });
      
      // 폼 초기화
      setRating(0);
      setComment('');
      setFeedbackType(null);
      setErrors({});
      
      onSubmitSuccess?.();
    } catch (error) {
      console.error('피드백 제출 실패:', error);
    }
  };

  const handleQuickFeedback = (type: 'positive' | 'negative') => {
    setFeedbackType(type);
    setRating(type === 'positive' ? 5 : 2);
    
    const templates = {
      positive: '이 루틴이 정말 도움이 되었어요! 추천합니다.',
      negative: '루틴이 너무 어렵거나 시간이 부족해요. 조정이 필요할 것 같아요.'
    };
    
    setComment(templates[type]);
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">피드백을 남기려면 로그인이 필요합니다.</p>
          <Button variant="primary">로그인하기</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <span>루틴 피드백</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 빠른 피드백 버튼 */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">빠른 피드백</label>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant={feedbackType === 'positive' ? 'primary' : 'secondary'}
                onClick={() => handleQuickFeedback('positive')}
                className="flex items-center space-x-2"
              >
                <ThumbsUp className="h-4 w-4" />
                <span>도움됨</span>
              </Button>
              <Button
                type="button"
                variant={feedbackType === 'negative' ? 'danger' : 'secondary'}
                onClick={() => handleQuickFeedback('negative')}
                className="flex items-center space-x-2"
              >
                <ThumbsDown className="h-4 w-4" />
                <span>개선 필요</span>
              </Button>
            </div>
          </div>

          {/* 평점 */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              루틴 만족도 <span className="text-red-500">*</span>
            </label>
            <Rating
              value={rating}
              onChange={setRating}
              showLabel
              size="lg"
            />
            {errors.rating && (
              <p className="text-sm text-red-600">{errors.rating}</p>
            )}
          </div>

          {/* 상세 피드백 */}
          <TextArea
            label="상세 피드백"
            placeholder="이 루틴에 대한 솔직한 의견을 들려주세요. 어떤 부분이 좋았는지, 개선이 필요한 부분은 무엇인지 자세히 적어주세요."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            error={errors.comment}
            helperText={`${comment.length}/500자`}
            maxLength={500}
            rows={4}
            required
          />

          {/* 제출 버튼 */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full flex items-center justify-center space-x-2"
            loading={submitFeedback.isPending}
            disabled={rating === 0 || !comment.trim()}
          >
            <Send className="h-4 w-4" />
            <span>피드백 제출</span>
          </Button>
        </form>

        {/* 안내 메시지 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">📊 집단지성 시스템</h4>
          <p className="text-sm text-blue-800">
            여러분의 피드백이 모여 더 나은 루틴으로 자동 개선됩니다. 
            부정적 피드백이 10-30% 범위에 도달하면 AI가 루틴을 자동으로 보정합니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}