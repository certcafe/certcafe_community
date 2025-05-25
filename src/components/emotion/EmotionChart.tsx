'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Chart from '@/components/ui/Chart';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { useEmotionStore } from '@/store';

export default function EmotionChart() {
  const { history } = useEmotionStore();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  // 샘플 데이터 (실제로는 history에서 가져와야 함)
  const [emotionData, setEmotionData] = useState([
    { x: '월', y: 0.2 },
    { x: '화', y: -0.1 },
    { x: '수', y: 0.3 },
    { x: '목', y: 0.5 },
    { x: '금', y: 0.1 },
    { x: '토', y: 0.7 },
    { x: '일', y: 0.4 },
  ]);

  const [stressData, setStressData] = useState([
    { x: '월', y: 0.6 },
    { x: '화', y: 0.8 },
    { x: '수', y: 0.4 },
    { x: '목', y: 0.3 },
    { x: '금', y: 0.7 },
    { x: '토', y: 0.2 },
    { x: '일', y: 0.5 },
  ]);

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'day': return '오늘';
      case 'week': return '이번 주';
      case 'month': return '이번 달';
    }
  };

  const getAverageEmotion = () => {
    const sum = emotionData.reduce((acc, curr) => acc + curr.y, 0);
    return (sum / emotionData.length).toFixed(2);
  };

  const getAverageStress = () => {
    const sum = stressData.reduce((acc, curr) => acc + curr.y, 0);
    return (sum / stressData.length * 100).toFixed(0);
  };

  const getTrend = () => {
    const recent = emotionData.slice(-3);
    const earlier = emotionData.slice(0, 3);
    
    const recentAvg = recent.reduce((acc, curr) => acc + curr.y, 0) / recent.length;
    const earlierAvg = earlier.reduce((acc, curr) => acc + curr.y, 0) / earlier.length;
    
    if (recentAvg > earlierAvg + 0.1) return { trend: '상승', color: 'text-green-600', icon: '📈' };
    if (recentAvg < earlierAvg - 0.1) return { trend: '하락', color: 'text-red-600', icon: '📉' };
    return { trend: '안정', color: 'text-blue-600', icon: '➡️' };
  };

  const trendInfo = getTrend();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>감정 변화 추이</span>
          </CardTitle>
          
          <div className="flex space-x-2">
            <Button
              variant={timeRange === 'day' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTimeRange('day')}
            >
              일간
            </Button>
            <Button
              variant={timeRange === 'week' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTimeRange('week')}
            >
              주간
            </Button>
            <Button
              variant={timeRange === 'month' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              월간
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 통계 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {getAverageEmotion()}
            </div>
            <p className="text-sm text-blue-800">평균 감정 점수</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {getAverageStress()}%
            </div>
            <p className="text-sm text-purple-800">평균 스트레스</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${trendInfo.color}`}>
              {trendInfo.icon}
            </div>
            <p className="text-sm text-gray-600">{trendInfo.trend} 추세</p>
          </div>
        </div>

        {/* 감정 점수 차트 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">감정 점수 변화</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setChartType(chartType === 'line' ? 'area' : 'line')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <Chart
              data={emotionData}
              type={chartType}
              color="#3b82f6"
              height={200}
            />
          </div>
        </div>

        {/* 스트레스 레벨 차트 */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">스트레스 레벨 변화</h3>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <Chart
              data={stressData}
              type="bar"
              color="#ef4444"
              height={200}
            />
          </div>
        </div>

        {/* 인사이트 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">📊 {getTimeRangeLabel()} 인사이트</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• 평균 감정 점수가 {getAverageEmotion()}로 {parseFloat(getAverageEmotion()) > 0 ? '긍정적' : '부정적'}입니다</li>
            <li>• 스트레스 수준이 {getAverageStress()}%로 {parseInt(getAverageStress()) > 50 ? '높은' : '낮은'} 편입니다</li>
            <li>• 최근 감정 상태가 {trendInfo.trend} 추세를 보이고 있습니다</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}