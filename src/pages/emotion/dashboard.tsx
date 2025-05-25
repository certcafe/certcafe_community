import ProtectedRoute from '@/components/auth/ProtectedRoute';
import EmotionDashboard from '@/components/emotion/EmotionDashboard';

export default function EmotionDashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <EmotionDashboard />
      </div>
    </ProtectedRoute>
  );
}
