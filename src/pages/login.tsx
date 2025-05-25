import Head from 'next/head';
import { useRouter } from 'next/router';
import SignUpForm from '@/components/auth/SignUpForm';
import { useAuthStore } from '@/store';

export default function SignUpPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  return (
    <>
      <Head>
        <title>회원가입 - CertCafe</title>
        <meta name="description" content="CertCafe 회원가입" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🎓 CertCafe
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700">
              회원가입
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              AI가 도와주는 똑똑한 자격증 학습
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8">
            <SignUpForm />
          </div>
        </div>
      </div>
    </>
  );
}