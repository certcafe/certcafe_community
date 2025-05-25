'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  emotionScore?: number;
  stressLevel?: number;
}

interface CalendarProps {
  emotionData?: Record<string, { score: number; stress: number }>;
  onDateSelect?: (date: string) => void;
  className?: string;
}

export default function Calendar({ emotionData = {}, onDateSelect, className }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days: CalendarDay[] = [];

  // 이전 달 마지막 주
  const prevMonth = new Date(year, month - 1, 0);
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: prevMonth.getDate() - i,
      isCurrentMonth: false
    });
  }

  // 현재 달
  for (let date = 1; date <= daysInMonth; date++) {
    const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
    const emotionInfo = emotionData[dateKey];
    
    days.push({
      date,
      isCurrentMonth: true,
      emotionScore: emotionInfo?.score,
      stressLevel: emotionInfo?.stress
    });
  }

  // 다음 달 첫 주
  const remainingDays = 42 - days.length; // 6주 * 7일
  for (let date = 1; date <= remainingDays; date++) {
    days.push({
      date,
      isCurrentMonth: false
    });
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEmotionColor = (score?: number, stress?: number) => {
    if (score === undefined) return 'bg-gray-100';
    
    // 스트레스가 높으면 빨간색 계열
    if (stress && stress > 0.7) return 'bg-red-100 border-red-200';
    
    // 감정 점수에 따라 색상 결정
    if (score > 0.5) return 'bg-green-100 border-green-200';
    if (score > 0) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const getEmotionIcon = (score?: number, stress?: number) => {
    if (score === undefined) return '';
    
    if (stress && stress > 0.7) return '😰';
    if (score > 0.7) return '😊';
    if (score > 0.3) return '😐';
    return '😔';
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className={cn('bg-white rounded-lg border p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={goToPreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-lg font-semibold">
          {year}년 {monthNames[month]}
        </h2>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={goToNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.date.toString().padStart(2, '0')}`;
          
          return (
            <button
              key={index}
              onClick={() => day.isCurrentMonth && onDateSelect?.(dateKey)}
              className={cn(
                'aspect-square p-1 rounded-lg border text-sm font-medium transition-colors hover:shadow-sm',
                day.isCurrentMonth 
                  ? 'text-gray-900 cursor-pointer' 
                  : 'text-gray-400',
                getEmotionColor(day.emotionScore, day.stressLevel)
              )}
              disabled={!day.isCurrentMonth}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div>{day.date}</div>
                {day.isCurrentMonth && day.emotionScore !== undefined && (
                  <div className="text-xs">
                    {getEmotionIcon(day.emotionScore, day.stressLevel)}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
          <span>좋음</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
          <span>보통</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
          <span>주의</span>
        </div>
      </div>
    </div>
  );
}