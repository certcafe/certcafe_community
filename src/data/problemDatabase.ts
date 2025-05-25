// 📁 src/lib/problemDatabase.ts - JSON 파일 기반 버전

import fs from 'fs';
import path from 'path';

// 🎯 타입 정의 (동일)
export interface Problem {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard' | '하' | '중' | '상';
  year: number;
  category: string;
  personalizedHint?: string;
  tags?: string[];
  estimatedTime?: number;
  source?: string;
}

export interface ProblemStats {
  total: number;
  byDifficulty: Record<string, number>;
  byCategory: Record<string, number>;
  byYear: Record<number, number>;
  bySource?: Record<string, number>;
}

export interface FilterOptions {
  difficulty?: string;
  category?: string;
  year?: number;
  tags?: string[];
  source?: string;
}

// 📁 JSON 파일 경로
const PROBLEMS_FILE_PATH = path.join(process.cwd(), 'src/data/problems.json');

// 💾 문제 데이터 로드 함수
function loadProblemsFromFile(): Record<string, Problem[]> {
  try {
    // 파일이 없으면 빈 객체 반환
    if (!fs.existsSync(PROBLEMS_FILE_PATH)) {
      console.log('📄 problems.json 파일이 없습니다. 기본 데이터를 사용합니다.');
      return getDefaultProblems();
    }

    const fileContent = fs.readFileSync(PROBLEMS_FILE_PATH, 'utf-8');
    const problems = JSON.parse(fileContent);
    
    console.log(`📚 JSON 파일에서 문제 데이터 로드 완료`);
    return problems;
  } catch (error) {
    console.error('❌ JSON 파일 로드 실패:', error);
    return getDefaultProblems();
  }
}

// 💾 문제 데이터 저장 함수
function saveProblemsToFile(problems: Record<string, Problem[]>): boolean {
  try {
    // 디렉토리가 없으면 생성
    const dir = path.dirname(PROBLEMS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const jsonData = JSON.stringify(problems, null, 2);
    fs.writeFileSync(PROBLEMS_FILE_PATH, jsonData, 'utf-8');
    
    console.log('💾 문제 데이터 저장 완료');
    return true;
  } catch (error) {
    console.error('❌ JSON 파일 저장 실패:', error);
    return false;
  }
}

// 🏆 기본 문제 데이터 (fallback)
function getDefaultProblems(): Record<string, Problem[]> {
  return {
    '컴퓨터활용능력 1급': [
      {
        id: 'ca1_001',
        question: 'Excel에서 VLOOKUP 함수를 사용할 때, 네 번째 인수 FALSE의 의미는?',
        options: [
          '정확히 일치하는 값만 찾는다',
          '근사치를 허용하여 값을 찾는다',
          '첫 번째 열에서만 값을 찾는다',
          '오름차순으로 정렬된 데이터에서만 사용한다',
          '내림차순으로 정렬된 데이터에서만 사용한다'
        ],
        correct: 0,
        explanation: 'VLOOKUP 함수의 네 번째 인수가 FALSE일 때는 정확히 일치하는 값만 찾습니다.',
        difficulty: '중',
        year: 2024,
        category: 'Excel_함수',
        tags: ['함수', 'VLOOKUP'],
        estimatedTime: 120,
        source: '기본 제공'
      }
    ],
    '정보처리기사': [
      {
        id: 'ip_001',
        question: '소프트웨어 생명주기 모델에서 폭포수 모델의 특징으로 옳지 않은 것은?',
        options: [
          '각 단계가 순차적으로 진행된다',
          '이전 단계로의 피드백이 어렵다',
          '요구사항 변경에 유연하게 대응할 수 있다',
          '각 단계의 결과물이 명확하다',
          '전통적이고 체계적인 접근 방법이다'
        ],
        correct: 2,
        explanation: '폭포수 모델은 순차적 진행으로 인해 요구사항 변경에 유연하게 대응하기 어렵습니다.',
        difficulty: '중',
        year: 2024,
        category: '소프트웨어공학',
        tags: ['생명주기', '폭포수'],
        estimatedTime: 120,
        source: '기본 제공'
      }
    ]
  };
}

// 🎯 메모리 캐시 (성능 향상용)
let PROBLEMS_CACHE: Record<string, Problem[]> | null = null;

// 📚 문제 데이터 가져오기
function getProblems(): Record<string, Problem[]> {
  if (!PROBLEMS_CACHE) {
    PROBLEMS_CACHE = loadProblemsFromFile();
  }
  return PROBLEMS_CACHE;
}

// 🔄 캐시 무효화
function invalidateCache(): void {
  PROBLEMS_CACHE = null;
}

// 🎯 스마트 문제 선택 함수 (수정됨)
export function selectPremiumProblems(
  subject: string,
  count: number,
  difficulty: string = '보통',
  options: FilterOptions = {}
): Problem[] {
  const allProblems = getProblems();
  const subjectProblems = allProblems[subject] || [];

  if (subjectProblems.length === 0) {
    console.log(`⚠️ ${subject} 과목의 프리미엄 문제가 없습니다`);
    return [];
  }

  // 필터링 로직 (동일)
  let filteredProblems = subjectProblems.filter(problem => {
    if (difficulty !== '보통') {
      const difficultyMap: Record<string, string> = {
        '쉬움': '하',
        '보통': '중',
        '어려움': '상'
      };
      if (problem.difficulty !== difficultyMap[difficulty] &&
          problem.difficulty !== difficulty) {
        return false;
      }
    }

    if (options.category && problem.category !== options.category) {
      return false;
    }

    if (options.year && problem.year !== options.year) {
      return false;
    }

    if (options.tags && options.tags.length > 0) {
      const problemTags = problem.tags || [];
      const hasMatchingTag = options.tags.some(tag =>
        problemTags.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }

    return true;
  });

  if (filteredProblems.length < count) {
    filteredProblems = subjectProblems;
  }

  const shuffled = [...filteredProblems].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  console.log(`🏆 프리미엄 문제 선택: ${selected.length}개 (${subject})`);
  return selected;
}

// 📊 문제 통계 정보
export function getProblemStats(subject: string): ProblemStats {
  const allProblems = getProblems();
  const problems = allProblems[subject] || [];

  const stats: ProblemStats = {
    total: problems.length,
    byDifficulty: {},
    byCategory: {},
    byYear: {},
    bySource: {}
  };

  problems.forEach(problem => {
    stats.byDifficulty[problem.difficulty] =
      (stats.byDifficulty[problem.difficulty] || 0) + 1;

    stats.byCategory[problem.category] =
      (stats.byCategory[problem.category] || 0) + 1;

    stats.byYear[problem.year] =
      (stats.byYear[problem.year] || 0) + 1;

    if (problem.source && stats.bySource) {
      stats.bySource[problem.source] =
        (stats.bySource[problem.source] || 0) + 1;
    }
  });

  return stats;
}

// 🔄 문제 추가/업데이트 함수 (수정됨)
export function addProblemsToDatabase(
  subject: string,
  newProblems: Problem[]
): number {
  const allProblems = getProblems();
  
  if (!allProblems[subject]) {
    allProblems[subject] = [];
  }

  // 중복 체크 및 유효성 검사
  const existingIds = new Set(allProblems[subject].map(p => p.id));
  const validProblems = newProblems.filter(problem => {
    return (
      !existingIds.has(problem.id) &&
      problem.id &&
      problem.question &&
      problem.options &&
      problem.options.length >= 2 &&
      typeof problem.correct === 'number' &&
      problem.correct >= 0 &&
      problem.correct < problem.options.length &&
      problem.explanation
    );
  });

  allProblems[subject].push(...validProblems);

  // 파일에 저장
  const saved = saveProblemsToFile(allProblems);
  if (saved) {
    invalidateCache(); // 캐시 무효화
  }

  console.log(`✅ ${subject}에 ${validProblems.length}개 문제 추가됨`);
  return validProblems.length;
}

// 📤 JSON 내보내기
export function exportProblems(subject: string): string {
  const allProblems = getProblems();
  const problems = allProblems[subject] || [];
  return JSON.stringify(problems, null, 2);
}

// 📥 JSON 가져오기
export function importProblems(subject: string, jsonData: string): number {
  try {
    const problems: Problem[] = JSON.parse(jsonData);
    return addProblemsToDatabase(subject, problems);
  } catch (error) {
    console.error('❌ JSON 파싱 오류:', error);
    return 0;
  }
}

// 📋 사용 가능한 과목 목록
export function getAvailableSubjects(): string[] {
  const allProblems = getProblems();
  return Object.keys(allProblems);
}

// 🔄 전체 데이터베이스 백업
export function backupDatabase(): string {
  const allProblems = getProblems();
  return JSON.stringify(allProblems, null, 2);
}

// 🔄 전체 데이터베이스 복원
export function restoreDatabase(backupData: string): boolean {
  try {
    const problems = JSON.parse(backupData);
    const saved = saveProblemsToFile(problems);
    if (saved) {
      invalidateCache();
    }
    return saved;
  } catch (error) {
    console.error('❌ 백업 복원 실패:', error);
    return false;
  }
}