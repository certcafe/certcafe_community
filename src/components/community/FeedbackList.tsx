'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';
import { useRoutineFeedbacks } from '@/hooks/useCommunity';
import { MessageSquare, ThumbsUp, Filter, Calendar } from 'lucide-react';
import type { CommunityFeedback } from '@/types/store';

interface FeedbackListProps {
  routineId: string;
  className?: string;
}

export default function FeedbackList({ routineId, className }: FeedbackListProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  
  const { data: feedbacks = [], isLoading } = useRoutineFeedbacks(routineId);

  const filteredAndSortedFeedbacks = feedbacks
    .filter(feedback => {
      if (filterRating === null) return true;
      return feedback.rating === filterRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'helpful':
          // 실제로는 도움됨 투표 수로 정렬해야 함
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const averageRating = feedbacks.length > 0 
    ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: feedbacks.filter(f => f.rating === rating).length,
    percentage: feedbacks.length > 0 
      ? (feedbacks.filter(f => f.rating === rating).length / feedbacks.length) * 100 
      : 0
  }));

  const negativeRatio = feedbacks.length > 0
    ? feedbacks.filter(f => f.rating < 3).length / feedbacks.length
    : 0;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">피드백을 불러오는 중...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 통계 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span>피드백 요약</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {averageRating.toFixed(1)}
              </div>
              <Rating value={Math.round(averageRating)} readonly size="sm" />
              <p className="text-sm text-gray-600 mt-1">
                {feedbacks.length}개 리뷰
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {Math.round((1 - negativeRatio) * 100)}%
              </div>
              <p className="text-sm text-gray-600">만족도</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(negativeRatio * 100)}%
              </div>
              <p className="text-sm text-gray-600">개선 요청</p>
              {negativeRatio >= 0.1 && negativeRatio <= 0.3 && (
                <Badge className="mt-1 bg-orange-100 text-orange-800">
                  자동 보정 대상
                </Badge>
              )}
            </div>
          </div>

          {/* 평점 분포 */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">평점 분포</h4>
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-1 w-12">
                  <span>{rating}</span>
                  <div className="text-yellow-400">★</div>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-gray-600">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 필터 및 정렬 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">정렬:</span>
              <div className="flex space-x-1">
                {[
                  { key: 'recent', label: '최신순' },
                  { key: 'rating', label: '평점순' },
                  { key: 'helpful', label: '도움순' }
                ].map(option => (
                  <Button
                    key={option.key}
                    variant={sortBy === option.key ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setSortBy(option.key as any)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">평점 필터:</span>
              <div className="flex space-x-1">
                <Button
                  variant={filterRating === null ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilterRating(null)}
                >
                  전체
                </Button>
                {[5, 4, 3, 2, 1].map(rating => (
                  <Button
                    key={rating}
                    variant={filterRating === rating ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setFilterRating(rating)}
                  >
                    {rating}★
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 피드백 목록 */}
      <div className="space-y-4">
        {filteredAndSortedFeedbacks.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                {filterRating !== null 
                  ? `${filterRating}점 피드백이 없습니다.`
                  : '아직 피드백이 없습니다. 첫 번째 리뷰를 남겨보세요!'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedFeedbacks.map(feedback => (
            <Card key={feedback.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {feedback.user_id.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Rating value={feedback.rating} readonly size="sm" />
                        <Badge 
                          className={
                            feedback.rating >= 4 
                              ? 'bg-green-100 text-green-800'
                              : feedback.rating >= 3
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {feedback.rating >= 4 ? '만족' : feedback.rating >= 3 ? '보통' : '불만족'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(feedback.created_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-3">
                  {feedback.comment}
                </p>

                <div className="flex items-center justify-between">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>도움됨 (0)</span>
                  </Button>
                  
                  {feedback.negative_ratio > 0 && (
                    <Badge className="bg-orange-100 text-orange-800">
                      개선 의견
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}