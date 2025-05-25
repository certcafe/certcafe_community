import { useState } from 'react';

const notices = [
  {
    id: 1,
    title: "🎉 CertCafe 서비스 정식 오픈 안내",
    category: "서비스",
    date: "2024-05-24",
    important: true,
    content: `안녕하세요, CertCafe 팀입니다.

드디어 AI 기반 자격증 학습 플랫폼 CertCafe가 정식으로 오픈되었습니다!

📌 주요 기능
• 실시간 감정 분석 기반 맞춤형 학습 루틴
• 멀티모달 문제 인식 및 자동 분석
• AI 기반 CBT 모의고사 시스템
• 커뮤니티 피드백 기반 품질 개선

🚀 오픈 기념 이벤트
첫 달 구독료 50% 할인 혜택을 제공합니다.
(2024년 6월 30일까지)

많은 이용과 관심 부탁드립니다.

감사합니다.`
  },
  {
    id: 2,
    title: "💡 감정 분석 AI 정확도 개선 업데이트",
    category: "업데이트",
    date: "2024-05-20", 
    important: false,
    content: `감정 분석 AI의 정확도가 대폭 개선되었습니다.

🔧 개선 사항
• 감정 인식 정확도 85% → 92% 향상
• 스트레스 지수 계산 알고리즘 최적화
• 실시간 루틴 조정 속도 50% 단축

이제 더욱 정확한 학습 상태 분석과 맞춤형 루틴을 경험하실 수 있습니다.`
  },
  {
    id: 3,
    title: "📚 새로운 자격증 시험 추가 안내",
    category: "업데이트",
    date: "2024-05-18",
    important: false,
    content: `새로운 자격증 시험이 추가되었습니다.

📖 추가된 시험
• 정보처리기사
• 컴퓨터활용능력 1급/2급  
• 토익(TOEIC)
• 한국사능력검정시험

각 시험별 맞춤형 문제 은행과 학습 루틴을 제공합니다.`
  },
  {
    id: 4,
    title: "🛠️ 서버 정기 점검 안내",
    category: "점검",
    date: "2024-05-15",
    important: true,
    content: `서버 정기 점검으로 인한 서비스 일시 중단 안내

🔧 점검 일시
2024년 5월 16일(목) 오전 2시 ~ 6시 (약 4시간)

🔹 점검 사유
• 서버 성능 최적화
• 보안 패치 적용
• 데이터베이스 정리

점검 시간 동안 서비스 이용이 어려우니 양해 부탁드립니다.`
  },
  {
    id: 5,
    title: "🎯 CBT 모의고사 품질 개선 완료",
    category: "업데이트",
    date: "2024-05-12",
    important: false,
    content: `CBT 모의고사 시스템이 대폭 개선되었습니다.

✨ 개선 내용
• 문제 생성 품질 점수 0.85+ 달성
• 해설 정확도 95% 이상 보장
• 실시간 피드백 시스템 도입
• 오답 노트 자동 생성 기능

더욱 정확하고 효과적인 학습을 경험해보세요!`
  }
];

export default function NoticesPage() {
  const [selectedNotice, setSelectedNotice] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            📢 공지사항
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            CertCafe의 최신 소식과 업데이트 정보를 확인하세요
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {selectedNotice ? (
            /* 공지사항 상세 보기 */
            <div className="bg-white rounded-xl shadow-lg p-8">
              <button 
                onClick={() => setSelectedNotice(null)}
                className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                목록으로 돌아가기
              </button>
              
              <div className="border-b pb-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {selectedNotice.important && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                      중요
                    </span>
                  )}
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {selectedNotice.category}
                  </span>
                  <span className="text-gray-500 text-sm">{selectedNotice.date}</span>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedNotice.title}
                </h1>
              </div>
              
              <div className="prose prose-gray max-w-none">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {selectedNotice.content}
                </div>
              </div>
            </div>
          ) : (
            /* 공지사항 목록 */
            <div className="space-y-4">
              {notices.map((notice) => (
                <div 
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {notice.important && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                            중요
                          </span>
                        )}
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {notice.category}
                        </span>
                        <span className="text-gray-500 text-sm">{notice.date}</span>
                      </div>
                      
                      <h2 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {notice.title}
                      </h2>
                      
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {notice.content.split('\n')[0]}
                      </p>
                    </div>
                    
                    <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* 페이지네이션 (목록 화면에서만 표시) */}
          {!selectedNotice && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  이전
                </button>
                <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md">
                  1
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  3
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  다음
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}