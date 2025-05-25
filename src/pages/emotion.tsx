// 📁 src/pages/emotion.tsx - 감정 대시보드 페이지
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface EmotionData {
  id: string;
  timestamp: string;
  emotionScore: number;
  stressLevel: number;
  activity: string;
  notes?: string;
}

interface EmotionStats {
  avgEmotion: number;
  avgStress: number;
  totalSessions: number;
  improvementRate: number;
}

export default function EmotionDashboard() {
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [stats, setStats] = useState<EmotionStats | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<number>(0);
  const [currentStress, setCurrentStress] = useState<number>(0);
  const [activity, setActivity] = useState<string>('');

  // 테스트 데이터 로드
  useEffect(() => {
    const mockData: EmotionData[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        emotionScore: 0.7,
        stressLevel: 0.3,
        activity: 'CBT 문제 풀이',
        notes: '집중이 잘 됐음'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        emotionScore: -0.2,
        stressLevel: 0.8,
        activity: '데이터베이스 학습',
        notes: '어려워서 스트레스 받음'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        emotionScore: 0.5,
        stressLevel: 0.4,
        activity: '문제 업로드',
        notes: 'AI 분석 결과가 도움됨'
      }
    ];

    setEmotionData(mockData);

    // 통계 계산
    const avgEmotion = mockData.reduce((sum, d) => sum + d.emotionScore, 0) / mockData.length;
    const avgStress = mockData.reduce((sum, d) => sum + d.stressLevel, 0) / mockData.length;
    const improvementRate = 12; // 예시값

    setStats({
      avgEmotion,
      avgStress,
      totalSessions: mockData.length,
      improvementRate
    });
  }, []);

  // 감정 데이터 추가
  const addEmotionData = () => {
    if (!activity.trim()) {
      alert('활동을 입력해주세요.');
      return;
    }

    const newData: EmotionData = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      emotionScore: currentEmotion,
      stressLevel: currentStress,
      activity: activity.trim()
    };

    setEmotionData(prev => [newData, ...prev]);
    
    // 폼 초기화
    setCurrentEmotion(0);
    setCurrentStress(0);
    setActivity('');

    alert('감정 데이터가 저장되었습니다!');
  };

  // 감정 점수를 텍스트로 변환
  const getEmotionText = (score: number): string => {
    if (score > 0.5) return '😄 매우 좋음';
    if (score > 0.1) return '😊 좋음';
    if (score > -0.1) return '😐 보통';
    if (score > -0.5) return '😔 나쁨';
    return '😞 매우 나쁨';
  };

  const getEmotionColor = (score: number): string => {
    if (score > 0.5) return 'text-green-600';
    if (score > 0.1) return 'text-blue-600';
    if (score > -0.1) return 'text-gray-600';
    if (score > -0.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStressText = (level: number): string => {
    if (level < 0.3) return '😌 낮음';
    if (level < 0.6) return '😐 보통';
    if (level < 0.8) return '😰 높음';
    return '🤯 매우 높음';
  };

  const getStressColor = (level: number): string => {
    if (level < 0.3) return 'text-green-600';
    if (level < 0.6) return 'text-yellow-600';
    if (level < 0.8) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              💓 감정 대시보드
            </h1>
            <p className="text-gray-600">
              학습 중 감정 상태를 추적하고 분석합니다 <span className="text-blue-600 font-medium">(특허 출원중)</span>
            </p>
          </div>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← 홈으로 돌아가기
          </Link>
        </div>

        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className={`text-2xl font-bold ${getEmotionColor(stats.avgEmotion)}`}>
                {stats.avgEmotion.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">평균 감정</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className={`text-2xl font-bold ${getStressColor(stats.avgStress)}`}>
                {Math.round(stats.avgStress * 100)}%
              </div>
              <div className="text-sm text-gray-600">평균 스트레스</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
              <div className="text-sm text-gray-600">총 세션</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">+{stats.improvementRate}%</div>
              <div className="text-sm text-gray-600">개선율</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 감정 입력 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">📝 현재 감정 기록</h2>
            
            <div className="space-y-6">
              {/* 감정 점수 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  감정 상태 ({currentEmotion.toFixed(1)})
                </label>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.1"
                  value={currentEmotion}
                  onChange={(e) => setCurrentEmotion(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>😞 매우 나쁨</span>
                  <span>😐 보통</span>
                  <span>😄 매우 좋음</span>
                </div>
                <div className={`text-center mt-2 font-medium ${getEmotionColor(currentEmotion)}`}>
                  {getEmotionText(currentEmotion)}
                </div>
              </div>

              {/* 스트레스 수준 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  스트레스 수준 ({Math.round(currentStress * 100)}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={currentStress}
                  onChange={(e) => setCurrentStress(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>😌 낮음</span>
                  <span>😐 보통</span>
                  <span>🤯 높음</span>
                </div>
                <div className={`text-center mt-2 font-medium ${getStressColor(currentStress)}`}>
                  {getStressText(currentStress)}
                </div>
              </div>

              {/* 활동 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  현재 활동
                </label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">활동을 선택하세요</option>
                  <option value="CBT 문제 풀이">CBT 문제 풀이</option>
                  <option value="문제 업로드">문제 업로드</option>
                  <option value="루틴 학습">루틴 학습</option>
                  <option value="커뮤니티 참여">커뮤니티 참여</option>
                  <option value="복습">복습</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <button
                onClick={addEmotionData}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                감정 데이터 저장
              </button>
            </div>
          </div>

          {/* 감정 히스토리 */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">📊 감정 히스토리</h2>
            
            {emotionData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-500 mb-4">아직 감정 데이터가 없습니다.</p>
                <p className="text-sm text-gray-400">학습 중 감정을 기록해보세요!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {emotionData.map((data) => (
                  <div key={data.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-4">
                        <div className={`font-medium ${getEmotionColor(data.emotionScore)}`}>
                          {getEmotionText(data.emotionScore)}
                        </div>
                        <div className={`text-sm ${getStressColor(data.stressLevel)}`}>
                          스트레스: {getStressText(data.stressLevel)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(data.timestamp).toLocaleString('ko-KR')}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-700 mb-2">
                      📝 활동: {data.activity}
                    </div>
                    
                    {data.notes && (
                      <div className="text-sm text-gray-600 italic">
                        💭 "{data.notes}"
                      </div>
                    )}

                    <div className="mt-3 flex space-x-4 text-xs">
                      <div className="flex items-center">
                        <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              data.emotionScore > 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.abs(data.emotionScore) * 100}%` }}
                          ></div>
                        </div>
                        <span>감정: {data.emotionScore.toFixed(1)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="h-2 rounded-full bg-orange-500"
                            style={{ width: `${data.stressLevel * 100}%` }}
                          ></div>
                        </div>
                        <span>스트레스: {Math.round(data.stressLevel * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 특허 기술 설명 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">🧠 감정 기반 학습 최적화 기술</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="bg-pink-50 p-4 rounded-lg">
              <div className="font-medium text-pink-900 mb-2">감정 상태 분석</div>
              <div className="text-pink-700">학습 중 실시간 감정 변화를 추적하고 패턴을 분석</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="font-medium text-purple-900 mb-2">스트레스 모니터링</div>
              <div className="text-purple-700">학습 부담을 측정하여 적절한 휴식 시점 제안</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="font-medium text-blue-900 mb-2">루틴 자동 조정</div>
              <div className="text-blue-700">감정 데이터 기반으로 개인별 최적 학습 루틴 생성</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}