// 📁 src/lib/database.ts - SQLite 버전

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 🎯 타입 정의
export interface Problem {
  id: string;
  subject: string;
  question: string;
  options: string; // JSON string
  correct: number;
  explanation: string;
  difficulty: string;
  year: number;
  category: string;
  tags: string; // JSON string
  estimatedTime?: number;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

// 📁 데이터베이스 파일 경로
const DB_PATH = path.join(process.cwd(), 'src/data/problems.db');

// 💾 데이터베이스 초기화
export function initDatabase(): Database.Database {
  // 디렉토리 생성
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  
  // 테이블 생성
  db.exec(`
    CREATE TABLE IF NOT EXISTS problems (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct INTEGER NOT NULL,
      explanation TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      year INTEGER NOT NULL,
      category TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      estimated_time INTEGER,
      source TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_subject ON problems(subject);
    CREATE INDEX IF NOT EXISTS idx_difficulty ON problems(difficulty);
    CREATE INDEX IF NOT EXISTS idx_category ON problems(category);
    CREATE INDEX IF NOT EXISTS idx_year ON problems(year);
  `);

  console.log('💾 SQLite 데이터베이스 초기화 완료');
  return db;
}

// 🎯 문제 선택 함수
export function selectProblemsFromDB(
  subject: string,
  count: number,
  difficulty?: string,
  category?: string
): Problem[] {
  const db = initDatabase();
  
  let query = 'SELECT * FROM problems WHERE subject = ?';
  const params: any[] = [subject];
  
  if (difficulty && difficulty !== '보통') {
    const difficultyMap: Record<string, string> = {
      '쉬움': '하',
      '보통': '중', 
      '어려움': '상'
    };
    query += ' AND difficulty = ?';
    params.push(difficultyMap[difficulty] || difficulty);
  }
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY RANDOM() LIMIT ?';
  params.push(count);
  
  const stmt = db.prepare(query);
  const results = stmt.all(...params);
  
  db.close();
  
  // JSON 필드 파싱
  return results.map((row: any) => ({
    ...row,
    options: JSON.parse(row.options),
    tags: JSON.parse(row.tags || '[]')
  }));
}

// 📊 통계 조회
export function getStatsFromDB(subject: string): any {
  const db = initDatabase();
  
  const totalStmt = db.prepare('SELECT COUNT(*) as total FROM problems WHERE subject = ?');
  const total = totalStmt.get(subject)?.total || 0;
  
  const difficultyStmt = db.prepare(`
    SELECT difficulty, COUNT(*) as count 
    FROM problems 
    WHERE subject = ? 
    GROUP BY difficulty
  `);
  const difficultyResults = difficultyStmt.all(subject);
  
  const categoryStmt = db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM problems 
    WHERE subject = ? 
    GROUP BY category
  `);
  const categoryResults = categoryStmt.all(subject);
  
  db.close();
  
  return {
    total,
    byDifficulty: Object.fromEntries(
      difficultyResults.map((r: any) => [r.difficulty, r.count])
    ),
    byCategory: Object.fromEntries(
      categoryResults.map((r: any) => [r.category, r.count])
    )
  };
}

// 📝 문제 추가
export function addProblemToDB(problem: Omit<Problem, 'createdAt' | 'updatedAt'>): boolean {
  const db = initDatabase();
  
  try {
    const stmt = db.prepare(`
      INSERT INTO problems (
        id, subject, question, options, correct, explanation,
        difficulty, year, category, tags, estimated_time, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      problem.id,
      problem.subject,
      problem.question,
      JSON.stringify(problem.options),
      problem.correct,
      problem.explanation,
      problem.difficulty,
      problem.year,
      problem.category,
      JSON.stringify(problem.tags || []),
      problem.estimatedTime,
      problem.source
    );
    
    db.close();
    console.log(`✅ 문제 추가됨: ${problem.id}`);
    return true;
  } catch (error) {
    console.error('❌ 문제 추가 실패:', error);
    db.close();
    return false;
  }
}

// 📥 대량 문제 가져오기
export function importProblemsFromJSON(jsonData: string): number {
  try {
    const problems = JSON.parse(jsonData);
    let successCount = 0;
    
    for (const [subject, subjectProblems] of Object.entries(problems)) {
      if (Array.isArray(subjectProblems)) {
        for (const problem of subjectProblems as any[]) {
          if (addProblemToDB({ ...problem, subject })) {
            successCount++;
          }
        }
      }
    }
    
    return successCount;
  } catch (error) {
    console.error('❌ JSON 가져오기 실패:', error);
    return 0;
  }
}

// 🔍 문제 검색
export function searchProblemsInDB(
  subject: string,
  searchQuery: string,
  limit: number = 50
): Problem[] {
  const db = initDatabase();
  
  const stmt = db.prepare(`
    SELECT * FROM problems 
    WHERE subject = ? AND (
      question LIKE ? OR 
      explanation LIKE ? OR 
      category LIKE ?
    ) 
    LIMIT ?
  `);
  
  const searchPattern = `%${searchQuery}%`;
  const results = stmt.all(subject, searchPattern, searchPattern, searchPattern, limit);
  
  db.close();
  
  return results.map((row: any) => ({
    ...row,
    options: JSON.parse(row.options),
    tags: JSON.parse(row.tags || '[]')
  }));
}