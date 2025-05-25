// src/pages/cbt-test.tsx - 즉시 테스트용
import { useState } from 'react';

export default function CBTTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCBT = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🚀 CBT API 테스트 시작');
      
      const response = await fetch('/api/cbt/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: '정보처리기사',
          difficulty: '중간',
          count: 3
        })
      });

      console.log('📥 응답 상태:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 전체 응답:', data);
      
      setResult(data);
      
    } catch (error: any) {
      console.error('❌ 테스트 오류:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 CBT API 테스트</h1>
        
        <button
          onClick={testCBT}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-8"
        >
          {loading ? '⏳ 테스트 중...' : '🚀 CBT API 테스트'}
        </button>

        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📊 테스트 결과</h2>
            
            {result.error ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <div className="text-red-800 font-medium">❌ 오류</div>
                <div className="text-red-700 mt-2">{result.error}</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <div className="text-green-800 font-medium">✅ 성공</div>
                  <div className="text-green-700 mt-2">
                    {result.problems?.length || 0}개 문제 생성됨
                  </div>
                </div>
                
                {result.problems && result.problems.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">📝 생성된 문제들:</h3>
                    {result.problems.map((problem: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="font-medium mb-2">문제 {index + 1}</div>
                        <div className="text-gray-700 mb-2">{problem.question}</div>
                        <div className="text-sm text-gray-600">
                          정답: {problem.correct + 1}번 ({problem.options?.[problem.correct]})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <details className="mt-4">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                    📄 전체 응답 데이터 보기
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-96">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}