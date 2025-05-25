// 📁 src/pages/cbt/practice.tsx - 하이브리드 시스템 UI

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEmotionStore } from '@/store/emotionStore';

// ... 기존 interfaces와 mapping 유지 ...

export default function CBTPracticePage() {
  const router = useRouter();
  const { subject, questionCount, timeLimit, showTimer } = router.query;
  
  const { 
    currentEmotion, 
    updateFullEmotion,
    getMotivationalMessage,
    connectSystem
  } = useEmotionStore();
  
  // 🎯 하이브리드 상태 관리
  const [problems, setProblems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 🚀 하이브리드 성능 지표
  const [generationStats, setGenerationStats] = useState({
    method: '',
    composition: { premiumDB: 0, claudeAI: 0, backup: 0 },
    processingTime: 0,
    apiCalls: 0,
    cost: 0,
    qualityScore: 0,
    cacheStats: { hits: 0, misses: 0, hitRate: 0 }
  });
  
  const [settings, setSettings] = useState({
    questionCount: parseInt(questionCount) || 20,
    timeLimit: parseInt(timeLimit) || 40,
    showTimer: showTimer === 'true'
  });

  const subjectName = SUBJECT_MAPPING[subject] || subject;

  // 🚀 하이브리드 문제 생성
  const generateProblems = async () => {
    setLoading(true);
    setError(null);
    
    const startTime = Date.now();
    console.log(`🎯 하이브리드 생성 시작: ${settings.questionCount}문항`);
    
    try {
      const requestBody = {
        subject: subjectName,
        difficulty: currentEmotion.confidence >= 0.7 ? '어려움' : 
                   currentEmotion.confidence >= 0.4 ? '보통' : '쉬움',
        count: settings.questionCount,
        emotionData: {
          score: currentEmotion.score,
          stress: currentEmotion.stress,
          focus: currentEmotion.focus,
          confidence: currentEmotion.confidence
        }
      };
      
      const response = await fetch('/api/cbt/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API 오류 (${response.status})`);
      }

      const data = await response.json();
      console.log('🎉 하이브리드 생성 완료:', data);
      
      if (!data.success || !data.problems) {
        throw new Error('유효하지 않은 응답');
      }
      
      setProblems(data.problems);
      setCurrentIndex(0);
      setScore({ correct: 0, total: 0 });
      
      // 🚀 성능 지표 업데이트
      setGenerationStats({
        method: data.method || 'hybrid',
        composition: data.composition || { premiumDB: 0, claudeAI: 0, backup: 0 },
        processingTime: data.processingTime || Date.now() - startTime,
        apiCalls: data.apiCalls || 0,
        cost: data.cost || 0,
        qualityScore: data.qualityScore || 0,
        cacheStats: data.cacheStats || { hits: 0, misses: 0, hitRate: 0 }
      });
      
    } catch (error) {
      console.error('💥 하이브리드 생성 실패:', error);
      setError(`생성 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 하이브리드 로딩 화면
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-lg w-full mx-4">
          <div className="mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gradient-to-r from-blue-500 to-purple-500 border-t-transparent mx-auto mb-4"></div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🎯 하이브리드 시스템 가동 중
          </h2>
          
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex justify-between">
              <span>🏆 프리미엄 DB 검색</span>
              <span className="text-green-600">✓</span>
            </div>
            <div className="flex justify-between">
              <span>🤖 Claude AI 생성</span>
              <span className="text-blue-600 animate-pulse">⏳</span>
            </div>
            <div className="flex justify-between">
              <span>🔧 품질 최적화</span>
              <span className="text-gray-400">⌛</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
            💡 <strong>하이브리드 시스템</strong>: 고품질 DB + Claude AI + 캐싱으로 
            최고의 문제를 빠르고 경제적으로 제공합니다
          </div>
        </div>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">설정을 완료해 주세요</h2>
          <button 
            onClick={generateProblems}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all"
          >
            🚀 하이브리드 CBT 시작
          </button>
        </div>
      </div>
    );
  }

  const currentProblem = problems[currentIndex];
  const isLastProblem = currentIndex === problems.length - 1;
  const progressPercent = ((currentIndex + 1) / problems.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        
        {/* 🎯 하이브리드 헤더 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link href="/cbt" className="text-blue-600 hover:text-blue-800 transition-colors">
              ← 과목 선택으로
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🎯 {subjectName} 하이브리드 CBT
              </h1>
              <div className="text-xs text-gray-500 mt-1">
                {generationStats.method === 'cache_hit' ? '💾 캐시 서비스' :
                 generationStats.method === 'hybrid_generation' ? '🚀 하이브리드 생성' :
                 '🆘 백업 모드'}
              </div>
            </div>
            <div className="text-sm text-gray-600 text-right">
              <div>{currentIndex + 1} / {problems.length}</div>
              <div className="text-xs">품질: {generationStats.qualityScore}%</div>
            </div>
          </div>
          
          {/* 진행률 바 */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          
          {/* 🚀 하이브리드 성능 지표 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-blue-50 p-2 rounded text-center">
              <div className="font-bold text-blue-600">{generationStats.processingTime}ms</div>
              <div className="text-gray-500">생성시간</div>
            </div>
            <div className="bg-green-50 p-2 rounded text-center">
              <div className="font-bold text-green-600">${generationStats.cost.toFixed(4)}</div>
              <div className="text-gray-500">API 비용</div>
            </div>
            <div className="bg-purple-50 p-2 rounded text-center">
              <div className="font-bold text-purple-600">{generationStats.composition.premiumDB}+{generationStats.composition.claudeAI}</div>
              <div className="text-gray-500">DB+AI</div>
            </div>
            <div className="bg-orange-50 p-2 rounded text-center">
              <div className="font-bold text-orange-600">{generationStats.cacheStats.hitRate}%</div>
              <div className="text-gray-500">캐시율</div>
            </div>
          </div>
        </div>

        {/* 문제 풀이 화면 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {/* 문제 내용 */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
              {currentProblem.question}
            </h2>
            {currentProblem.personalizedHint && (
              <div className="mt-3 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                {currentProblem.personalizedHint}
              </div>
            )}
          </div>

          {/* 선택지 */}
          <div className="space-y-4 mb-8">
            {currentProblem.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showExplanation && setSelectedAnswer(index)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  showExplanation
                    ? index === currentProblem.correct
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : selectedAnswer === index && index !== currentProblem.correct
                      ? 'border-red-500 bg-red-50 text-red-800'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                    : selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-bold mr-4 text-lg">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-lg">{option}</span>
                  </div>
                  {showExplanation && index === currentProblem.correct && (
                    <span className="text-green-600 text-xl">✓</span>
                  )}
                  {showExplanation && selectedAnswer === index && index !== currentProblem.correct && (
                    <span className="text-red-600 text-xl">✗</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* 해설 */}
          {showExplanation && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-blue-900 mb-3 text-lg flex items-center">
                💡 하이브리드 해설
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {generationStats.composition.premiumDB > currentIndex ? 'Premium DB' : 'Claude AI'}
                </span>
              </h3>
              <p className="text-blue-800 leading-relaxed text-lg">
                {currentProblem.explanation}
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-between items-center">
            <div className="space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors text-sm"
              >
                🔄 새 문제셋
              </button>
            </div>
            
            <div className="space-x-4">
              {!showExplanation ? (
                <button
                  onClick={() => {
                    if (selectedAnswer === null) return;
                    
                    const isCorrect = selectedAnswer === currentProblem.correct;
                    setScore(prev => ({
                      correct: prev.correct + (isCorrect ? 1 : 0),
                      total: prev.total + 1
                    }));
                    
                    setShowExplanation(true);
                  }}
                  disabled={selectedAnswer === null}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg font-semibold"
                >
                  답안 제출
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (isLastProblem) {
                      // 결과 화면으로
                      console.log('CBT 완료!');
                    } else {
                      setCurrentIndex(currentIndex + 1);
                      setSelectedAnswer(null);
                      setShowExplanation(false);
                    }
                  }}
                  className={`px-8 py-3 rounded-xl text-lg font-semibold transition-all ${
                    isLastProblem
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg text-white'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg text-white'
                  }`}
                >
                  {isLastProblem ? '🎯 완료' : '다음 문제 →'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 🎉 최종 결과 (하이브리드 통계 포함) */}
        {isLastProblem && showExplanation && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
            <h2 className="text-3xl font-bold text-center mb-8">🎉 하이브리드 CBT 완료!</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white bg-opacity-20 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold mb-2">{score.correct}/{score.total}</div>
                <div className="text-blue-100">정답 수</div>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold mb-2">
                  {((score.correct / score.total) * 100).toFixed(1)}%
                </div>
                <div className="text-blue-100">정답률</div>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold mb-2">{generationStats.qualityScore}%</div>
                <div className="text-blue-100">품질 점수</div>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold mb-2">${generationStats.cost.toFixed(4)}</div>
                <div className="text-blue-100">총 비용</div>
              </div>
            </div>

            {/* 하이브리드 성능 리포트 */}
            <div className="bg-white bg-opacity-10 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">📊 하이브리드 성능 리포트</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">문제 구성</div>
                  <div>🏆 프리미엄 DB: {generationStats.composition.premiumDB}문항</div>
                  <div>🤖 Claude AI: {generationStats.composition.claudeAI}문항</div>
                </div>
                <div>
                  <div className="font-medium">성능 지표</div>
                  <div>⚡ 생성시간: {generationStats.processingTime}ms</div>
                  <div>💾 캐시 적중률: {generationStats.cacheStats.hitRate}%</div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xl font-semibold mb-6">
                🎯 하이브리드 시스템으로 고품질 문제를 빠르고 경제적으로 제공했습니다!
              </p>
              <div className="space-x-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
                >
                  🔄 다시 도전하기
                </button>
                <Link href="/cbt">
                  <button className="bg-blue-800 text-white px-6 py-3 rounded-xl hover:bg-blue-900 transition-colors font-semibold">
                    📚 다른 과목 선택
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}