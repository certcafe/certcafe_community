import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              안녕하세요, {user?.name}님! 👋
            </h1>
            <p className="text-gray-600 mb-6">
              목표 자격증: <span className="font-medium">{user?.target_exam}</span>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900">학습 루틴</h3>
                <p className="text-blue-700 text-sm mt-1">AI가 생성한 맞춤 학습 계획</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900">CBT 연습</h3>
                <p className="text-green-700 text-sm mt-1">실전 모의고사 문제 풀이</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900">감정 분석</h3>
                <p className="text-purple-700 text-sm mt-1">학습 상태 실시간 모니터링</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}