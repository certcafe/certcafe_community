'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { CBTQuestion } from '@/types/store';

interface QuestionCardProps {
  question: CBTQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: number;
  onAnswerSelect: (answer: number) => void;
  showExplanation?: boolean;
  isReviewMode?: boolean;
  className?: string;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  showExplanation = false,
  isReviewMode = false,
  className
}: QuestionCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAnswerButtonVariant = (optionIndex: number) => {
    if (!showExplanation) {
      return selectedAnswer === optionIndex ? 'primary' : 'secondary';
    }

    // 리뷰 모드에서의 색상
    if (optionIndex === question.correct_answer) {
      return 'default'; // 정답은 초록색
    }
    
    if (selectedAnswer === optionIndex && optionIndex !== question.correct_answer) {
      return 'danger'; // 선택했지만 틀린답은 빨간색
    }

    return 'secondary';
  };

  const getAnswerButtonClassName = (optionIndex: number) => {
    if (!showExplanation) {
      return selectedAnswer === optionIndex 
        ? 'border-blue-500 bg-blue-50 text-blue-900' 
        : 'border-gray-300 hover:border-gray-400';
    }

    if (optionIndex === question.correct_answer) {
      return 'border-green-500 bg-green-50 text-green-900';
    }
    
    if (selectedAnswer === optionIndex && optionIndex !== question.correct_answer) {
      return 'border-red-500 bg-red-50 text-red-900';
    }

    return 'border-gray-300';
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            문제 {questionNumber} / {totalQuestions}
          </h3>
          <div className="flex space-x-2">
            <Badge className={getDifficultyColor(question.difficulty)}>
              {question.difficulty === 'easy' ? '쉬움' : 
               question.difficulty === 'medium' ? '보통' : '어려움'}
            </Badge>
            <Badge variant="outline">
              {question.subject}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 문제 내용 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
            {question.question}
          </p>
        </div>

        {/* 선택지 */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !showExplanation && onAnswerSelect(index)}
              disabled={showExplanation}
              className={cn(
                'w-full text-left p-4 rounded-lg border-2 transition-all duration-200',
                'hover:shadow-sm disabled:cursor-not-allowed',
                getAnswerButtonClassName(index)
              )}
            >
              <div className="flex items-start space-x-3">
                <div className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium',
                  getAnswerButtonClassName(index)
                )}>
                  {index + 1}
                </div>
                <span className="flex-1">{option}</span>
                
                {/* 정답/오답 표시 */}
                {showExplanation && (
                  <div className="flex-shrink-0">
                    {index === question.correct_answer && (
                      <span className="text-green-600 font-medium">✓ 정답</span>
                    )}
                    {selectedAnswer === index && index !== question.correct_answer && (
                      <span className="text-red-600 font-medium">✗ 오답</span>
                    )}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 해설 */}
        {showExplanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📝 해설</h4>
            <p className="text-blue-800 leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}

        {/* 감정 상태 기반 격려 메시지 */}
        {showExplanation && question.emotion_band && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">💜 맞춤 피드백</h4>
            <p className="text-purple-800 text-sm">
              {question.emotion_band === 'high' ? 
                '훌륭해요! 이 조자로 계속 진행하세요! 🎉' :
               question.emotion_band === 'medium' ?
                '잘 하고 있어요. 조금 더 집중해봐요! 💪' :
                '괜찮아요. 천천히 차근차근 해봐요. 충분히 할 수 있어요! 🌟'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
