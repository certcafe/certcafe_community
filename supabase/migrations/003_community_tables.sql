-- supabase/migrations/003_community_tables.sql
-- 커뮤니티 피드백 시스템 테이블

-- 게시글 테이블
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'routine_feedback', 'study_tips', 'question')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- 댓글 테이블  
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  sentiment REAL DEFAULT 0.0, -- -1(부정) ~ 1(긍정)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- 투표 테이블
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('up', 'down', 'helpful', 'not_helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, vote_type)
);

-- 피드백 이벤트 테이블 (특허 핵심)
CREATE TABLE feedback_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tau_neg REAL NOT NULL, -- 부정 피드백 비율 (0~1)
  feedback_vector REAL[], -- 128차원 피드백 벡터 ν_feedback
  delta_value REAL DEFAULT 0.0, -- 변화량 Δ
  correction_applied BOOLEAN DEFAULT FALSE,
  trigger_time TIMESTAMPTZ DEFAULT NOW(),
  resolved_time TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- RLS 정책 설정
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_events ENABLE ROW LEVEL SECURITY;

-- Posts 정책
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (NOT is_deleted);
CREATE POLICY "Users can insert their own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);

-- Comments 정책  
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (NOT is_deleted);
CREATE POLICY "Users can insert their own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);

-- Votes 정책
CREATE POLICY "Votes are viewable by everyone" ON votes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own votes" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON votes FOR UPDATE USING (auth.uid() = user_id);

-- Feedback Events 정책 (관리자 전용)
CREATE POLICY "Feedback events viewable by authenticated users" ON feedback_events FOR SELECT USING (auth.role() = 'authenticated');

-- 인덱스 생성
CREATE INDEX idx_posts_routine_id ON posts(routine_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_votes_post_id ON votes(post_id);
CREATE INDEX idx_feedback_events_routine_id ON feedback_events(routine_id);
CREATE INDEX idx_feedback_events_tau_neg ON feedback_events(tau_neg);

-- 트리거 함수: 댓글 감정 분석
CREATE OR REPLACE FUNCTION analyze_comment_sentiment()
RETURNS TRIGGER AS $$
BEGIN
  -- 간단한 감정 분석 (실제로는 BERT API 호출)
  NEW.sentiment := CASE 
    WHEN NEW.body ~* '(좋|훌륭|완벽|최고|감사|도움)' THEN 0.8
    WHEN NEW.body ~* '(나쁘|별로|실망|문제|오류|힘들)' THEN -0.6
    ELSE 0.0
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_analyze_sentiment 
  BEFORE INSERT OR UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION analyze_comment_sentiment();

-- 트리거 함수: 피드백 벡터 업데이트
CREATE OR REPLACE FUNCTION update_feedback_vector()
RETURNS TRIGGER AS $$
DECLARE
  routine_record RECORD;
  neg_ratio REAL;
  feedback_vec REAL[];
BEGIN
  -- 루틴별 부정 피드백 비율 계산
  SELECT 
    r.id,
    COALESCE(AVG(CASE WHEN c.sentiment < -0.3 THEN 1.0 ELSE 0.0 END), 0) as negative_ratio
  INTO routine_record
  FROM routines r
  LEFT JOIN posts p ON p.routine_id = r.id
  LEFT JOIN comments c ON c.post_id = p.id
  WHERE r.id = (SELECT routine_id FROM posts WHERE id = NEW.post_id)
  GROUP BY r.id;
  
  neg_ratio := COALESCE(routine_record.negative_ratio, 0);
  
  -- 128차원 피드백 벡터 생성 (실제로는 더 복잡한 계산)
  feedback_vec := ARRAY_FILL(neg_ratio, ARRAY[128]);
  
  -- τ_neg가 임계값 범위에 있으면 피드백 이벤트 생성
  IF neg_ratio >= 0.10 AND neg_ratio <= 0.30 THEN
    INSERT INTO feedback_events (
      routine_id, 
      post_id, 
      tau_neg, 
      feedback_vector,
      metadata
    ) VALUES (
      (SELECT routine_id FROM posts WHERE id = NEW.post_id),
      NEW.post_id,
      neg_ratio,
      feedback_vec,
      json_build_object(
        'trigger_reason', 'negative_feedback_threshold',
        'comment_count', (SELECT COUNT(*) FROM comments WHERE post_id = NEW.post_id),
        'avg_sentiment', (SELECT AVG(sentiment) FROM comments WHERE post_id = NEW.post_id)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feedback_vector
  AFTER INSERT OR UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_feedback_vector();