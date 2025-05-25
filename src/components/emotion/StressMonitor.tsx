'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Progress from '@/components/ui/Progress';
import { AlertTriangle, Heart, Brain, Zap } from 'lucide-react';
import { useEmotionStore } from '@/store';

export default function StressMonitor() {
  const { 
    score, 
    stress_level, 
    fatigue_level, 
    getStressScore,
    updateStressLevel 
  } = useEmotionStore();

  // 가상의 오답률 (실제로는 CBT 결과에서 가져와야 함)
  const errorRate = 0.3; // 30% 오답률
  const stressScore = getStressScore(errorRate);

  const getStressLevel = (score: number) => {
    if (score > 0.7) return { level: '높음', color: 'bg-red-100 text-red-800', icon: '🚨' };
    if (score > 0.4) return { level: '보통', color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' };
    return { level: '낮음', color: 'bg-green-100 text-green-800', icon: '✅' };
  };

  const stressInfo = getStressLevel(stressScore);

  const handleStressReduction = () => {
    // 스트레스 완화 루틴 시작
    updateStressLevel(Math.max(0, stress_level - 0.2));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>스트레스 모니터</span>
          </CardTitle>
          <Badge className={stressInfo.color}>
            {stressInfo.icon} {stressInfo.level}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 종합 스트레스 점수 */}
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {Math.round(stressScore * 100)}점
          </div>
          <p className="text-gray-600">종합 스트레스 지수</p>
        </div>

        {/* 세부 지표들 */}
        <div className="space-y-4">
          {/* 감정 점수 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 flex items-center">
                <Heart className="h-4 w-4 mr-1 text-red-500" />
                감정 상태
              </span>
              <span className="font-medium">
                {score > 0 ? '긍정' : score < 0 ? '부정' : '중립'}
              </span>
            </div>
            <Progress 
              value={Math.abs(score) * 100} 
              max={100}
              variant={score > 0 ? 'success' : score < 0 ? 'error' : 'default'}
            />
          </div>

          {/* 스트레스 레벨 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                스트레스
              </span>
              <span className="font-medium">{Math.round(stress_level * 100)}%</span>
            </div>
            <Progress 
              value={stress_level * 100} 
              max={100}
              variant={stress_level > 0.7 ? 'error' : stress_level > 0.4 ? 'warning' : 'success'}
            />
          </div>

          {/* 피로도 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 flex items-center">
                <Zap className="h-4 w-4 mr-1 text-blue-500" />
                피로도
              </span>
              <span className="font-medium">{Math.round(fatigue_level * 100)}%</span>
            </div>
            <Progress 
              value={fatigue_level * 100} 
              max={100}
              variant={fatigue_level > 0.7 ? 'error' : fatigue_level > 0.4 ? 'warning' : 'success'}
            />
          </div>
        </div>

        {/* 경고 메시지 */}
        {stressScore > 0.6 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">높은 스트레스 감지</h4>
                <p className="text-sm text-red-800 mt-1">
                  현재 스트레스 수준이 높습니다. 휴식을 취하거나 학습 루틴을 조정하는 것을 권장합니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 권장 사항 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">권장 사항</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {stressScore > 0.7 ? (
              <>
                <li>• 즉시 학습을 중단하고 충분한 휴식을 취하세요</li>
                <li>• 깊은 호흡이나 가벼운 스트레칭을 해보세요</li>
                <li>• 학습 난이도를 낮춰보세요</li>
              </>
            ) : stressScore > 0.4 ? (
              <>
                <li>• 10-15분 휴식 후 학습을 재개하세요</li>
                <li>• 학습 세션 길이를 줄여보세요</li>
                <li>• 쉬운 문제부터 다시 시작해보세요</li>
              </>
            ) : (
              <>
                <li>• 현재 상태가 학습에 적합합니다</li>
                <li>• 꾸준한 페이스를 유지하세요</li>
                <li>• 정기적인 휴식을 잊지 마세요</li>
              </>
            )}
          </ul>
        </div>

        {/* 액션 버튼 */}
        {stressScore > 0.5 && (
          <div className="flex space-x-2">
            <Button
              variant="primary"
              onClick={handleStressReduction}
              className="flex-1"
            >
              스트레스 완화 루틴 시작
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}