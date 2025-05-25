import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CBTPlayer from '@/components/cbt/CBTPlayer';

export default function CBTSessionPage() {
  const router = useRouter();
  const { sessionId, subject = '컴활1급', difficulty = 'medium' } = router.query;

  return (
    <ProtectedRoute>
      <CBTPlayer
        subject={subject as string}
        difficulty={difficulty as 'easy' | 'medium' | 'hard'}
        questionCount={10}
        timeLimit={30}
      />
    </ProtectedRoute>
  );
}