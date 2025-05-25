// 📁 src/store/problemsStore.ts - 문제 업로드 상태 관리
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface Problem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  type: 'multiple_choice' | 'essay' | 'calculation' | 'practical';
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string; // 정보처리기사, 컴활1급 등
  category: string; // 데이터베이스, 프로그래밍 등
  myAnswer?: string;
  correctAnswer?: string;
  isCorrect?: boolean;
  uploadedAt: string;
  status: 'uploading' | 'analyzing' | 'completed' | 'error';
}

export interface Analysis {
  id: string;
  problemId: string;
  ocrText?: string;
  recognizedType: string;
  difficulty: string;
  keyPoints: string[];
  recommendation: string;
  estimatedTime: number; // 예상 풀이 시간 (분)
  similarProblems: string[];
  weaknessArea?: string;
  confidence: number; // AI 분석 신뢰도 0-1
  createdAt: string;
}

export interface StudyRoutine {
  id: string;
  title: string;
  description: string;
  problems: string[]; // Problem IDs
  duration: number; // 일수
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  schedule: {
    day: number;
    tasks: string[];
    estimatedHours: number;
  }[];
  createdAt: string;
  isActive: boolean;
}

interface ProblemsState {
  problems: Problem[];
  analyses: Analysis[];
  routines: StudyRoutine[];
  uploadProgress: number;
  isAnalyzing: boolean;
  currentAnalysis: Analysis | null;
  
  // Actions
  uploadProblem: (problem: Omit<Problem, 'id' | 'uploadedAt' | 'status'>) => Promise<string>;
  analyzeProblem: (problemId: string) => Promise<void>;
  generateRoutine: (problemIds: string[], duration: number) => Promise<void>;
  updateProblem: (id: string, updates: Partial<Problem>) => void;
  deleteProblem: (id: string) => void;
  getProblemsBy: (filters: { subject?: string; category?: string; difficulty?: string }) => Problem[];
  getAnalysisForProblem: (problemId: string) => Analysis | undefined;
  loadTestData: () => void;
}

export const useProblemsStore = create<ProblemsState>()(
  immer((set, get) => ({
    problems: [],
    analyses: [],
    routines: [],
    uploadProgress: 0,
    isAnalyzing: false,
    currentAnalysis: null,

    uploadProblem: async (problemData) => {
      console.log('📸 [DEBUG] 문제 업로드 시작:', problemData.title);
      
      const newProblem: Problem = {
        ...problemData,
        id: `problem-${Date.now()}`,
        uploadedAt: new Date().toISOString(),
        status: 'uploading'
      };

      set((state) => {
        state.problems.unshift(newProblem);
        state.uploadProgress = 0;
      });

      // 업로드 진행률 시뮬레이션
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        set((state) => {
          state.uploadProgress = i;
        });
      }

      set((state) => {
        const problem = state.problems.find(p => p.id === newProblem.id);
        if (problem) {
          problem.status = 'completed';
        }
        state.uploadProgress = 0;
      });

      console.log('✅ [DEBUG] 문제 업로드 완료:', newProblem.id);
      
      // 자동으로 분석 시작
      setTimeout(() => {
        get().analyzeProblem(newProblem.id);
      }, 500);

      return newProblem.id;
    },

    analyzeProblem: async (problemId: string) => {
      console.log('🧠 [DEBUG] 문제 분석 시작:', problemId);
      
      set((state) => {
        state.isAnalyzing = true;
        const problem = state.problems.find(p => p.id === problemId);
        if (problem) {
          problem.status = 'analyzing';
        }
      });

      // AI 분석 시뮬레이션 (3초)
      await new Promise(resolve => setTimeout(resolve, 3000));

      const problem = get().problems.find(p => p.id === problemId);
      if (!problem) return;

      // 모의 분석 결과 생성
      const analysis: Analysis = {
        id: `analysis-${Date.now()}`,
        problemId,
        ocrText: problem.content,
        recognizedType: problem.type,
        difficulty: problem.difficulty,
        keyPoints: [
          '객체지향 프로그래밍의 상속 개념',
          '다형성과 오버라이딩',
          '클래스와 인스턴스의 관계'
        ],
        recommendation: '상속 개념을 다시 복습하고, 다형성 예제를 3개 이상 직접 구현해보시길 추천드립니다. 특히 메서드 오버라이딩과 오버로딩의 차이점을 명확히 이해하는 것이 중요합니다.',
        estimatedTime: 15,
        similarProblems: ['prob-001', 'prob-023', 'prob-045'],
        weaknessArea: problem.category,
        confidence: 0.87,
        createdAt: new Date().toISOString()
      };

      set((state) => {
        state.analyses.push(analysis);
        state.currentAnalysis = analysis;
        state.isAnalyzing = false;
        
        const problemToUpdate = state.problems.find(p => p.id === problemId);
        if (problemToUpdate) {
          problemToUpdate.status = 'completed';
        }
      });

      console.log('✅ [DEBUG] 문제 분석 완료:', analysis.id);
      
      // 자동으로 루틴 생성
      setTimeout(() => {
        get().generateRoutine([problemId], 7);
      }, 1000);
    },

    generateRoutine: async (problemIds: string[], duration: number) => {
      console.log('🎯 [DEBUG] 루틴 생성 시작:', { problemIds, duration });
      
      const problems = get().problems.filter(p => problemIds.includes(p.id));
      const analyses = get().analyses.filter(a => problemIds.includes(a.problemId));
      
      // 약점 영역 분석
      const weaknessAreas = analyses.map(a => a.weaknessArea).filter(Boolean);
      const mainWeakness = weaknessAreas[0] || '종합 복습';

      const routine: StudyRoutine = {
        id: `routine-${Date.now()}`,
        title: `${mainWeakness} 집중 보완 루틴 (${duration}일)`,
        description: `업로드한 문제 분석 결과를 바탕으로 생성된 맞춤형 학습 계획입니다. 약점 영역인 ${mainWeakness}을(를) 중점적으로 다룹니다.`,
        problems: problemIds,
        duration,
        difficulty: 'intermediate',
        schedule: Array.from({ length: duration }, (_, index) => ({
          day: index + 1,
          tasks: [
            `Day ${index + 1}: ${mainWeakness} 개념 복습`,
            '관련 예제 문제 3개 풀이',
            '오답 노트 작성 및 정리'
          ],
          estimatedHours: 2
        })),
        createdAt: new Date().toISOString(),
        isActive: true
      };

      set((state) => {
        state.routines.unshift(routine);
      });

      console.log('✅ [DEBUG] 루틴 생성 완료:', routine.id);
    },

    updateProblem: (id: string, updates: Partial<Problem>) => {
      set((state) => {
        const problem = state.problems.find(p => p.id === id);
        if (problem) {
          Object.assign(problem, updates);
        }
      });
    },

    deleteProblem: (id: string) => {
      set((state) => {
        state.problems = state.problems.filter(p => p.id !== id);
        state.analyses = state.analyses.filter(a => a.problemId !== id);
      });
    },

    getProblemsBy: (filters) => {
      const { problems } = get();
      return problems.filter(problem => {
        if (filters.subject && problem.subject !== filters.subject) return false;
        if (filters.category && problem.category !== filters.category) return false;
        if (filters.difficulty && problem.difficulty !== filters.difficulty) return false;
        return true;
      });
    },

    getAnalysisForProblem: (problemId: string) => {
      return get().analyses.find(a => a.problemId === problemId);
    },

    loadTestData: () => {
      console.log('🧪 [DEBUG] 테스트 데이터 로드');
      
      const testProblems: Problem[] = [
        {
          id: 'prob-001',
          title: '객체지향 프로그래밍 - 상속',
          content: '다음 중 자바에서 상속에 대한 설명으로 옳지 않은 것은?\nA) 하위 클래스는 상위 클래스의 모든 멤버를 상속받는다\nB) 생성자는 상속되지 않는다\nC) private 멤버는 상속되지 않는다\nD) 다중 상속이 가능하다',
          type: 'multiple_choice',
          difficulty: 'medium',
          subject: '정보처리기사',
          category: '프로그래밍',
          myAnswer: 'D',
          correctAnswer: 'D',
          isCorrect: true,
          uploadedAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed'
        },
        {
          id: 'prob-002',
          title: '데이터베이스 정규화',
          content: '제3정규형(3NF)에 대한 설명으로 올바른 것은?\nA) 부분함수 종속이 존재하지 않는다\nB) 이행함수 종속이 존재하지 않는다\nC) 다중값 종속이 존재하지 않는다\nD) 조인 종속이 존재하지 않는다',
          type: 'multiple_choice',
          difficulty: 'hard',
          subject: '정보처리기사',
          category: '데이터베이스',
          myAnswer: 'A',
          correctAnswer: 'B',
          isCorrect: false,
          uploadedAt: new Date(Date.now() - 7200000).toISOString(),
          status: 'completed'
        },
        {
          id: 'prob-003',
          title: '네트워크 프로토콜',
          content: 'OSI 7계층 모델에서 전송계층의 주요 기능은?',
          type: 'essay',
          difficulty: 'medium',
          subject: '정보처리기사',
          category: '네트워크',
          myAnswer: '데이터의 신뢰성 있는 전송 보장',
          uploadedAt: new Date(Date.now() - 10800000).toISOString(),
          status: 'completed'
        }
      ];

      const testAnalyses: Analysis[] = [
        {
          id: 'analysis-001',
          problemId: 'prob-001',
          ocrText: testProblems[0].content,
          recognizedType: 'multiple_choice',
          difficulty: 'medium',
          keyPoints: ['객체지향 상속', '자바 언어 특성', '다중 상속 제한'],
          recommendation: '자바의 단일 상속 특성을 이해하고, 인터페이스를 통한 다중 구현 방법을 학습하세요.',
          estimatedTime: 10,
          similarProblems: ['prob-004', 'prob-007'],
          weaknessArea: '프로그래밍',
          confidence: 0.92,
          createdAt: new Date(Date.now() - 3500000).toISOString()
        },
        {
          id: 'analysis-002',
          problemId: 'prob-002',
          ocrText: testProblems[1].content,
          recognizedType: 'multiple_choice',
          difficulty: 'hard',
          keyPoints: ['데이터베이스 정규화', '제3정규형', '이행함수 종속'],
          recommendation: '정규화 단계별 조건을 정확히 암기하고, 이행함수 종속 개념을 다시 학습하세요. 실제 테이블 예제로 연습해보시길 권합니다.',
          estimatedTime: 20,
          similarProblems: ['prob-008', 'prob-012'],
          weaknessArea: '데이터베이스',
          confidence: 0.88,
          createdAt: new Date(Date.now() - 7100000).toISOString()
        }
      ];

      const testRoutines: StudyRoutine[] = [
        {
          id: 'routine-001',
          title: '데이터베이스 집중 보완 루틴 (7일)',
          description: '정규화 문제에서 틀린 부분을 보완하기 위한 맞춤형 학습 계획입니다.',
          problems: ['prob-002'],
          duration: 7,
          difficulty: 'intermediate',
          schedule: [
            { day: 1, tasks: ['정규화 1NF, 2NF 개념 복습', '부분함수 종속 이해'], estimatedHours: 2 },
            { day: 2, tasks: ['정규화 3NF, BCNF 개념 학습', '이행함수 종속 완전 이해'], estimatedHours: 2.5 },
            { day: 3, tasks: ['정규화 예제 문제 10개 풀이', '오답 분석'], estimatedHours: 3 },
            { day: 4, tasks: ['실제 테이블 정규화 실습', 'ERD 작성 연습'], estimatedHours: 2.5 },
            { day: 5, tasks: ['정규화 관련 기출문제 풀이', '약점 재점검'], estimatedHours: 2 },
            { day: 6, tasks: ['종합 문제 풀이', '실전 연습'], estimatedHours: 3 },
            { day: 7, tasks: ['최종 점검', '부족한 부분 보완'], estimatedHours: 2 }
          ],
          createdAt: new Date(Date.now() - 6000000).toISOString(),
          isActive: true
        }
      ];

      set((state) => {
        state.problems = testProblems;
        state.analyses = testAnalyses;
        state.routines = testRoutines;
      });

      console.log('✅ [DEBUG] 테스트 데이터 로드 완료');
    }
  }))
);