'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import EmotionChart from './EmotionChart';
import StressMonitor from './StressMonitor';
import WebcamCapture from '@/components/webcam/WebcamCapture';
import Calendar from '@/components/ui/Calendar';
import { useEmotionStore } from '@/store';
import { Brain, Camera, Calendar as CalendarIcon, BarChart3 } from 'lucide-react';

export default function EmotionDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'calendar'>('overview');
  const { score, stress_level, fatigue_level, last_updated } = useEmotionStore();

  // 샘플 감정 데이터 (실제로는 데이터베이스에서 가져와야 함)
  const emotionCalendarData = {
    '2024-01-15': { score: 0.7, stress: 0.3 },
    '2024-01-16': { score: 0.2, stress: 0.8 },
    '2024-01-17': { score: 0.5, stress: 0.4 },
    '2024-01-18': { score: 0.8, stress: 0.2 },
    '2024-01-19': { score: 0.3, stress: 0.6 },
  };

  const handleAnalysisComplete = (result: any) => {
    console.log('감정 분석 완료:', result);
  };

  const handleDateSelect = (date: string) => {
    console.log('선택된 날짜:', date);
  };

  const tabs = [
    { id: 'overview', label: '개요', icon: Brain },
    { id: 'analysis', label: '실시간 분석', icon: Camera },
    { id: 'calendar', label: '감정 캘린더', icon: CalendarIcon },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          감정 분석 대시보드 😊
        </h1>
        <p className="text-gray-600">
          AI가 분석한 학습 감정 상태를 확인하고 맞춤형 피드백을 받아보세요
        </p>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">😊</div>
            <div className="text-lg font-bold text-blue-600">
              {score > 0 ? '+' : ''}{score.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">감정 점수</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <div className="text-lg font-bold text-orange-600">
              {Math.round(stress_level * 100)}%
            </div>
            <p className="text-sm text-gray-600">스트레스</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🔋</div>
            <div className="text-lg font-bold text-green-600">
              {Math.round((1 - fatigue_level) * 100)}%
            </div>
            <p className="text-sm text-gray-600">에너지</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🕐</div>
            <div className="text-lg font-bold text-gray-600">
              {new Date(last_updated).toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <p className="text-sm text-gray-600">마지막 업데이트</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EmotionChart />
            <StressMonitor />
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WebcamCapture onAnalysisComplete={handleAnalysisComplete} />
            <StressMonitor />
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Calendar 
              emotionData={emotionCalendarData} 
              onDateSelect={handleDateSelect}
            />
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>감정 캘린더 가이드</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                      <span className="text-sm">😊 좋은 감정 상태 (학습 효율 높음)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                      <span className="text-sm">😐 보통 감정 상태 (적절한 학습)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                      <span className="text-sm">😔 주의 필요 (휴식 권장)</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      날짜를 클릭하면 해당 날의 상세한 감정 분석 결과를 확인할 수 있습니다.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>이번 주 감정 요약</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">평균 감정 점수:</span>
                      <span className="font-medium">+0.5 (양호)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">스트레스 높은 날:</span>
                      <span className="font-medium">2일</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">최고 컨디션:</span>
                      <span className="font-medium">목요일</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">권장 휴식일:</span>
                      <span className="font-medium">화요일, 금요일</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}