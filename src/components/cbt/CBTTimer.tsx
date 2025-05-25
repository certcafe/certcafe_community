'use client';

import { useState, useEffect } from 'react';
import { Clock, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface CBTTimerProps {
  initialTime: number; // seconds
  onTimeUp: () => void;
  onTimeChange?: (remainingTime: number) => void;
  isPaused?: boolean;
  className?: string;
}

export default function CBTTimer({ 
  initialTime, 
  onTimeUp, 
  onTimeChange,
  isPaused = false,
  className 
}: CBTTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(!isPaused);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        onTimeChange?.(newTime);
        
        if (newTime <= 0) {
          onTimeUp();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onTimeUp, onTimeChange]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percentage = (timeLeft / initialTime) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = () => {
    const percentage = (timeLeft / initialTime) * 100;
    if (percentage > 50) return 'bg-green-600';
    if (percentage > 20) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className={cn('bg-white rounded-lg border p-4 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-700">남은 시간</span>
        </div>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsRunning(!isRunning)}
          className="p-2"
        >
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>

      <div className="text-center">
        <div className={cn('text-3xl font-mono font-bold', getTimerColor())}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn('h-2 rounded-full transition-all duration-1000', getProgressColor())}
          style={{ width: `${(timeLeft / initialTime) * 100}%` }}
        />
      </div>

      {/* Warning messages */}
      {timeLeft <= 300 && timeLeft > 60 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <p className="text-yellow-800 text-sm font-medium">
            ⚠️ 5분 남았습니다!
          </p>
        </div>
      )}

      {timeLeft <= 60 && timeLeft > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-red-800 text-sm font-medium">
            🚨 1분 남았습니다!
          </p>
        </div>
      )}
    </div>
  );
}