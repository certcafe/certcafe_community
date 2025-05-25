import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCommunityStore } from '@/store/communityStore';

interface FeedbackAnalysis {
  tauNeg: number;
  delta: number;
  shouldCorrect: boolean;
  details: {
    totalComments: number;
    negativeComments: number;
    avgSentiment: number;
  };
}

export default function CommunityPage() {
  // 🔥 Zustand Store 사용
  const { 
    posts, 
    commentsByPost, 
    isLoading,
    sortBy,
    useTestData,
    fetchPosts, 
    addPost, 
    fetchComments, 
    addComment,
    subscribeToComments,
    setSortBy,
    toggleTestMode
  } = useCommunityStore();

  // 로컬 상태들
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [feedbackAnalysis, setFeedbackAnalysis] = useState<FeedbackAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [correctionLoading, setCorrectionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('feedback'); // 새로운 탭 상태

  // 🔥 컴포넌트 마운트 시 게시물 로드
  useEffect(() => {
    console.log('🚀 [DEBUG] CommunityPage 마운트 - 게시물 로드 시작');
    fetchPosts();
  }, [fetchPosts]);

  // 🔥 각 게시물별 댓글 구독
  useEffect(() => {
    const unsubscribeFunctions: (() => void)[] = [];

    posts.forEach(post => {
      console.log(`🔔 [DEBUG] 게시물 ${post.id} 댓글 구독 시작`);
      fetchComments(post.id);
      const unsubscribe = subscribeToComments(post.id);
      unsubscribeFunctions.push(unsubscribe);
    });

    return () => {
      console.log('🧹 [DEBUG] 모든 댓글 구독 해제');
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }, [posts, fetchComments, subscribeToComments]);

  // 🔥 게시물 작성
  const handleAddPost = async () => {
    if (!newPostTitle.trim() || !newPostBody.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      await addPost(newPostTitle.trim(), newPostBody.trim());
      setNewPostTitle('');
      setNewPostBody('');
      setShowWriteForm(false);
      console.log('✅ [DEBUG] 게시물 작성 완료');
    } catch (error) {
      console.error('게시물 작성 실패:', error);
      alert('게시물 작성에 실패했습니다.');
    }
  };

  // 피드백 분석 실행
  const analyzeFeedback = async (routineId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/community/analyze-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routineId })
      });

      const data = await response.json();
      console.log('📊 피드백 분석 결과:', data);
      
      if (data.success) {
        setFeedbackAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('피드백 분석 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // GPT 루틴 보정 실행
  const correctRoutine = async (routineId: string) => {
    if (!feedbackAnalysis) return;
    
    setCorrectionLoading(true);
    try {
      const response = await fetch('/api/community/correct-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routineId,
          feedbackAnalysis,
          emotionScore: 0.6,
          errorRate: 0.3
        })
      });

      const data = await response.json();
      console.log('🎯 루틴 보정 결과:', data);
      
      if (data.success) {
        alert(`✅ 루틴 보정 완료!\n새 루틴 ID: ${data.correctedRoutineId}`);
      }
    } catch (error) {
      console.error('루틴 보정 오류:', error);
    } finally {
      setCorrectionLoading(false);
    }
  };

  // 🔥 게시물별 댓글 추가
  const handleAddComment = async (postId: string) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return;

    console.log(`💭 [DEBUG] 댓글 추가 시도 - postId: ${postId}, comment: ${comment}`);
    
    try {
      await addComment(postId, comment);
      
      // 해당 게시물의 입력창만 초기화
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ''
      }));
      
      console.log(`✅ [DEBUG] 댓글 추가 완료 - postId: ${postId}`);
    } catch (error) {
      console.error('댓글 추가 실패:', error);
      alert('댓글 추가에 실패했습니다.');
    }
  };

  // 🔥 게시물별 댓글 입력 핸들러
  const handleCommentChange = (postId: string, value: string) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  // 감정 점수를 텍스트로 변환
  const getSentimentText = (score: number): string => {
    if (score > 0.1) return '😊 긍정';
    if (score < -0.1) return '😔 부정';
    return '😐 중립';
  };

  const getSentimentColor = (score: number): string => {
    if (score > 0.1) return 'bg-green-100 text-green-700';
    if (score < -0.1) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">게시물을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        
        {/* 개선된 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🤝 커뮤니티
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            AI 기반 집단지성 루틴 자동 보정 시스템으로 학습자들과 함께 성장하는 공간입니다
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm mb-8">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">특허 출원중</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">피드백 분석 AI</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">자동 루틴 보정</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full">감정 분석</span>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === 'feedback' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              💡 피드백 시스템
            </button>
            <Link href="/community/blog">
              <button className="px-6 py-3 rounded-full font-medium bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 transition-all">
                📚 학습 가이드
              </button>
            </Link>
            <Link href="/community/board">
              <button className="px-6 py-3 rounded-full font-medium bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 transition-all">
                💬 사용자 게시판
              </button>
            </Link>
          </div>
        </div>

        {/* 홈으로 돌아가기 버튼 */}
        <div className="flex justify-end mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            홈으로 돌아가기
          </Link>
        </div>

        {/* 컨트롤 바 */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            {/* 정렬 옵션 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">정렬:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="latest">최신순</option>
                  <option value="oldest">오래된순</option>
                  <option value="popular">인기순</option>
                </select>
              </div>
              
              {/* 시스템 상태 표시 */}
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500">|</span>
                <span className="text-gray-600">게시물: {posts.length}개</span>
                <span className="text-gray-600">댓글: {Object.values(commentsByPost).reduce((sum, comments) => sum + comments.length, 0)}개</span>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTestMode}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  useTestData 
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🧪 {useTestData ? '테스트 모드' : '실제 모드'}
              </button>
              <button
                onClick={() => setShowWriteForm(true)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                ✍️ 글쓰기
              </button>
            </div>
          </div>
        </div>

        {/* 글쓰기 폼 */}
        {showWriteForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                ✍️ 새 게시물 작성
              </h2>
              <button
                onClick={() => setShowWriteForm(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  제목
                </label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="게시물 제목을 입력하세요..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  내용
                </label>
                <textarea
                  value={newPostBody}
                  onChange={(e) => setNewPostBody(e.target.value)}
                  placeholder="게시물 내용을 입력하세요..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowWriteForm(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleAddPost}
                  disabled={!newPostTitle.trim() || !newPostBody.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg hover:shadow-xl"
                >
                  게시하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 특허 기술 설명 카드 */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-xl p-8 mb-8 border border-indigo-100">
          <h2 className="text-2xl font-bold mb-6 flex items-center text-indigo-900">
            🧠 특허 기술: 커뮤니티 피드백 기반 자동 보정
            <span className="ml-3 text-sm bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full">출원중</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-blue-200">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div className="font-bold text-blue-900">피드백 수집</div>
              </div>
              <div className="text-blue-700 text-sm">댓글, 투표, 감정 분석으로 τ_neg 계산</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-green-200">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <div className="font-bold text-green-900">임계값 검사</div>
              </div>
              <div className="text-green-700 text-sm">τ_neg이 10-30% 범위 시 보정 트리거</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-purple-200">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <div className="font-bold text-purple-900">GPT 자동 보정</div>
              </div>
              <div className="text-purple-700 text-sm">128차원 벡터 기반 루틴 재생성</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 게시글 목록 */}
          <div className="lg:col-span-2 space-y-6">
            {posts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">첫 번째 게시물을 작성해보세요!</h3>
                <p className="text-gray-500 mb-6">커뮤니티 피드백으로 AI 학습 루틴을 개선할 수 있습니다.</p>
                <button
                  onClick={() => setShowWriteForm(true)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium transition-all shadow-lg hover:shadow-xl"
                >
                  첫 번째 게시물 작성하기
                </button>
              </div>
            ) : (
              posts.map(post => {
                const comments = commentsByPost[post.id] || [];
                
                return (
                  <div key={post.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 border border-gray-100">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-bold text-gray-900 flex-1 pr-4">{post.title}</h3>
                      <div className="text-xs text-blue-500 text-right flex-shrink-0">
                        <div className="bg-blue-50 px-2 py-1 rounded mb-1">ID: {post.id}</div>
                        <div className="text-gray-500">{new Date(post.created_at).toLocaleString('ko-KR')}</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-6 leading-relaxed text-base">{post.body}</p>
                    
                    <div className="text-sm text-gray-500 mb-6 flex items-center">
                      <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
                      작성자: {post.user_email || '익명'}
                    </div>
                    
                    {/* 댓글 섹션 */}
                    <div className="border-t pt-6">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                        💬 댓글 <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">{comments.length}</span>
                      </h4>
                      
                      {/* 댓글 목록 */}
                      <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                        {comments.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <div className="text-3xl mb-2">💭</div>
                            <p className="text-sm">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
                          </div>
                        ) : (
                          comments.map(comment => (
                            <div key={comment.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                                  <span className="text-sm font-medium text-gray-700">
                                    {comment.user_email || '익명'}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${getSentimentColor(comment.sentiment)}`}>
                                    {getSentimentText(comment.sentiment)}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.created_at).toLocaleString('ko-KR')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-800 leading-relaxed mb-2">{comment.body}</p>
                              <div className="text-xs text-gray-400">
                                🔍 댓글 ID: {comment.id}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {/* 댓글 작성 폼 */}
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => handleCommentChange(post.id, e.target.value)}
                          placeholder="댓글을 입력하세요..."
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(post.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentInputs[post.id]?.trim()}
                          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                        >
                          댓글 추가
                        </button>
                      </div>
                    </div>
                    
                    {/* 분석 버튼 */}
                    <div className="mt-6 pt-6 border-t flex space-x-3">
                      <button
                        onClick={() => analyzeFeedback(post.id)}
                        disabled={loading}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-medium shadow-lg hover:shadow-xl"
                      >
                        {loading ? '⏳ 분석 중...' : '📊 피드백 분석'}
                      </button>
                      
                      {feedbackAnalysis?.shouldCorrect && (
                        <button
                          onClick={() => correctRoutine(post.id)}
                          disabled={correctionLoading}
                          className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all font-medium shadow-lg hover:shadow-xl"
                        >
                          {correctionLoading ? '⏳ 보정 중...' : '🎯 자동 보정'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {feedbackAnalysis && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                  📊 피드백 분석 결과
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-100">
                    <div className="text-sm text-red-600 mb-1 font-medium">부정 피드백 비율 (τ_neg)</div>
                    <div className={`text-3xl font-bold ${
                      feedbackAnalysis.tauNeg >= 0.10 && feedbackAnalysis.tauNeg <= 0.30 
                        ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {(feedbackAnalysis.tauNeg * 100).toFixed(1)}%
                    </div>
                    {feedbackAnalysis.shouldCorrect && (
                      <div className="text-red-600 text-sm mt-2 font-medium">
                        ⚠️ 보정 필요 (10-30% 범위)
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1 font-medium">변화량 (Δ)</div>
                    <div className="text-3xl font-bold text-blue-600">
                      {feedbackAnalysis.delta.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                    <div className="text-sm text-green-600 mb-1 font-medium">평균 감정점수</div>
                    <div className={`text-3xl font-bold ${
                      feedbackAnalysis.details.avgSentiment > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {feedbackAnalysis.details.avgSentiment.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span>총 댓글:</span>
                      <span className="font-medium">{feedbackAnalysis.details.totalComments}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span>부정 댓글:</span>
                      <span className="font-medium">{feedbackAnalysis.details.negativeComments}개</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 특허 알고리즘 설명 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                🔬 특허 알고리즘
              </h3>
              <div className="text-sm text-gray-600 space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <strong className="text-blue-800">τ_neg</strong>
                  <p className="text-blue-600 mt-1">부정 피드백 비율</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <strong className="text-purple-800">ν_feedback</strong>
                  <p className="text-purple-600 mt-1">128차원 피드백 벡터</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <strong className="text-green-800">Δ</strong>
                  <p className="text-green-600 mt-1">루틴 보정 강도</p>
                </div>
                <div className="pt-2 border-t bg-red-50 p-3 rounded-lg">
                  <strong className="text-red-800">보정 트리거:</strong>
                  <p className="text-red-600 mt-1">10% ≤ τ_neg ≤ 30%</p>
                </div>
              </div>
            </div>

            {/* 시스템 상태 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                ℹ️ 시스템 상태
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">모드:</span>
                  <span className={`font-medium px-2 py-1 rounded ${useTestData ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {useTestData ? '🧪 테스트' : '🔗 실제 DB'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">정렬:</span>
                  <span className="font-medium">{sortBy === 'latest' ? '최신순' : sortBy === 'oldest' ? '오래된순' : '인기순'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">게시물:</span>
                  <span className="font-medium text-blue-600">{posts.length}개</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">댓글:</span>
                  <span className="font-medium text-green-600">{Object.values(commentsByPost).reduce((sum, comments) => sum + comments.length, 0)}개</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}