// src/pages/test.tsx
import { useState } from 'react'

export default function TestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async (endpoint: string, method: string = 'POST', body?: any) => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log(`Testing: ${method} ${endpoint}`)
      
      const response = await fetch(endpoint, {
        method,
        headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined
      })
      
      const data = await response.json()
      console.log('Response:', { status: response.status, data })
      
      setResult({
        endpoint,
        method,
        status: response.status,
        success: response.ok,
        data
      })
    } catch (error: any) {
      console.error('Test error:', error)
      setResult({
        endpoint,
        method,
        status: 'ERROR',
        success: false,
        error: error.message
      })
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          🚀 CertCafe API 테스트
        </h1>

        {/* 테스트 버튼들 */}
        <div className="grid gap-4 mb-8">
          <button
            onClick={() => testAPI('/api/debug', 'GET')}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            1️⃣ 환경변수 체크 (GET /api/debug)
          </button>

          <button
            onClick={() => testAPI('/api/debug', 'POST', { test: 'connection' })}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            2️⃣ API 연결 테스트 (POST /api/debug)
          </button>

          <button
            onClick={() => testAPI('/api/routine/generate', 'POST', {
              examType: '정보처리기사',
              examDate: '2024-06-15',
              studyHours: 4,
              weakTopics: ['데이터베이스'],
              emotionScore: 0.7,
              errorRate: 0.2
            })}
            disabled={loading}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            3️⃣ AI 루틴 생성 테스트
          </button>

          <button
            onClick={() => testAPI('/api/cbt/generate', 'POST', {
              subject: '정보처리기사',
              difficulty: '중간',
              count: 2
            })}
            disabled={loading}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            4️⃣ CBT 문제 생성 테스트
          </button>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800">테스트 진행 중...</span>
            </div>
          </div>
        )}

        {/* 결과 */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {result.method} {result.endpoint}
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                result.success 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {result.success ? '✅ 성공' : '❌ 실패'} ({result.status})
              </span>
            </div>

            {result.error ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <div className="text-red-800 font-medium">오류 메시지:</div>
                <div className="text-red-700 mt-1 font-mono text-sm">
                  {result.error}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded p-4">
                <div className="text-gray-700 font-medium mb-2">응답 데이터:</div>
                <pre className="text-sm bg-white p-3 rounded border overflow-auto max-h-96">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* 도움말 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 테스트 순서</h3>
          <ol className="text-yellow-700 text-sm space-y-1">
            <li>1️⃣ 환경변수 체크부터 시작하세요</li>
            <li>2️⃣ API 연결이 성공하면 다음 단계로</li>
            <li>3️⃣ AI 루틴 생성 (특허 알고리즘 테스트)</li>
            <li>4️⃣ CBT 문제 생성 (GPT 연동 테스트)</li>
          </ol>
        </div>
      </div>
    </div>
  )
}