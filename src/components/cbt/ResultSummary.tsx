'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import { Trophy, Clock, Target, TrendingUp, Download, Share2 } from 'lucide-react';

interface CBTResult {
  id: string;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // seconds
  subject: string;
  difficulty: string;
  createdAt: string;
}

interface ResultSummaryProps {
  result: CBTResult;
  onRetry?: () => void;
  onReview?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export default function ResultSummary({ 
  result, 
  onRetry, 
  onReview,
  onDownload,
  onShare 
}: ResultSummaryProps) {
  const score = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const incorrectAnswers = result.totalQuestions - result.correctAnswers;
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}분 ${secs}초`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: '우수', color: 'bg-green-100 text-green-800' };
    if (score >= 80) return { text: '양호', color: 'bg-blue-100 text-blue-800' };
    if (score >= 60) return { text: '보통', color: 'bg-yellow-100 text-yellow-800' };
    return { text: '부족', color: 'bg-red-100 text-red-800' };
  };

  const getMotivationMessage = (score: number) => {
    if (score >= 90) return '🎉 훌륭합니다! 완벽에 가까운 점수예요!';
    if (score >= 80) return '👏 잘했어요! 조금만 더 노력하면 완벽해질 거예요!';
    if (score >= 60) return '💪 괜찮아요! 틀린 문제들을 복습해보세요!';
    return '🌟 포기하지 마세요! 꾸준한 학습이 실력을 늘려줄 거예요!';
  };

  const scoreBadge = getScoreBadge(score);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4">
          <Trophy className="h-16 w-16 mx-auto text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">시험 완료!</h1>
        <p className="text-gray-600">
          {result.subject} ({result.difficulty === 'easy' ? '쉬움' : 
           result.difficulty === 'medium' ? '보통' : '어려움'})
        </p>
      </div>

      {/* Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">결과 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
              {score}점
            </div>
            
            <Badge className={scoreBadge.color}>
              {scoreBadge.text}
            </Badge>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 font-medium">
                {getMotivationMessage(score)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {result.correctAnswers}
            </div>
            <p className="text-sm text-gray-600">정답</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <X className="h-8 w-8 mx-auto text-red-600 mb-2" />
            <div className="text-2xl font-bold text-red-600">
              {incorrectAnswers}
            </div>
            <p className="text-sm text-gray-600">오답</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(result.timeSpent)}
            </div>
            <p className="text-sm text-gray-600">소요 시간</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((result.correctAnswers / result.totalQuestions) * 100)}%
            </div>
            <p className="text-sm text-gray-600">정답률</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>문제별 결과</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>정답률</span>
            <span>{result.correctAnswers} / {result.totalQuestions}</span>
          </div>
          
          <Progress 
            value={result.correctAnswers} 
            max={result.totalQuestions}
            variant={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'}
            showLabel
          />

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-green-800 font-medium">정답</div>
              <div className="text-2xl font-bold text-green-600">
                {result.correctAnswers}개
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-red-800 font-medium">오답</div>
              <div className="text-2xl font-bold text-red-600">
                {incorrectAnswers}개
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        {onReview && (
          <Button
            variant="primary"
            onClick={onReview}
            className="flex items-center space-x-2"
          >
            <span>오답 노트</span>
          </Button>
        )}

        {onRetry && (
          <Button
            variant="secondary"
            onClick={onRetry}
            className="flex items-center space-x-2"
          >
            <span>다시 도전</span>
          </Button>
        )}

        {onDownload && (
          <Button
            variant="secondary"
            onClick={onDownload}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>결과 다운로드</span>
          </Button>
        )}

        {onShare && (
          <Button
            variant="secondary"
            onClick={onShare}
            className="flex items-center space-x-2"
          >
            <Share2 className="h-4 w-4" />
            <span>공유하기</span>
          </Button>
        )}
      </div>
    </div>
  );
}