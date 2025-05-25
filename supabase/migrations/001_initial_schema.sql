-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Users 테이블 (Supabase Auth 확장)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 자격증 정보 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  exam_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 학습 루틴 테이블 (특허2: 감정-오답 기반 재편성)
-- ============================================
CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  certification_id UUID REFERENCES certifications(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  
  -- 특허 관련 필드
  emotion_score REAL DEFAULT 0.5 CHECK (emotion_score BETWEEN -1 AND 1),
  error_rate REAL DEFAULT 0 CHECK (error_rate BETWEEN 0 AND 1),
  latency_count INTEGER DEFAULT 0,
  stress_score REAL GENERATED ALWAYS AS (
    0.5 * error_rate + 0.3 * (1 - emotion_score) + 0.2 * LEAST(latency_count / 10.0, 1)
  ) STORED,
  
  -- 루틴 데이터
  schedule_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  ics_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CBT 세션 테이블 (특허1: 정서 융합 GPT 해설)
-- ============================================
CREATE TABLE IF NOT EXISTS cbt_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  
  -- CBT 정보
  questions_data JSONB NOT NULL DEFAULT '[]',
  answers_data JSONB NOT NULL DEFAULT '[]',
  
  -- 특허1 필드
  fact_score REAL DEFAULT 0.5 CHECK (fact_score BETWEEN 0 AND 1),
  emotion_drift REAL DEFAULT 0,
  regeneration_count INTEGER DEFAULT 0,
  cache_hit_rate REAL DEFAULT 0,
  response_time INTEGER DEFAULT 0, -- milliseconds
  
  -- 상태
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 커뮤니티 게시글 테이블 (특허3: 커뮤니티 피드백)
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  certification_id UUID REFERENCES certifications(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  content TEXT,
  category TEXT DEFAULT 'general',
  
  -- 특허3: 피드백 벡터 (128차원)
  feedback_vector REAL[] DEFAULT NULL,
  negative_ratio REAL DEFAULT 0 CHECK (negative_ratio BETWEEN 0 AND 1),
  
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 댓글 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  content TEXT NOT NULL,
  sentiment_score REAL DEFAULT 0 CHECK (sentiment_score BETWEEN -1 AND 1),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 피드백 이벤트 테이블 (특허3: τ_neg 계산용)
-- ============================================
CREATE TABLE IF NOT EXISTS feedback_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  
  -- 특허3 필드
  tau_neg REAL NOT NULL CHECK (tau_neg BETWEEN 0 AND 1),
  feedback_triggered BOOLEAN DEFAULT false,
  delta_values JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 성능 메트릭 테이블 (특허4: 분산 GPU 클러스터)
-- ============================================
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- GPU 클러스터 메트릭
  cache_hit_rate REAL DEFAULT 0,
  gpu_utilization REAL DEFAULT 0,
  power_saving_mode BOOLEAN DEFAULT false,
  
  -- Edge ASIC 메트릭
  edge_inference_time INTEGER DEFAULT 0,
  asic_utilization REAL DEFAULT 0,
  
  -- 전체 시스템
  active_users INTEGER DEFAULT 0,
  response_time_p95 INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 인덱스 생성 (성능 최적화)
-- ============================================
CREATE INDEX idx_routines_user_id ON routines(user_id);
CREATE INDEX idx_routines_stress_score ON routines(stress_score);
CREATE INDEX idx_cbt_sessions_user_id ON cbt_sessions(user_id);
CREATE INDEX idx_cbt_sessions_fact_score ON cbt_sessions(fact_score);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_feedback_events_tau_neg ON feedback_events(tau_neg);

-- ============================================
-- 자동 업데이트 트리거
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_routines_updated_at
    BEFORE UPDATE ON routines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();