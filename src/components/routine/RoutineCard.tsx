'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { StudyRoutine } from '@/types/store';
import { Calendar, Clock, BookOpen, TrendingUp } from 'lucide-react';

interface RoutineCardProps {
  routine: StudyRoutine;
  onStart?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function RoutineCard({ routine, onStart, onEdit, onDelete }: RoutineCardProps) {
  const completedBlocks = routine.subjects.filter(block => block.completed).length;
  const totalBlocks = routine.subjects.length;
  const progressPercentage = totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 0;

  const getEmotionBadge = (score: number) => {
    if (score > 0.33) return { text: '좋음', color: 'bg-green-100 text-green-800' };
    if (score > -0.33) return { text: '보통', color: 'bg-yellow-100 text-yellow-800' };
    return { text: '주의', color: 'bg-red-100 text-red-800' };
  };

  const emotionBadge = getEmotionBadge(routine.emotion_score);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{routine.title}</CardTitle>
          <div className="flex space-x-2">
            <Badge className={emotionBadge.color}>
              {emotionBadge.text}
            </Badge>
            {routine.is_active && (
              <Badge className="bg-blue-100 text-blue-800">
                활성
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 진행률 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">진행률</span>
            <span className="font-medium">{completedBlocks}/{totalBlocks} 완료</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* 정보 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            {Math.round(routine.total_duration / 60)}시간
          </div>
          <div className="flex items-center text-gray-600">
            <BookOpen className="w-4 h-4 mr-2" />
            {routine.subjects.length}개 블록
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(routine.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center text-gray-600">
            <TrendingUp className="w-4 h-4 mr-2" />
            감정점수 {routine.emotion_score.toFixed(1)}
          </div>
        </div>

        {/* 다음 블록 미리보기 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">다음 학습</h4>
          {routine.subjects.find(block => !block.completed) ? (
            <div className="text-sm text-gray-600">
              {routine.subjects.find(block => !block.completed)?.subject} - 
              {routine.subjects.find(block => !block.completed)?.duration}분
            </div>
          ) : (
            <div className="text-sm text-green-600">🎉 모든 학습 완료!</div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex space-x-2">
          <Button
            onClick={onStart}
            variant="primary"
            size="sm"
            className="flex-1"
            disabled={progressPercentage === 100}
          >
            {progressPercentage === 100 ? '완료됨' : '시작하기'}
          </Button>
          {onEdit && (
            <Button onClick={onEdit} variant="secondary" size="sm">
              수정
            </Button>
          )}
          {onDelete && (
            <Button onClick={onDelete} variant="secondary" size="sm">
              삭제
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}