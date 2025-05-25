'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import Dialog from '@/components/ui/Dialog';
import QuestionCard from './QuestionCard';
import CBTTimer from './CBTTimer';
import { useGenerateCBT, useSubmitCBTSession } from '@/hooks/useCBT';
import { useEmotionStore } from '@/store';
import { ChevronLeft, ChevronRight, Flag, X } from 'lucide-react';

interface CBTPlayerProps {
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount?: number;
  timeLimit?: number; // minutes
}

export default function CBTPlayer({ 
  subject, 
  difficulty, 
  questionCount = 10,
  timeLimit = 30 
}: CBTPlayerProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const generateCBT = useGenerateCBT();
  const submitSession = useSubmitCBTSession();
  const { updateEmotionScore } = useEmotionStore();

  // CBT 문제 생성
  useEffect(() => {
    generateCBT.mutate({
      subject,
      difficulty,
      count: questionCount
    });
  }, [subject, difficulty, questionCount]);

  const questions = generateCBT.data || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalTime = timeLimit * 60; // convert to seconds

  const handleAnswerSelect = (answer: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinishTest = async () => {
    if (!questions.length) return;

    const startTime = Date.now() - (totalTime - timeLeft) * 1000;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      await submitSession.mutateAsync({
        questions,
        answers,
        timeSpent
      });

      // 감정 점수 업데이트 (정답률 기반)
      const correctCount = Object.entries(answers).filter(([index, answer]) => {
        const questionIndex = parseInt(index);
        return questions[questionIndex]?.correct_answer === answer;
      }).length;

      const score = correctCount / questions.length;
      const emotionDelta = score > 0.7 ? 0.1 : score < 0.4 ? -0.1 : 0;
      updateEmotionScore(emotionDelta);

      setIsFinished(true);
      router.push(`/cbt/results/${submitSession.data?.id}`);
    } catch (error) {
      console.error('CBT 결과 제출 실패:', error);
    }
  };

  const handleTimeUp = () => {
    handleFinishTest();
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    router.push('/dashboard');
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  if (generateCBT.isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">AI가 맞춤형 문제를 생성 중입니다...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">문제를 생성할 수 없습니다.</p>
          <Button onClick={() => router.push('/dashboard')}>
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">
              {subject} CBT
            </h1>
            <div className="text-sm text-gray-500">
              {difficulty === 'easy' ? '쉬움' : 
               difficulty === 'medium' ? '보통' : '어려움'}
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={handleExit}
            className="flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>종료</span>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">진행률</span>
                <span className="text-sm text-gray-600">
                  {answeredCount} / {questions.length} 문제
                </span>
              </div>
              <Progress 
                value={answeredCount} 
                max={questions.length}
                variant={progressPercentage > 80 ? 'success' : 'default'}
              />
            </div>

            {/* Question */}
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              selectedAnswer={answers[currentQuestionIndex]}
              onAnswerSelect={handleAnswerSelect}
            />

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="secondary"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>이전</span>
              </Button>

              <div className="flex space-x-2">
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    variant="primary"
                    onClick={handleFinishTest}
                    disabled={submitSession.isPending}
                    className="flex items-center space-x-2"
                  >
                    <Flag className="h-4 w-4" />
                    <span>시험 완료</span>
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleNextQuestion}
                    className="flex items-center space-x-2"
                  >
                    <span>다음</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timer */}
            <CBTTimer
              initialTime={totalTime}
              onTimeUp={handleTimeUp}
            />

            {/* Question Navigator */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-medium text-gray-900 mb-3">문제 현황</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`
                      w-8 h-8 rounded text-sm font-medium transition-colors
                      ${index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : answers[index] !== undefined
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg border p-4 space-y-3">
              <h3 className="font-medium text-gray-900">통계</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">답변 완료:</span>
                  <span className="font-medium">{answeredCount}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">남은 문제:</span>
                  <span className="font-medium">{questions.length - answeredCount}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">완료율:</span>
                  <span className="font-medium">{Math.round(progressPercentage)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <Dialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        title="시험 종료"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            정말로 시험을 종료하시겠습니까? 
            현재까지의 답안은 저장되지 않습니다.
          </p>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowExitDialog(false)}
              className="flex-1"
            >
              계속하기
            </Button>
            <Button
              variant="danger"
              onClick={confirmExit}
              className="flex-1"
            >
              종료하기
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
