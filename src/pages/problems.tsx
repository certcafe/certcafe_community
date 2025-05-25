// 📁 src/pages/problems.tsx - 20개 자격증 확장 완료 버전
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useProblemsStore } from '@/store/problemsStore';

export default function ProblemsPage() {
  const {
    problems,
    analyses,
    routines,
    uploadProgress,
    isAnalyzing,
    currentAnalysis,
    uploadProblem,
    analyzeProblem,
    generateRoutine,
    updateProblem,
    deleteProblem,
    getProblemsBy,
    getAnalysisForProblem,
    loadTestData
  } = useProblemsStore();

  // 로컬 상태
  const [activeTab, setActiveTab] = useState<'upload' | 'history' | 'analysis'>('upload');
  const [uploadMethod, setUploadMethod] = useState<'photo' | 'text' | 'audio'>('photo');
  const [dragActive, setDragActive] = useState(false);
  const [problemForm, setProblemForm] = useState({
    title: '',
    content: '',
    subject: '한국사능력검정시험', // 🔥 인기 1위로 변경
    category: '한국사', // 🔥 카테고리도 변경
    type: 'multiple_choice' as const,
    difficulty: 'medium' as const,
    myAnswer: '',
    correctAnswer: ''
  });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // 컴포넌트 마운트 시 테스트 데이터 로드
  useEffect(() => {
    if (problems.length === 0) {
      loadTestData();
    }
  }, [problems.length, loadTestData]);

  // 드래그 앤 드롭 핸들러
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // 파일 업로드 핸들러
  const handleFileUpload = async (file: File) => {
    console.log('📸 파일 업로드:', file.name);
    
    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 체크 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하로 제한됩니다.');
      return;
    }

    try {
      // 이미지 미리보기 생성
      const imageUrl = URL.createObjectURL(file);
      
      const problemData = {
        title: `업로드된 문제 - ${new Date().toLocaleString('ko-KR')}`,
        content: '이미지에서 문제 내용을 인식하는 중...',
        imageUrl,
        subject: problemForm.subject,
        category: problemForm.category,
        type: problemForm.type,
        difficulty: problemForm.difficulty
      };

      await uploadProblem(problemData);
      
      // 폼 초기화
      setProblemForm(prev => ({
        ...prev,
        title: '',
        content: '',
        myAnswer: '',
        correctAnswer: ''
      }));
      
    } catch (error) {
      console.error('업로드 실패:', error);
      alert('업로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 텍스트 직접 입력 제출
  const handleTextSubmit = async () => {
    if (!problemForm.title.trim() || !problemForm.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      await uploadProblem({
        title: problemForm.title,
        content: problemForm.content,
        subject: problemForm.subject,
        category: problemForm.category,
        type: problemForm.type,
        difficulty: problemForm.difficulty,
        myAnswer: problemForm.myAnswer || undefined,
        correctAnswer: problemForm.correctAnswer || undefined
      });

      // 🔥 폼 초기화 (인기 1위로 변경)
      setProblemForm({
        title: '',
        content: '',
        subject: '한국사능력검정시험', // 변경
        category: '한국사', // 변경
        type: 'multiple_choice',
        difficulty: 'medium',
        myAnswer: '',
        correctAnswer: ''
      });
      
      alert('문제가 성공적으로 업로드되었습니다!');
    } catch (error) {
      console.error('텍스트 업로드 실패:', error);
      alert('업로드에 실패했습니다.');
    }
  };

  // 통계 계산
  const stats = {
    total: problems.length,
    correct: problems.filter(p => p.isCorrect === true).length,
    wrong: problems.filter(p => p.isCorrect === false).length,
    analyzing: problems.filter(p => p.status === 'analyzing').length
  };

  const correctRate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📸 내가 푼 문제 관리소
            </h1>
            <p className="text-gray-600">
              시험장 → Claude AI 분석 → 맞춤 루틴 생성 <span className="text-blue-600 font-medium">(특허 출원중)</span>
            </p>
          </div>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← 홈으로 돌아가기
          </Link>
        </div>

        {/* 🔥 인기 자격증 소개 배너 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-8 text-white">
          <h2 className="text-xl font-bold mb-2">🔥 20개 인기 자격증 지원!</h2>
          <p className="text-white/90">
            Claude AI가 한국사능력검정시험부터 양식조리기능사까지 인기 순위별 자격증을 모두 분석합니다
          </p>
        </div>

        {/* 통계 대시보드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">총 문제</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{correctRate}%</div>
            <div className="text-sm text-gray-600">정답률</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{stats.wrong}</div>
            <div className="text-sm text-gray-600">틀린 문제</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{routines.length}</div>
            <div className="text-sm text-gray-600">생성된 루틴</div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 px-6 py-4 text-center font-medium rounded-tl-2xl ${
                activeTab === 'upload'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📸 문제 업로드
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-6 py-4 text-center font-medium ${
                activeTab === 'history'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📚 히스토리
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex-1 px-6 py-4 text-center font-medium rounded-tr-2xl ${
                activeTab === 'analysis'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📊 분석 & 루틴
            </button>
          </div>

          <div className="p-6">
            {/* 업로드 탭 */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                {/* 업로드 방법 선택 */}
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={() => setUploadMethod('photo')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      uploadMethod === 'photo'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📷 사진 업로드
                  </button>
                  <button
                    onClick={() => setUploadMethod('text')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      uploadMethod === 'text'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📝 텍스트 입력
                  </button>
                </div>

                {/* 사진 업로드 영역 */}
                {uploadMethod === 'photo' && (
                  <div>
                    <div
                      ref={dragRef}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                        dragActive
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <div className="space-y-4">
                        <div className="text-6xl">📸</div>
                        <div className="text-lg font-medium text-gray-700">
                          문제 사진을 업로드하세요
                        </div>
                        <div className="text-sm text-gray-500">
                          드래그 앤 드롭하거나 클릭해서 파일을 선택하세요
                        </div>
                        <div className="text-xs text-gray-400">
                          JPG, PNG 파일 지원 (최대 10MB)
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          파일 선택
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* 업로드 진행률 */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>업로드 중...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 텍스트 입력 영역 */}
                {uploadMethod === 'text' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🔥 시험 종목 (인기 순위별)
                        </label>
                        {/* 🔥 여기가 핵심 수정 부분! */}
                        <select
                          value={problemForm.subject}
                          onChange={(e) => setProblemForm(prev => ({ ...prev, subject: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {/* 인기 순위별 20개 자격증 */}
                          <option value="한국사능력검정시험">📚 한국사능력검정시험 (인기 1위)</option>
                          <option value="컴퓨터활용능력 1급">🖥️ 컴퓨터활용능력 1급 (인기 2위)</option>
                          <option value="공인중개사">🏠 공인중개사 (인기 3위)</option>
                          <option value="지게차운전기능사">🚛 지게차운전기능사 (인기 4위)</option>
                          <option value="한식조리기능사">🍲 한식조리기능사 (인기 5위)</option>
                          <option value="전기기능사">💡 전기기능사 (인기 6위)</option>
                          <option value="제과기능사">🧁 제과기능사 (인기 7위)</option>
                          <option value="제빵기능사">🍞 제빵기능사 (인기 8위)</option>
                          <option value="산업안전기사">⚡ 산업안전기사 (인기 9위)</option>
                          <option value="전기기사">⚡ 전기기사 (인기 10위)</option>
                          <option value="정보처리기사">💻 정보처리기사 (인기 11위)</option>
                          <option value="산업안전산업기사">🛡️ 산업안전산업기사 (인기 12위)</option>
                          <option value="전기산업기사">🔌 전기산업기사 (인기 13위)</option>
                          <option value="워드프로세서">📝 워드프로세서 (인기 14위)</option>
                          <option value="컴퓨터활용능력 2급">💻 컴퓨터활용능력 2급 (인기 15위)</option>
                          <option value="미용사(일반)">💇 미용사(일반) (인기 16위)</option>
                          <option value="사회복지사 1급">🤝 사회복지사 1급 (인기 17위)</option>
                          <option value="건설안전기사">🏗️ 건설안전기사 (인기 18위)</option>
                          <option value="위험물산업기사">☢️ 위험물산업기사 (인기 19위)</option>
                          <option value="양식조리기능사">🍝 양식조리기능사 (인기 20위)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📂 문제 분야
                        </label>
                        {/* 🔥 카테고리도 확장 */}
                        <select
                          value={problemForm.category}
                          onChange={(e) => setProblemForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {/* IT/컴퓨터 */}
                          <option value="프로그래밍">💻 프로그래밍</option>
                          <option value="데이터베이스">🗄️ 데이터베이스</option>
                          <option value="네트워크">🌐 네트워크</option>
                          <option value="시스템">⚙️ 시스템</option>
                          <option value="소프트웨어공학">🛠️ 소프트웨어공학</option>
                          
                          {/* 건설/안전 */}
                          <option value="산업안전">⚡ 산업안전</option>
                          <option value="건설안전">🏗️ 건설안전</option>
                          <option value="위험물관리">☢️ 위험물관리</option>
                          
                          {/* 전기/전자 */}
                          <option value="전기공학">🔌 전기공학</option>
                          <option value="전기설비">💡 전기설비</option>
                          <option value="전력공학">⚡ 전력공학</option>
                          
                          {/* 조리/식품 */}
                          <option value="한식조리">🍲 한식조리</option>
                          <option value="양식조리">🍝 양식조리</option>
                          <option value="제과제빵">🍞 제과제빵</option>
                          
                          {/* 기타 */}
                          <option value="한국사">📚 한국사</option>
                          <option value="부동산">🏠 부동산</option>
                          <option value="사회복지">🤝 사회복지</option>
                          <option value="미용">💇 미용</option>
                          <option value="운전기계">🚛 운전/기계</option>
                          <option value="기타">📋 기타</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        문제 제목
                      </label>
                      <input
                        type="text"
                        value={problemForm.title}
                        onChange={(e) => setProblemForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="문제 제목을 입력하세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        문제 내용
                      </label>
                      <textarea
                        value={problemForm.content}
                        onChange={(e) => setProblemForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="문제 내용과 선택지를 입력하세요"
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          내 답안
                        </label>
                        <input
                          type="text"
                          value={problemForm.myAnswer}
                          onChange={(e) => setProblemForm(prev => ({ ...prev, myAnswer: e.target.value }))}
                          placeholder="선택한 답 (예: A, B, C, D)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          정답 (선택사항)
                        </label>
                        <input
                          type="text"
                          value={problemForm.correctAnswer}
                          onChange={(e) => setProblemForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                          placeholder="정답 (알고 있다면)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleTextSubmit}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium"
                    >
                      🚀 Claude AI로 문제 업로드하기
                    </button>
                  </div>
                )}

                {/* 🔥 업로드 가이드 개선 */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-4 text-lg">✅ 20개 인기 자격증 업로드 가이드</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">📸 사진 업로드 체크리스트</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>✅ 문제 번호가 보이게 촬영</li>
                        <li>✅ 선택지 A, B, C, D 모두 포함</li>
                        <li>✅ 내가 선택한 답 표시</li>
                        <li>✅ 정답 표시 (있다면)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">🔥 지원되는 인기 자격증</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>🥇 한국사능력검정시험 (1위)</li>
                        <li>🥈 컴퓨터활용능력 1급 (2위)</li>
                        <li>🥉 공인중개사 (3위)</li>
                        <li>📝 기타 17개 인기 자격증...</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-blue-800">
                      🤖 <strong>Claude AI</strong>가 업로드된 문제를 분석하여 개인 맞춤형 학습 루틴을 자동 생성합니다!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 히스토리 탭 (기존과 동일) */}
            {activeTab === 'history' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">📚 내 문제 히스토리</h2>
                  <div className="text-sm text-gray-500">
                    총 {problems.length}개 문제
                  </div>
                </div>

                {problems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-gray-500 mb-4">아직 업로드한 문제가 없습니다.</p>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      첫 문제 업로드하기
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {problems.map((problem) => {
                      const analysis = getAnalysisForProblem(problem.id);
                      
                      return (
                        <div key={problem.id} className="bg-gray-50 rounded-xl p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold text-gray-900">{problem.title}</h3>
                            <div className="flex items-center space-x-2">
                              {problem.isCorrect === true && (
                                <span className="text-green-600 text-sm">✅ 정답</span>
                              )}
                              {problem.isCorrect === false && (
                                <span className="text-red-600 text-sm">❌ 오답</span>
                              )}
                              {problem.status === 'analyzing' && (
                                <span className="text-blue-600 text-sm">🧠 분석중</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-4">
                            <div>📚 {problem.subject} - {problem.category}</div>
                            <div>📅 {new Date(problem.uploadedAt).toLocaleString('ko-KR')}</div>
                          </div>

                          <div className="text-sm text-gray-800 mb-4 line-clamp-3">
                            {problem.content}
                          </div>

                          {problem.imageUrl && (
                            <div className="mb-4">
                              <img
                                src={problem.imageUrl}
                                alt="문제 이미지"
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            </div>
                          )}

                          {analysis && (
                            <div className="bg-white rounded-lg p-4 mt-4">
                              <div className="text-sm">
                                <div className="font-medium text-gray-700 mb-2">🧠 Claude AI 분석 결과</div>
                                <div className="text-gray-600">
                                  예상 시간: {analysis.estimatedTime}분 | 
                                  신뢰도: {Math.round(analysis.confidence * 100)}%
                                </div>
                                {analysis.weaknessArea && (
                                  <div className="text-red-600 text-xs mt-1">
                                    약점: {analysis.weaknessArea}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 분석 & 루틴 탭 (기존과 동일하지만 Claude AI 언급 추가) */}
            {activeTab === 'analysis' && (
              <div className="space-y-8">
                {/* 현재 분석 중인 문제 */}
                {isAnalyzing && (
                  <div className="bg-blue-50 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <div>
                        <div className="font-medium text-blue-900">Claude AI가 문제를 분석하고 있습니다...</div>
                        <div className="text-sm text-blue-700">약 3초 후 결과가 나옵니다</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 최신 분석 결과 */}
                {currentAnalysis && (
                  <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      🧠 최신 Claude AI 분석 결과
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">핵심 포인트</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {currentAnalysis.keyPoints.map((point, index) => (
                            <li key={index}>• {point}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">분석 정보</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>예상 풀이 시간: {currentAnalysis.estimatedTime}분</div>
                          <div>난이도: {currentAnalysis.difficulty}</div>
                          <div>AI 신뢰도: {Math.round(currentAnalysis.confidence * 100)}%</div>
                          {currentAnalysis.weaknessArea && (
                            <div className="text-red-600">약점 영역: {currentAnalysis.weaknessArea}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">💡 Claude AI 추천</h4>
                      <p className="text-sm text-gray-700">{currentAnalysis.recommendation}</p>
                    </div>
                  </div>
                )}

                {/* 생성된 루틴 목록 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    🎯 맞춤 학습 루틴 ({routines.length}개)
                  </h3>
                  
                  {routines.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🎯</div>
                      <p className="text-gray-500 mb-4">아직 생성된 루틴이 없습니다.</p>
                      <p className="text-sm text-gray-400">문제를 업로드하면 Claude AI가 자동으로 맞춤 루틴을 생성합니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {routines.map((routine) => (
                        <div key={routine.id} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">{routine.title}</h4>
                            {routine.isActive && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                활성화
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-700 mb-4">{routine.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">{routine.duration}</div>
                              <div className="text-sm text-gray-600">일간 루틴</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{routine.problems.length}</div>
                              <div className="text-sm text-gray-600">관련 문제</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {routine.schedule.reduce((sum, day) => sum + day.estimatedHours, 0)}
                              </div>
                              <div className="text-sm text-gray-600">총 시간 (시간)</div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <h5 className="font-medium text-gray-700">📅 주간 일정 미리보기</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {routine.schedule.slice(0, 4).map((day) => (
                                <div key={day.day} className="text-sm bg-white rounded p-2">
                                  <div className="font-medium">Day {day.day}</div>
                                  <div className="text-gray-600">{day.tasks[0]}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex space-x-3">
                            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                              📅 캘린더 추가
                            </button>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                              📊 상세 보기
                            </button>
                            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                              🔗 공유하기
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}