import React, { useState } from 'react';
import { useRouter } from 'next/router';

const AdminLoginPage = () => {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        // JWT 토큰을 쿠키에 저장
        document.cookie = `admin_token=${data.token}; path=/; secure; samesite=strict; max-age=86400`; // 24시간
        router.push('/admin/problems');
      } else {
        setError(data.error || '로그인 실패');
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">🔐 관리자 로그인</h1>
          <p className="text-gray-600 mt-2">CertCafe 관리 시스템</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="관리자 이메일"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
          
          <input
            type="password"
            placeholder="비밀번호"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🔒 보안 연결로 보호됩니다</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;