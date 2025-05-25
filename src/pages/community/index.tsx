import { useEmotionStore } from '@/store/emotionStore';
import { useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import FeedbackForm from '@/components/community/FeedbackForm';
import FeedbackList from '@/components/community/FeedbackList';
import CommunityStats from '@/components/community/CommunityStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCurrentRoutine } from '@/hooks/useRoutines';
import { MessageSquare, Plus, TrendingUp } from 'lucide-react';

export default function CommunityIndex() {
  const router = useRouter();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  
  const { data: currentRoutine } = useCurrentRoutine();

  // 샘플 데이터 (실제로는 API에서 가져와야 함)
  const communityStats = {
    totalFeedbacks: 147,
    averageRating: 4.2,
    negativeRatio: 0.15,
    activeUsers: 89,
    reconfigurationCount: 3
  };

  {/* 🚨 이 부분을 추가 */}
      <div className="bg-red-500 text-white p-8 m-4 rounded-lg text-center text-2xl">
        🚨 Tailwind 테스트 - 빨간 박스가 보이면 작동중!
      </div>

  const handleFeedbackSubmitSuccess = () => {
    setShowFeedbackForm(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              커뮤니티 피드백 👥
            </h1>
            <p className="text-gray-600">
              함께 만들어가는 더 나은 학습 루틴
            </p>
          </div>

          {/* Current Routine Info */}
          {currentRoutine && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>현재 루틴: {currentRoutine.title}</span>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setShowFeedbackForm(true)}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>피드백 남기기</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">총 학습 시간:</span>
                    <span className="font-medium ml-2">
                      {Math.round(currentRoutine.total_duration / 60)}시간
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">학습 블록:</span>
                    <span className="font-medium ml-2">
                      {currentRoutine.subjects.length}개
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">감정 점수:</span>
                    <span className="font-medium ml-2">
                      {currentRoutine.emotion_score.toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 피드백 영역 */}
            <div className="lg:col-span-2 space-y-6">
              {showFeedbackForm && currentRoutine && (
                <FeedbackForm
                  routineId={currentRoutine.id}
                  onSubmitSuccess={handleFeedbackSubmitSuccess}
                />
              )}
              
              {currentRoutine && (
                <FeedbackList routineId={currentRoutine.id} />
              )}

              {!currentRoutine && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">
                      활성화된 루틴이 없습니다.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => router.push('/routine/create')}
                    >
                      루틴 생성하기
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 통계 사이드바 */}
            <div className="space-y-6">
              <CommunityStats {...communityStats} />

              <Card>
                <CardHeader>
                  <CardTitle>💡 피드백 가이드</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900">좋은 피드백 예시:</h4>
                    <ul className="text-gray-600 mt-1 space-y-1">
                      <li>• "학습량이 적절해서 부담없이 따라할 수 있어요"</li>
                      <li>• "휴식 시간을 더 늘려주시면 좋겠어요"</li>
                      <li>• "난이도 조정이 잘 되어 있어서 만족해요"</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800">
                      구체적이고 건설적인 피드백일수록 
                      AI 루틴 개선에 더 많이 반영됩니다.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}