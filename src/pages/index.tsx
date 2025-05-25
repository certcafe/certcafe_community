import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  // 채팅 위젯 상태
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "안녕하세요! CertCafe 고객지원팀입니다. 무엇을 도와드릴까요?",
      sender: "support",
      time: "지금"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      time: new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "문의해주신 내용을 확인했습니다. 담당자가 곧 연결해드리겠습니다.",
        "AI 학습 루틴에 관한 문의시 자세한 설명을 위해 화면 공유가 필요할 수 있습니다.",
        "감정 분석 기능 관련 문의는 기술팀으로 전달해드리겠습니다.",
        "서비스 이용 중 불편한 점이 있으시면 언제든 말씀해주세요.",
        "추가 도움이 필요하시면 egn789@naver.com으로 이메일을 보내주셔도 됩니다."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: randomResponse,
        sender: "support", 
        time: new Date().toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }]);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎓 CertCafe
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            AI가 감정을 분석하여 개인 맞춤형 학습 루틴을 생성하고<br/>
            실시간으로 최적화하는 자격증 학습 플랫폼
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">혁신 기술</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">Claude 기반</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">감정 인식 AI</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full">자동 최적화</span>
          </div>
        </div>

        {/* 주요 기능 카드들 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
          
          {/* 1. 문제 업로드 */}
          <Link href="/problems">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-80 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3 group-hover:scale-110 transition-transform">📸</div>
                <h2 className="text-xl font-bold text-gray-800">문제 업로드</h2>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                시험장에서 푼 문제를 사진으로 업로드하면 AI가 자동으로 분석하여 
                맞춤형 학습 루틴을 생성합니다.
              </p>
              
              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  멀티모달 문제 인식
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  3초 내 AI 분석
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  적응형 루틴 생성
                </div>
              </div>
              
              <div className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-800 text-sm">
                문제 업로드하기
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* 2. AI 루틴봇 */}
          <Link href="/routine/create">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-80 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3 group-hover:scale-110 transition-transform">🤖</div>
                <h2 className="text-xl font-bold text-gray-800">AI 루틴봇</h2>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                감정 상태와 오답률을 분석하여 개인 맞춤형 학습 일정을 자동 생성합니다.
                스트레스 지수 기반 자동 휴식 시간 제안 기능을 제공합니다.
              </p>
              
              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  감정 기반 자동 재편성
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  ICS 캘린더 연동
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  스트레스 모니터링
                </div>
              </div>
              
              <div className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-800 text-sm">
                루틴 생성하기 
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* 3. CBT 모의고사 */}
          <Link href="/cbt">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-80 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3 group-hover:scale-110 transition-transform">🎯</div>
                <h2 className="text-xl font-bold text-gray-800">CBT 모의고사</h2>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                AI 기반으로 실시간 문제를 생성하고, 감정 상태에 맞춘 해설을 제공합니다.
                고품질 문제 생성 알고리즘으로 정확한 학습이 가능합니다.
              </p>
              
              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  실시간 문제 생성
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  감정 맞춤형 해설
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  품질 검증 시스템
                </div>
              </div>
              
              <div className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-800 text-sm">
                실전 연습하기
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* 4. 공지사항 */}
          <Link href="/notices">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-80 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3 group-hover:scale-110 transition-transform">📢</div>
                <h2 className="text-xl font-bold text-gray-800">공지사항</h2>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                서비스 업데이트, 시험 일정, 새로운 기능 출시 소식을 확인하세요.
                중요한 알림과 이벤트 정보를 놓치지 마세요.
              </p>
              
              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  서비스 업데이트 알림
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  시험 일정 공지
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  이벤트 및 혜택 안내
                </div>
              </div>
              
              <div className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-800 text-sm">
                공지 확인하기
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* 5. 커뮤니티 */}
          <Link href="/community">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-80 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3 group-hover:scale-110 transition-transform">🤝</div>
                <h2 className="text-xl font-bold text-gray-800">커뮤니티</h2>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                학습자들의 피드백을 수집하여 AI가 자동으로 루틴을 보정합니다.
                집단지성 기반 학습 시스템으로 품질을 지속적으로 개선합니다.
              </p>
              
              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  집단지성 기반 보정
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  실시간 투표 분석
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  피드백 벡터 처리
                </div>
              </div>
              
              <div className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-800 text-sm">
                커뮤니티 참여
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* 6. 감정 대시보드 */}
          <Link href="/emotion">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-80 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3 group-hover:scale-110 transition-transform">💓</div>
                <h2 className="text-xl font-bold text-gray-800">감정 대시보드</h2>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                학습 중 감정 상태를 실시간으로 추적하고 분석합니다.
                스트레스 수준 기반 맞춤형 학습 조정을 제공합니다.
              </p>
              
              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  실시간 감정 추적
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  스트레스 모니터링
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  자동 루틴 조정
                </div>
              </div>
              
              <div className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-800 text-sm">
                감정 분석하기
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* 핵심 기술 소개 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🏆 핵심 기술 <span className="text-blue-600 font-medium">(특허 출원중)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">실시간 감정 분석</h3>
              <p className="text-gray-600 text-sm">
                학습 중 감정 변화를 실시간 추적하여 스트레스 수준 기반 루틴 자동 조정
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">멀티모달 문제 인식</h3>
              <p className="text-gray-600 text-sm">
                이미지, 텍스트, 음성을 통합 처리하여 시험 문제를 정확히 인식하고 분석
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">감정 기반 루틴 재편성</h3>
              <p className="text-gray-600 text-sm">
                감정 점수와 오답률을 결합한 스트레스 지수로 학습 루틴을 실시간 자동 조정
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">AI 해설 자동화</h3>
              <p className="text-gray-600 text-sm">
                품질 검증 시스템과 감정 맞춤형 해설 생성으로 학습 효과 극대화
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">커뮤니티 피드백 보정</h3>
              <p className="text-gray-600 text-sm">
                집단지성 기반 피드백 분석으로 학습 시스템을 지속적으로 개선
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              * 상기 기술들은 현재 특허 출원 중이며, 등록 완료 시까지는 출원 기술로 분류됩니다.
            </p>
          </div>
        </div>

        {/* 통계 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">📊 검증된 성과</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">90%</div>
              <div className="text-blue-200 text-sm">학습 완주율</div>
              <div className="text-xs text-blue-100">(테스트 기준)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">35%</div>
              <div className="text-blue-200 text-sm">시간 단축</div>
              <div className="text-xs text-blue-100">(예상 효과)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">0.85+</div>
              <div className="text-blue-200 text-sm">품질 점수</div>
              <div className="text-xs text-blue-100">목표 수치</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">3초</div>
              <div className="text-blue-200 text-sm">AI 분석시간</div>
              <div className="text-xs text-blue-100">실시간</div>
            </div>
          </div>
        </div>

        {/* CTA 버튼 */}
        <div className="text-center bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🚀 지금 바로 시작해보세요
          </h2>
          <p className="text-gray-600 mb-6">
            AI가 분석한 맞춤형 학습으로 효율적인 자격증 취득을 경험하세요
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/problems">
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl">
                📸 문제 업로드
              </button>
            </Link>
            <Link href="/routine/create">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl">
                🤖 AI 루틴 생성
              </button>
            </Link>
            <Link href="/cbt">
              <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl">
                🎯 실전 연습
              </button>
            </Link>
          </div>
        </div>
      </div>
       {/* 실시간 채팅 위젯 */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* 채팅창 */}
        {isOpen && (
          <div className="mb-4 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <div>
                  <h3 className="font-semibold text-sm">고객지원</h3>
                  <p className="text-xs opacity-90">온라인</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded p-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p>{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* 타이핑 인디케이터 */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="border-t p-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 채팅 버튼 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </button>
      </div>
      {/* 푸터 */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-3">🎓 CertCafe</h3>
              <p className="text-gray-400 text-sm">
                AI 기반 자격증 학습 플랫폼으로<br/>
                스마트한 학습 경험을 제공합니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">주요 기능</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📸 문제 업로드</li>
                <li>🤖 AI 루틴 생성</li>
                <li>🎯 CBT 모의고사</li>
                <li>💓 감정 대시보드</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">고객지원</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📧 egn789@naver.com</li>
                <li>💬 실시간 채팅</li>
                <li>📋 FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">회사정보</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>🏢 안산시 단원구</li>
                <li>📄 이용약관</li>
                <li>🔒 개인정보처리방침</li>
                <li>© 2025 CertCafe</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}