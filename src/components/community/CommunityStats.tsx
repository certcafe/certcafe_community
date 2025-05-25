'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import { TrendingUp, Users, MessageCircle, Zap } from 'lucide-react';

interface CommunityStatsProps {
  totalFeedbacks: number;
  averageRating: number;
  negativeRatio: number;
  activeUsers: number;
  reconfigurationCount: number;
  className?: string;
}

export default function CommunityStats({
  totalFeedbacks,
  averageRating,
  negativeRatio,
  activeUsers,
  reconfigurationCount,
  className
}: CommunityStatsProps) {
  const getHealthStatus = () => {
    if (averageRating >= 4.0 && negativeRatio < 0.1) {
      return { status: '매우 좋음', color: 'bg-green-100 text-green-800', icon: '🎉' };
    }
    if (averageRating >= 3.5 && negativeRatio < 0.2) {
      return { status: '좋음', color: 'bg-blue-100 text-blue-800', icon: '👍' };
    }
    if (averageRating >= 3.0 && negativeRatio < 0.3) {
      return { status: '보통', color: 'bg-yellow-100 text-yellow-800', icon: '🤔' };
    }
    return { status: '개선 필요', color: 'bg-red-100 text-red-800', icon: '⚠️' };
  };

  const healthStatus = getHealthStatus();
  const isReconfigurationTriggered = negativeRatio >= 0.1 && negativeRatio <= 0.3;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          <span>커뮤니티 현황</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 전체 상태 */}
        <div className="text-center">
          <Badge className={healthStatus.color} size="lg">
            {healthStatus.icon} {healthStatus.status}
          </Badge>
          <p className="text-sm text-gray-600 mt-2">커뮤니티 건강도</p>
        </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Users className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-blue-600">{activeUsers}</div>
            <p className="text-sm text-blue-800">활성 사용자</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <MessageCircle className="h-6 w-6 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold text-green-600">{totalFeedbacks}</div>
            <p className="text-sm text-green-800">총 피드백</p>
          </div>
        </div>

        {/* 평점 현황 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">평균 평점</span>
            <span className="font-bold text-lg">{averageRating.toFixed(1)}/5.0</span>
          </div>
          <Progress 
            value={averageRating * 20} 
            max={100}
            variant={averageRating >= 4 ? 'success' : averageRating >= 3 ? 'warning' : 'error'}
          />
        </div>

        {/* 부정 피드백 비율 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">부정 피드백 비율</span>
            <div className="flex items-center space-x-2">
              <span className="font-bold">{Math.round(negativeRatio * 100)}%</span>
              {isReconfigurationTriggered && (
                <Badge className="bg-orange-100 text-orange-800 text-xs">
                  보정 구간
                </Badge>
              )}
            </div>
          </div>
          <Progress 
            value={negativeRatio * 100} 
            max={100}
            variant={negativeRatio > 0.3 ? 'error' : negativeRatio > 0.1 ? 'warning' : 'success'}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span className="text-orange-600">보정 구간 (10-30%)</span>
            <span>100%</span>
          </div>
        </div>

        {/* AI 보정 현황 */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-900">AI 자동 보정</span>
            </div>
            <Badge className="bg-purple-100 text-purple-800">
              {reconfigurationCount}회 실행
            </Badge>
          </div>
          
          {isReconfigurationTriggered ? (
            <p className="text-sm text-purple-800">
              🤖 부정 피드백이 임계값에 도달했습니다. AI가 루틴을 자동으로 보정합니다.
            </p>
          ) : negativeRatio > 0.3 ? (
            <p className="text-sm text-purple-800">
              ⚠️ 부정 피드백이 30%를 초과했습니다. 수동 검토가 필요합니다.
            </p>
          ) : (
            <p className="text-sm text-purple-800">
              ✅ 피드백 상태가 양호합니다. 자동 보정이 필요하지 않습니다.
            </p>
          )}
        </div>

        {/* 트렌드 인사이트 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">📈 주간 트렌드</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 이번 주 신규 피드백: +{Math.round(totalFeedbacks * 0.15)}건</li>
            <li>• 평점 변화: {averageRating >= 4 ? '↗️ 상승' : averageRating >= 3 ? '→ 유지' : '↘️ 하락'}</li>
            <li>• 가장 많은 개선 요청: 학습량 조정 ({Math.round(negativeRatio * 100 * 0.6)}%)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}