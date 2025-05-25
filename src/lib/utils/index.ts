import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 특허2: StressScore 계산 함수
export function calculateStressScore(
  emotionScore: number = 0.5,
  errorRate: number = 0,
  latencyCount: number = 0
): number {
  const fatigueScore = 1 - emotionScore
  const normalizedLatency = Math.min(latencyCount / 10, 1)
  
  return 0.5 * errorRate + 0.3 * fatigueScore + 0.2 * normalizedLatency
}

// 특허1: EmotionBand 분류
export function getEmotionBand(emotionScore: number): 'High' | 'Medium' | 'Low' {
  if (emotionScore >= 0.7) return 'High'
  if (emotionScore >= 0.4) return 'Medium'
  return 'Low'
}

// 특허1: FactScore 검증
export function isFactScoreValid(factScore: number): boolean {
  return factScore >= 0.85 && factScore <= 0.95
}

// 특허1: EmotionDrift 검증
export function isEmotionDriftAcceptable(drift: number): boolean {
  return drift <= 0.15
}

// 특허3: τ_neg 지수평활 계산
export function calculateTauNeg(
  feedbackHistory: Array<{ negRatio: number }>,
  lambda: number = 0.3
): number {
  if (!feedbackHistory || feedbackHistory.length === 0) return 0.1

  const recent30 = feedbackHistory.slice(-30)
  let expSmoothed = recent30[0]?.negRatio ?? 0.1

  for (let i = 1; i < recent30.length; i++) {
    const currentRatio = recent30[i]?.negRatio ?? 0.1
    expSmoothed = lambda * currentRatio + (1 - lambda) * expSmoothed
  }

  return Math.max(0.1, Math.min(0.3, expSmoothed))
}

// 특허3: 피드백 트리거 체크
export function shouldTriggerFeedback(
  feedbackVector: number[],
  tauNeg: number
): boolean {
  if (!feedbackVector || feedbackVector.length !== 128) return false

  const negativeCount = feedbackVector.filter(val => val < -0.1).length
  const negativeRatio = negativeCount / feedbackVector.length

  return negativeRatio >= tauNeg && negativeRatio <= 0.3
}

// 날짜 포맷팅
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

// 시간 포맷팅
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// 응답시간 포맷팅 (특허1: p95 250ms 목표)
export function formatResponseTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

// 캐시 히트율 상태 (특허1: 78% 목표)
export function getCacheStatus(hitRate: number): 'optimal' | 'good' | 'poor' {
  if (hitRate >= 78) return 'optimal'
  if (hitRate >= 60) return 'good'
  return 'poor'
}

/* ================================= */