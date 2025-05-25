import { useEffect } from 'react';
import { useRouter } from 'next/router';
import SignUpForm from '@/components/auth/SignUpForm';
import { useAuthStore } from '@/store';

export default function SignUpPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <SignUpForm />
    </div>
  );
}