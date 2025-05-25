'use client';

import { useEmotionStore } from '@/store';
import { cn } from '@/lib/utils';

export default function EmotionIndicator() {
  const { score, band, stress_level, fatigue_level } = useEmotionStore();

  const getEmotionColor = (band: string) => {
    switch (band) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEmotionIcon = (band: string) => {
    switch (band) {
      case 'high':
        return '😊';
      case 'medium':
        return '😐';
      case 'low':
        return '😔';
      default:
        return '🤔';
    }
  };

  const getEmotionText = (band: string) => {
    switch (band) {
      case 'high':
        return '좋음';
      case 'medium':
        return '보통';
      case 'low':
        return '피곤함';
      default:
        return '분석중';
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <h3 className="font-medium text-gray-900">현재 학습 상태</h3>
      
      {/* 감정 상태 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">감정 상태</span>
        <div className={cn(
          'flex items-center px-3 py-1 rounded-full border text-sm font-medium',
          getEmotionColor(band)
        )}>
          <span className="mr-2">{getEmotionIcon(band)}</span>
          {getEmotionText(band)}
        </div>
      </div>

      {/* 스트레스 레벨 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">스트레스</span>
          <span className="font-medium">{Math.round(stress_level * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              stress_level > 0.7 ? 'bg-red-500' :
              stress_level > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
            )}
            style={{ width: `${stress_level * 100}%` }}
          />
        </div>
      </div>

      {/* 피로도 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">피로도</span>
          <span className="font-medium">{Math.round(fatigue_level * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              fatigue_level > 0.7 ? 'bg-red-500' :
              fatigue_level > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
            )}
            style={{ width: `${fatigue_level * 100}%` }}
          />
        </div>
      </div>

      {/* 추천 메시지 */}
      {stress_level > 0.7 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-sm text-orange-800">
            🧘‍♀️ 스트레스가 높습니다. 잠시 휴식을 취하세요.
          </p>
        </div>
      )}

      {fatigue_level > 0.8 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">
            😴 피로도가 매우 높습니다. 충분한 휴식이 필요해요.
          </p>
        </div>
      )}
    </div>
  );
}
