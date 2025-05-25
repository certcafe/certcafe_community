// src/pages/api/download/routine.ics.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 현재 날짜 기준 ICS 생성
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0].replace(/-/g, '');
  
  // 한국 시간대 설정
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CertCafe AI//Personalized Study Routine//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:🤖 CertCafe AI 학습 루틴
X-WR-CALDESC:감정 분석 기반 AI가 생성한 개인화 학습 루틴입니다
X-WR-TIMEZONE:Asia/Seoul
BEGIN:VTIMEZONE
TZID:Asia/Seoul
BEGIN:STANDARD
DTSTART:19700101T000000
TZNAME:KST
TZOFFSETFROM:+0900
TZOFFSETTO:+0900
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
UID:certcafe-theory-${todayStr}@ai.certcafe.com
DTSTART;TZID=Asia/Seoul:${todayStr}T090000
DTEND;TZID=Asia/Seoul:${todayStr}T103000
SUMMARY:🧠 핵심 이론 학습
DESCRIPTION:CertCafe AI가 감정 상태를 분석하여 생성한 맞춤형 이론 학습 블록입니다.\\n\\n📚 학습 팁:\\n• 핵심 개념을 노트에 정리하며 학습하세요\\n• 이해가 안 되는 부분은 표시해두고 나중에 질문하세요\\n• 30분마다 5분씩 휴식을 취하세요\\n\\n🎯 특허기술: EmotionScore 기반 난이도 자동 조정
LOCATION:집중 학습 공간
CATEGORIES:STUDY,THEORY,AI-GENERATED,CERTCAFE
PRIORITY:5
STATUS:CONFIRMED
TRANSP:OPAQUE
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:📚 이론 학습 시간입니다! 집중할 준비되셨나요?
TRIGGER:-PT15M
END:VALARM
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:🧠 학습 시작 5분 전입니다!
TRIGGER:-PT5M
END:VALARM
END:VEVENT
BEGIN:VEVENT
UID:certcafe-rest-stress-${todayStr}@ai.certcafe.com
DTSTART;TZID=Asia/Seoul:${todayStr}T103000
DTEND;TZID=Asia/Seoul:${todayStr}T104500
SUMMARY:🚨 스트레스 해소 휴식 (AI 자동 삽입)
DESCRIPTION:StressScore ≥ 0.30 감지로 AI가 자동 삽입한 휴식 블록입니다.\\n\\n🧘‍♀️ 휴식 가이드:\\n• 깊게 숨쉬기 (4초 들이쉬기 - 4초 참기 - 4초 내쉬기)\\n• 목과 어깨 스트레칭\\n• 창밖 먼 곳 바라보기 (눈의 피로 해소)\\n• 따뜻한 물 한 잔 마시기\\n\\n⚠️ 무리하지 마세요. 건강이 최우선입니다!
CATEGORIES:STUDY,REST,STRESS-RELIEF,AI-GENERATED
PRIORITY:3
STATUS:CONFIRMED
TRANSP:TRANSPARENT
END:VEVENT
BEGIN:VEVENT
UID:certcafe-practice-${todayStr}@ai.certcafe.com
DTSTART;TZID=Asia/Seoul:${todayStr}T104500
DTEND;TZID=Asia/Seoul:${todayStr}T123000
SUMMARY:💪 약점 집중 문제 풀이
DESCRIPTION:AI가 분석한 약점 주제를 중심으로 한 맞춤형 문제 풀이입니다.\\n\\n🎯 문제풀이 전략:\\n• 시간을 재고 실전처럼 풀어보세요\\n• 틀린 문제는 바로 해설을 보지 말고 다시 한번 생각해보세요\\n• 왜 틀렸는지 원인을 분석하며 학습하세요\\n• 비슷한 유형의 문제를 추가로 풀어보세요\\n\\n🤖 AI 분석: 약점 주제 기반 문제 선별
LOCATION:집중 학습 공간
CATEGORIES:STUDY,PRACTICE,WEAK-TOPICS,AI-GENERATED
PRIORITY:5
STATUS:CONFIRMED
TRANSP:OPAQUE
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:💪 문제 풀이 시간입니다! 실전처럼 도전해보세요!
TRIGGER:-PT10M
END:VALARM
END:VEVENT
BEGIN:VEVENT
UID:certcafe-lunch-${todayStr}@ai.certcafe.com
DTSTART;TZID=Asia/Seoul:${todayStr}T123000
DTEND;TZID=Asia/Seoul:${todayStr}T133000
SUMMARY:🍽️ 점심 휴식 & 에너지 충전
DESCRIPTION:오후 학습을 위한 에너지 충전 시간입니다.\\n\\n🥗 영양 가이드:\\n• 탄수화물 + 단백질 균형잡힌 식사\\n• 충분한 수분 섭취 (물 2-3잔)\\n• 카페인 적당히 (오후 학습 집중력 향상)\\n• 과식 금지 (졸음 유발 방지)\\n\\n😴 잠깐의 휴식도 좋습니다 (10-15분 파워냅)
CATEGORIES:BREAK,MEAL,ENERGY-RECHARGE
PRIORITY:2
STATUS:CONFIRMED
TRANSP:TRANSPARENT
END:VEVENT
BEGIN:VEVENT
UID:certcafe-review-${todayStr}@ai.certcafe.com
DTSTART;TZID=Asia/Seoul:${todayStr}T133000
DTEND;TZID=Asia/Seoul:${todayStr}T153000
SUMMARY:📚 오답 노트 복습 (감정 상태 맞춤)
DESCRIPTION:EmotionBand 분석에 따라 난이도가 조정된 복습 블록입니다.\\n\\n🔍 복습 방법:\\n• 틀린 문제를 다시 풀어보기\\n• 정답 과정을 단계별로 써보기\\n• 비슷한 유형 문제 찾아서 추가 학습\\n• 개념 정리 노트에 요약하기\\n\\n🎯 AI 맞춤: 현재 감정 상태에 최적화된 학습 강도
LOCATION:집중 학습 공간
CATEGORIES:STUDY,REVIEW,EMOTION-ADAPTIVE,AI-GENERATED
PRIORITY:4
STATUS:CONFIRMED
TRANSP:OPAQUE
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:📚 복습 시간입니다. 틀린 문제들을 정복해보세요!
TRIGGER:-PT10M
END:VALARM
END:VEVENT
BEGIN:VEVENT
UID:certcafe-cbt-${todayStr}@ai.certcafe.com
DTSTART;TZID=Asia/Seoul:${todayStr}T153000
DTEND;TZID=Asia/Seoul:${todayStr}T163000
SUMMARY:🖥️ CBT 모의고사 (AI 감정 격려)
DESCRIPTION:하루 학습을 마무리하는 실전 CBT 모의고사입니다.\\n\\n💻 CBT 실전 팁:\\n• 실제 시험 환경과 동일하게 설정\\n• 시간 배분 연습 (문제당 평균 시간 체크)\\n• 모르는 문제는 표시하고 넘어가기\\n• 검토 시간 5-10분 확보\\n\\n🤖 AI 격려: 감정 상태에 맞는 응원 메시지가 포함됩니다
LOCATION:CBT 연습 환경
CATEGORIES:STUDY,CBT,MOCK-EXAM,AI-GENERATED
PRIORITY:5
STATUS:CONFIRMED
TRANSP:OPAQUE
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:🖥️ CBT 모의고사 시간! 오늘 배운 것을 점검해보세요!
TRIGGER:-PT15M
END:VALARM
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:💪 모의고사 시작 직전! 긴장하지 말고 평소 실력을 발휘하세요!
TRIGGER:-PT2M
END:VALARM
END:VEVENT
BEGIN:VEVENT
UID:certcafe-daily-review-${todayStr}@ai.certcafe.com
DTSTART;TZID=Asia/Seoul:${todayStr}T163000
DTEND;TZID=Asia/Seoul:${todayStr}T164500
SUMMARY:✅ 하루 학습 정리 & 내일 계획
DESCRIPTION:오늘 하루 학습을 정리하고 내일을 준비하는 시간입니다.\\n\\n📝 정리 체크리스트:\\n• 오늘 학습한 내용 3줄 요약\\n• 새로 알게 된 개념이나 공식 정리\\n• 여전히 어려운 부분 표시\\n• 내일 우선 학습할 주제 선정\\n• 오늘의 학습 만족도 평가 (1-10점)\\n\\n🎯 내일은 더 발전된 모습으로!
CATEGORIES:REVIEW,PLANNING,DAILY-SUMMARY
PRIORITY:3
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

  // HTTP 헤더 설정
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="certcafe-ai-routine.ics"');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  console.log('📅 CertCafe AI 루틴 ICS 파일 다운로드 요청');
  
  // ICS 내용 전송
  res.status(200).send(icsContent);
}