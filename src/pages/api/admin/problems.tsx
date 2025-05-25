import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Problem {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: string;
  category: string;
}

const AdminProblemsPage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // 문제 추가 폼 상태
  const [subject, setSubject] = useState('컴퓨터활용능력 1급');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '', '']);
  const [correct, setCorrect] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState('중');
  const [category, setCategory] = useState('');
  
  // 통계 상태
  const [stats, setStats] = useState<any>(null);

  // 🔐 간단한 비밀번호 인증
  const handleAuth = () => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'; // 환경변수로 관리
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setAuthError('');
      localStorage.setItem('admin_auth', 'true'); // 세션 유지
    } else {
      setAuthError('비밀번호가 틀렸습니다');
    }
  };

  // 페이지 로드시 인증 상태 확인
  useEffect(() => {
    const saved = localStorage.getItem('admin_auth');
    if (saved === 'true') {
      setIsAuthenticated(true);
    }
    
    // 통계 데이터 로드
    if (saved === 'true') {
      loadStats();
    }
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('통계 로드 실패:', error);
    }
  };

  const handleAddProblem = async () => {
    const newProblem = {
      id: `${subject.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      question,
      options: options.filter(opt => opt.trim() !== ''),
      correct,
      explanation,
      difficulty,
      year: new Date().getFullYear(),
      category,
      tags: [],
      source: '관리자 입력'
    };

    try {
      const response = await fetch('/api/admin/add-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, problem: newProblem })
      });

      if (response.ok) {
        alert('문제가 추가되었습니다!');
        // 폼 초기화
        setQuestion('');
        setOptions(['', '', '', '', '']);
        setCorrect(0);
        setExplanation('');
        setCategory('');
        // 통계 새로고침
        loadStats();
      }
    } catch (error) {
      alert('문제 추가 실패: ' + error);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
    setPassword('');
  };

  // 🔐 인증 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">🔐 관리자 인증</h1>
            <p className="text-gray-600 mt-2">문제 관리 시스템에 접근하려면 비밀번호를 입력하세요</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="관리자 비밀번호"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
            />
            
            {authError && (
              <p className="text-red-500 text-sm">{authError}</p>
            )}
            
            <button
              onClick={handleAuth}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium"
            >
              로그인
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>💡 개발 환경에서만 사용하세요</p>
            <p>배포시에는 더 강력한 인증 시스템이 필요합니다</p>
          </div>
        </div>
      </div>
    );
  }

  // 🔧 관리자 메인 화면
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">🔧 CertCafe 관리자</h1>
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← 메인으로
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 📊 통계 사이드바 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">📊 문제 통계</h2>
              {stats ? (
                <div className="space-y-4">
                  {Object.entries(stats.stats || {}).map(([subject, stat]: [string, any]) => (
                    <div key={subject} className="border-b pb-3">
                      <h3 className="font-medium text-gray-700">{subject}</h3>
                      <p className="text-2xl font-bold text-blue-600">{stat.total}개</p>
                      <div className="text-sm text-gray-500">
                        {Object.entries(stat.byDifficulty || {}).map(([diff, count]) => (
                          <span key={diff} className="mr-2">{diff}: {count as number}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">통계 로딩 중...</p>
              )}
            </div>
            
            {/* 빠른 액션 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">⚡ 빠른 액션</h2>
              <div className="space-y-2">
                <button 
                  onClick={loadStats}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded"
                >
                  🔄 통계 새로고침
                </button>
                <button 
                  onClick={() => window.open('/cbt', '_blank')}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded"
                >
                  🎯 CBT 테스트
                </button>
              </div>
            </div>
          </div>

          {/* 📝 문제 추가 폼 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">📝 새 문제 추가</h2>
              
              {/* 과목 선택 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">과목</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="컴퓨터활용능력 1급">컴퓨터활용능력 1급</option>
                  <option value="정보처리기사">정보처리기사</option>
                  <option value="한국사능력검정시험">한국사능력검정시험</option>
                </select>
              </div>

              {/* 문제 입력 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">문제</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="문제를 입력하세요..."
                  className="w-full p-3 border border-gray-300 rounded-md h-24 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 선택지 입력 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">선택지</label>
                {options.map((option, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <span className="w-8 text-center font-medium">{index + 1}.</span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index] = e.target.value;
                        setOptions(newOptions);
                      }}
                      placeholder={`선택지 ${index + 1}`}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="radio"
                      name="correct"
                      checked={correct === index}
                      onChange={() => setCorrect(index)}
                      className="ml-3 w-4 h-4 text-blue-600"
                    />
                    <span className="ml-1 text-sm text-gray-500">정답</span>
                  </div>
                ))}
              </div>

              {/* 해설 입력 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">해설</label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="정답 해설을 입력하세요..."
                  className="w-full p-3 border border-gray-300 rounded-md h-20 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 난이도 및 카테고리 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">난이도</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="하">쉬움</option>
                    <option value="중">보통</option>
                    <option value="상">어려움</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="예: Excel_함수, 데이터베이스"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 추가 버튼 */}
              <button
                onClick={handleAddProblem}
                disabled={!question || !explanation || options.filter(o => o.trim()).length < 2}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                ✅ 문제 추가하기
              </button>

              {/* JSON 가져오기 */}
              <div className="mt-8 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-2">📥 JSON 파일로 대량 가져오기</h3>
                <input
                  type="file"
                  accept=".json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const text = await file.text();
                      try {
                        const response = await fetch('/api/admin/import-problems', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ jsonData: text })
                        });
                        if (response.ok) {
                          const result = await response.json();
                          alert(`${result.count}개 문제가 추가되었습니다!`);
                          loadStats();
                        }
                      } catch (error) {
                        alert('파일 가져오기 실패: ' + error);
                      }
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProblemsPage;