import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { EmotionScore, EmotionBand, StressScore } from '@/types/store';

// 🔥 통합 감정 데이터 타입 확장
interface EnhancedEmotionData {
  score: number;        // -1 ~ 1 (부정 ~ 긍정)
  stress: number;       // 0 ~ 1 (낮음 ~ 높음)
  focus: number;        // 0 ~ 1 (산만 ~ 집중)
  confidence: number;   // 0 ~ 1 (불안 ~ 자신감)
  energy: number;       // 0 ~ 1 (피로 ~ 활력)
  timestamp: string;
}

interface ActivityRecord {
  id: string;
  activity: 'cbt' | 'routine' | 'problems' | 'community' | 'study';
  emotionBefore: EnhancedEmotionData;
  emotionAfter: EnhancedEmotionData;
  performance: number;  // 0 ~ 1
  duration: number;     // 분 단위
  timestamp: string;
  metadata?: {
    difficulty?: 'easy' | 'normal' | 'hard';
    score?: number;
    errors?: number;
    completionRate?: number;
  };
}

interface RoutineRecommendation {
  type: 'relaxation' | 'intensive' | 'normal' | 'break';
  duration: number;
  activities: string[];
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  adaptations: {
    cbtDifficulty: 'easy' | 'normal' | 'hard';
    studyIntensity: number; // 0 ~ 1
    breakFrequency: number; // 분 단위
  };
}

interface EmotionState {
  // 🔥 기존 + 확장된 현재 감정 상태
  currentScore: EmotionScore | null;
  currentEmotion: EnhancedEmotionData;
  stressScore: StressScore | null;
  emotionHistory: EmotionScore[];
  
  // 🔥 활동별 감정 추적
  activityHistory: ActivityRecord[];
  currentActivity: {
    id: string | null;
    type: string | null;
    startTime: string | null;
    startEmotion: EnhancedEmotionData | null;
  };
  
  // 🔥 실시간 모니터링
  isDetecting: boolean;
  webcamEnabled: boolean;
  micEnabled: boolean;
  isMonitoring: boolean;
  
  // 🔥 시스템 연동 상태
  connectedSystems: {
    cbt: boolean;
    routine: boolean;
    problems: boolean;
    community: boolean;
    notifications: boolean;
  };
  
  // 🔥 개인화 설정
  userPreferences: {
    sensitivityLevel: number; // 0 ~ 1 (낮음 ~ 높음)
    autoBreakEnabled: boolean;
    motivationEnabled: boolean;
    difficultyAutoAdjust: boolean;
  };
}

interface EmotionActions {
  // 🔥 기존 기능 유지
  startDetection: () => Promise<void>;
  stopDetection: () => void;
  updateEmotionScore: (score: number) => void;
  calculateStressScore: (errorRate: number) => void;
  getEmotionBand: (score: number) => EmotionBand;
  analyzeMultiModal: (webcamData?: ImageData, audioData?: Float32Array, textData?: string) => Promise<void>;
  saveEmotionData: () => Promise<void>;
  
  // 🔥 새로운 통합 기능들
  updateFullEmotion: (emotion: Partial<EnhancedEmotionData>) => void;
  startActivity: (activity: string, metadata?: any) => Promise<string>;
  endActivity: (activityId: string, performance: number, metadata?: any) => Promise<void>;
  
  // 🔥 시스템 연동 기능
  getOptimalRoutine: () => Promise<RoutineRecommendation>;
  getCBTDifficulty: () => 'easy' | 'normal' | 'hard';
  shouldTakeBreak: () => boolean;
  getMotivationalMessage: () => string;
  getStudyIntensity: () => number;
  
  // 🔥 분석 및 예측
  predictEmotionTrend: () => 'improving' | 'stable' | 'declining';
  getOptimalStudyTime: () => { start: string; end: string; };
  analyzeLearningPattern: () => {
    bestPerformanceTime: string;
    averageSessionLength: number;
    stressPatterns: string[];
  };
  
  // 🔥 시스템 알림
  broadcastEmotionChange: () => void;
  subscribeToEmotionChanges: (callback: (emotion: EnhancedEmotionData) => void) => () => void;
  
  // 🔥 설정 관리
  updatePreferences: (prefs: Partial<EmotionState['userPreferences']>) => void;
  connectSystem: (system: keyof EmotionState['connectedSystems']) => void;
  disconnectSystem: (system: keyof EmotionState['connectedSystems']) => void;
}

export const useEmotionStore = create<EmotionState & EmotionActions>()(
  immer((set, get) => ({
    // 🔥 상태 초기화 (기존 + 확장)
    currentScore: null,
    currentEmotion: {
      score: 0.5,
      stress: 0.3,
      focus: 0.7,
      confidence: 0.6,
      energy: 0.8,
      timestamp: new Date().toISOString()
    },
    stressScore: null,
    emotionHistory: [],
    activityHistory: [],
    currentActivity: {
      id: null,
      type: null,
      startTime: null,
      startEmotion: null
    },
    isDetecting: false,
    webcamEnabled: false,
    micEnabled: false,
    isMonitoring: false,
    connectedSystems: {
      cbt: false,
      routine: false,
      problems: false,
      community: false,
      notifications: false
    },
    userPreferences: {
      sensitivityLevel: 0.7,
      autoBreakEnabled: true,
      motivationEnabled: true,
      difficultyAutoAdjust: true
    },

    // 🔥 기존 액션들 유지
    startDetection: async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });

        set((state) => {
          state.isDetecting = true;
          state.webcamEnabled = true;
          state.micEnabled = true;
          state.isMonitoring = true;
        });

        console.log('🎥 [감정인식] 멀티모달 감정 검출 시작');
        
        // 🔥 실시간 모니터링 시작
        get().broadcastEmotionChange();
      } catch (error) {
        console.error('Failed to start emotion detection:', error);
        set((state) => {
          state.isDetecting = false;
          state.webcamEnabled = false;
          state.micEnabled = false;
          state.isMonitoring = false;
        });
      }
    },

    stopDetection: () => {
      set((state) => {
        state.isDetecting = false;
        state.webcamEnabled = false;
        state.micEnabled = false;
        state.isMonitoring = false;
      });
      console.log('⏹️ [감정인식] 멀티모달 감정 검출 중지');
    },

    updateEmotionScore: (score: number) => {
      const emotionBand = get().getEmotionBand(score);
      const newScore: EmotionScore = {
        score,
        band: emotionBand,
        timestamp: new Date().toISOString(),
      };

      set((state) => {
        state.currentScore = newScore;
        state.currentEmotion.score = score;
        state.currentEmotion.timestamp = newScore.timestamp;
        state.emotionHistory.push(newScore);
        
        if (state.emotionHistory.length > 50) {
          state.emotionHistory = state.emotionHistory.slice(-50);
        }
      });

      // 🔥 다른 시스템들에 감정 변화 알림
      get().broadcastEmotionChange();
    },

    calculateStressScore: (errorRate: number) => {
      const { currentScore, currentEmotion } = get();
      if (!currentScore) return;

      // 특허 공식: StressScore = α·ErrorRate + β·(1-EmotionScore)
      const α = 0.6;
      const β = 0.4;
      const stressValue = α * errorRate + β * (1 - currentScore.score);

      const newStressScore: StressScore = {
        value: Math.min(Math.max(stressValue, 0), 1),
        errorRate,
        emotionScore: currentScore.score,
        timestamp: new Date().toISOString(),
      };

      set((state) => {
        state.stressScore = newStressScore;
        state.currentEmotion.stress = newStressScore.value;
      });

      // 🔥 스트레스 임계값 체크 및 자동 대응
      if (stressValue >= 0.30) {
        console.log('⚠️ [스트레스] 높은 스트레스 감지, 루틴 재편성 트리거');
        
        // 자동 휴식 권장이 켜져있으면 알림
        if (get().userPreferences.autoBreakEnabled) {
          window.dispatchEvent(new CustomEvent('highStressDetected', {
            detail: { stressScore: stressValue, message: get().getMotivationalMessage() }
          }));
        }
      }
    },

    getEmotionBand: (score: number): EmotionBand => {
      if (score > 0.33) return 'High';
      if (score >= -0.33) return 'Medium';
      return 'Low';
    },

    analyzeMultiModal: async (webcamData?: ImageData, audioData?: Float32Array, textData?: string) => {
      try {
        const response = await fetch('/api/emotion/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webcam: webcamData ? Array.from(webcamData.data) : null,
            audio: audioData ? Array.from(audioData) : null,
            text: textData || null,
          }),
        });

        const result = await response.json();
        
        // 🔥 전체 감정 데이터 업데이트 (기존보다 더 정교)
        get().updateFullEmotion({
          score: result.emotionScore || Math.random() * 2 - 1,
          stress: result.stressLevel || Math.random(),
          focus: result.focusLevel || Math.random(),
          confidence: result.confidenceLevel || Math.random(),
          energy: result.energyLevel || Math.random(),
        });
        
      } catch (error) {
        console.error('Failed to analyze multimodal emotion:', error);
        // 🔥 폴백: 시뮬레이션 데이터
        get().updateFullEmotion({
          score: Math.random() * 2 - 1,
          stress: Math.random() * 0.6,
          focus: 0.5 + Math.random() * 0.5,
          confidence: 0.4 + Math.random() * 0.6,
          energy: 0.3 + Math.random() * 0.7,
        });
      }
    },

    saveEmotionData: async () => {
      const { currentScore, stressScore, currentEmotion } = get();
      if (!currentScore) return;

      try {
        const response = await fetch('/api/emotion/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'current-user-id',
            emotionScore: currentScore,
            stressScore,
            enhancedEmotion: currentEmotion,
            timestamp: new Date().toISOString()
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save emotion data');
        }
        
        console.log('💾 [감정데이터] Supabase 저장 완료');
      } catch (error) {
        console.error('Failed to save emotion data:', error);
      }
    },

    // 🔥 새로운 통합 기능들
    updateFullEmotion: (emotion: Partial<EnhancedEmotionData>) => {
      set((state) => {
        state.currentEmotion = {
          ...state.currentEmotion,
          ...emotion,
          timestamp: new Date().toISOString()
        };
      });
      
      get().broadcastEmotionChange();
      console.log('🧠 [감정업데이트]', emotion);
    },

    startActivity: async (activity: string, metadata?: any) => {
      const activityId = `${activity}_${Date.now()}`;
      const { currentEmotion } = get();
      
      set((state) => {
        state.currentActivity = {
          id: activityId,
          type: activity,
          startTime: new Date().toISOString(),
          startEmotion: { ...currentEmotion }
        };
      });
      
      console.log(`🎯 [활동시작] ${activity} - ID: ${activityId}`, metadata);
      return activityId;
    },

    endActivity: async (activityId: string, performance: number, metadata?: any) => {
      const { currentEmotion, currentActivity } = get();
      
      if (currentActivity.id !== activityId || !currentActivity.startEmotion) {
        console.warn('⚠️ [활동종료] 활동 ID 불일치 또는 시작 데이터 없음');
        return;
      }
      
      const duration = Date.now() - new Date(currentActivity.startTime!).getTime();
      const activityRecord: ActivityRecord = {
        id: activityId,
        activity: currentActivity.type as any,
        emotionBefore: currentActivity.startEmotion,
        emotionAfter: { ...currentEmotion },
        performance,
        duration: Math.round(duration / 60000), // 분 단위
        timestamp: new Date().toISOString(),
        metadata
      };
      
      set((state) => {
        state.activityHistory.push(activityRecord);
        state.currentActivity = {
          id: null,
          type: null,
          startTime: null,
          startEmotion: null
        };
        
        // 최근 100개 활동만 유지
        if (state.activityHistory.length > 100) {
          state.activityHistory = state.activityHistory.slice(-100);
        }
      });
      
      console.log(`✅ [활동완료] ${currentActivity.type} - 성과: ${Math.round(performance * 100)}%`, activityRecord);
    },

    // 🔥 시스템 연동 기능들
    getOptimalRoutine: async (): Promise<RoutineRecommendation> => {
      const { currentEmotion } = get();
      
      if (currentEmotion.stress > 0.7) {
        return {
          type: 'relaxation',
          duration: 15,
          activities: ['명상 5분', '가벼운 문제 풀이', '휴식'],
          message: '스트레스가 높네요. 잠시 휴식을 취하세요. 🌱',
          priority: 'urgent',
          adaptations: {
            cbtDifficulty: 'easy',
            studyIntensity: 0.3,
            breakFrequency: 15
          }
        };
      } else if (currentEmotion.focus > 0.8 && currentEmotion.energy > 0.7) {
        return {
          type: 'intensive',
          duration: 90,
          activities: ['어려운 문제 풀이', 'CBT 모의고사', '심화 학습'],
          message: '지금이 집중력이 최고조입니다! 🚀',
          priority: 'high',
          adaptations: {
            cbtDifficulty: 'hard',
            studyIntensity: 0.9,
            breakFrequency: 45
          }
        };
      } else if (currentEmotion.energy < 0.4) {
        return {
          type: 'break',
          duration: 30,
          activities: ['충분한 휴식', '가벼운 스트레칭', '수분 보충'],
          message: '에너지가 부족해요. 휴식이 필요합니다. ☕',
          priority: 'high',
          adaptations: {
            cbtDifficulty: 'easy',
            studyIntensity: 0.2,
            breakFrequency: 20
          }
        };
      } else {
        return {
          type: 'normal',
          duration: 45,
          activities: ['기본 문제 풀이', '복습', '개념 정리'],
          message: '꾸준한 학습으로 실력을 쌓아보세요! 💪',
          priority: 'normal',
          adaptations: {
            cbtDifficulty: 'normal',
            studyIntensity: 0.6,
            breakFrequency: 30
          }
        };
      }
    },

    getCBTDifficulty: () => {
      const { currentEmotion, userPreferences } = get();
      
      if (!userPreferences.difficultyAutoAdjust) {
        return 'normal';
      }
      
      const confidenceWeight = currentEmotion.confidence * 0.4;
      const focusWeight = currentEmotion.focus * 0.3;
      const stressWeight = (1 - currentEmotion.stress) * 0.3;
      
      const readinessScore = confidenceWeight + focusWeight + stressWeight;
      
      if (readinessScore > 0.7) return 'hard';
      if (readinessScore < 0.4) return 'easy';
      return 'normal';
    },

    shouldTakeBreak: () => {
      const { currentEmotion, userPreferences } = get();
      
      if (!userPreferences.autoBreakEnabled) {
        return false;
      }
      
      return (
        currentEmotion.stress > 0.7 || 
        currentEmotion.focus < 0.3 || 
        currentEmotion.energy < 0.3
      );
    },

    getMotivationalMessage: () => {
      const { currentEmotion } = get();
      
      if (currentEmotion.confidence < 0.4) {
        return "괜찮아요! 실패는 성공의 어머니입니다. 한 걸음씩 나아가요! 🌱";
      } else if (currentEmotion.energy < 0.3) {
        return "잠시 휴식을 취하고 다시 시작해요! 충분한 휴식도 학습의 일부예요. ☕";
      } else if (currentEmotion.score > 0.8) {
        return "정말 잘하고 있어요! 이 기세로 쭉 달려보세요! 🚀";
      } else if (currentEmotion.stress > 0.6) {
        return "조금 긴장이 되시나요? 깊게 숨을 쉬고 차근차근 해보세요. 🧘‍♀️";
      } else if (currentEmotion.focus < 0.4) {
        return "집중이 흐트러지고 있어요. 잠시 정리 시간을 갖는 건 어떨까요? 🎯";
      }
      return "꾸준한 노력이 최고의 재능입니다! 오늘도 화이팅! 💪";
    },

    getStudyIntensity: () => {
      const { currentEmotion } = get();
      
      // 감정 상태를 종합해서 0~1 사이의 학습 강도 반환
      const baseIntensity = 0.5;
      const focusBonus = (currentEmotion.focus - 0.5) * 0.3;
      const energyBonus = (currentEmotion.energy - 0.5) * 0.2;
      const stressPenalty = currentEmotion.stress * 0.3;
      const confidenceBonus = (currentEmotion.confidence - 0.5) * 0.2;
      
      const intensity = baseIntensity + focusBonus + energyBonus - stressPenalty + confidenceBonus;
      
      return Math.max(0.1, Math.min(1.0, intensity));
    },

    // 🔥 분석 및 예측 기능
    predictEmotionTrend: () => {
      const { emotionHistory } = get();
      
      if (emotionHistory.length < 5) return 'stable';
      
      const recent5 = emotionHistory.slice(-5);
      const scores = recent5.map(e => e.score);
      
      const trend = scores.reduce((acc, score, index) => {
        if (index === 0) return acc;
        return acc + (score - scores[index - 1]);
      }, 0);
      
      if (trend > 0.2) return 'improving';
      if (trend < -0.2) return 'declining';
      return 'stable';
    },

    getOptimalStudyTime: () => {
      const { activityHistory } = get();
      
      // 활동 기록을 분석해서 가장 성과가 좋았던 시간대 찾기
      const hourlyPerformance = new Array(24).fill(0).map(() => ({ total: 0, count: 0 }));
      
      activityHistory.forEach(activity => {
        const hour = new Date(activity.timestamp).getHours();
        hourlyPerformance[hour].total += activity.performance;
        hourlyPerformance[hour].count += 1;
      });
      
      const bestHour = hourlyPerformance
        .map((data, hour) => ({ 
          hour, 
          avgPerformance: data.count > 0 ? data.total / data.count : 0 
        }))
        .sort((a, b) => b.avgPerformance - a.avgPerformance)[0];
      
      const startHour = bestHour?.hour || 14; // 기본값 오후 2시
      
      return {
        start: `${startHour.toString().padStart(2, '0')}:00`,
        end: `${((startHour + 2) % 24).toString().padStart(2, '0')}:00`
      };
    },

    analyzeLearningPattern: () => {
      const { activityHistory } = get();
      
      if (activityHistory.length === 0) {
        return {
          bestPerformanceTime: '14:00',
          averageSessionLength: 45,
          stressPatterns: ['충분한 데이터가 없습니다']
        };
      }
      
      // 최고 성과 시간대
      const bestTime = get().getOptimalStudyTime().start;
      
      // 평균 세션 길이
      const avgLength = activityHistory.reduce((sum, activity) => sum + activity.duration, 0) / activityHistory.length;
      
      // 스트레스 패턴 분석
      const stressPatterns = [];
      const highStressActivities = activityHistory.filter(a => a.emotionBefore.stress > 0.6);
      
      if (highStressActivities.length > activityHistory.length * 0.3) {
        stressPatterns.push('스트레스 지수가 전반적으로 높음');
      }
      
      const morningStress = activityHistory.filter(a => {
        const hour = new Date(a.timestamp).getHours();
        return hour < 12 && a.emotionBefore.stress > 0.6;
      }).length;
      
      if (morningStress > 0) {
        stressPatterns.push('오전 시간대 스트레스 높음');
      }
      
      if (stressPatterns.length === 0) {
        stressPatterns.push('양호한 스트레스 관리 상태');
      }
      
      return {
        bestPerformanceTime: bestTime,
        averageSessionLength: Math.round(avgLength),
        stressPatterns
      };
    },

    // 🔥 시스템 알림 기능
    broadcastEmotionChange: () => {
      const { currentEmotion } = get();
      
      // 전역 이벤트 발송
      window.dispatchEvent(new CustomEvent('emotionChanged', { 
        detail: currentEmotion 
      }));
      
      // 콘솔 로그 (개발용)
      console.log('📡 [감정브로드캐스트]', {
        score: Math.round(currentEmotion.score * 100),
        stress: Math.round(currentEmotion.stress * 100),
        focus: Math.round(currentEmotion.focus * 100)
      });
    },

    subscribeToEmotionChanges: (callback: (emotion: EnhancedEmotionData) => void) => {
      const handler = (event: CustomEvent) => {
        callback(event.detail);
      };
      
      window.addEventListener('emotionChanged', handler as EventListener);
      
      // 구독 해제 함수 반환
      return () => {
        window.removeEventListener('emotionChanged', handler as EventListener);
      };
    },

    // 🔥 설정 관리
    updatePreferences: (prefs: Partial<EmotionState['userPreferences']>) => {
      set((state) => {
        state.userPreferences = { ...state.userPreferences, ...prefs };
      });
      console.log('⚙️ [설정업데이트]', prefs);
    },

    connectSystem: (system: keyof EmotionState['connectedSystems']) => {
      set((state) => {
        state.connectedSystems[system] = true;
      });
      console.log(`🔗 [시스템연결] ${system} 연결됨`);
    },

    disconnectSystem: (system: keyof EmotionState['connectedSystems']) => {
      set((state) => {
        state.connectedSystems[system] = false;
      });
      console.log(`🔌 [시스템해제] ${system} 연결 해제됨`);
    },
  }))
);