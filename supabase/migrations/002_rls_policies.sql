export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      routines: {
        Row: {
          id: string
          user_id: string
          certification_id: string | null
          title: string
          description: string | null
          emotion_score: number
          error_rate: number
          latency_count: number
          stress_score: number
          schedule_data: any
          is_active: boolean
          ics_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          certification_id?: string | null
          title: string
          description?: string | null
          emotion_score?: number
          error_rate?: number
          latency_count?: number
          schedule_data?: any
          is_active?: boolean
          ics_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          certification_id?: string | null
          title?: string
          description?: string | null
          emotion_score?: number
          error_rate?: number
          latency_count?: number
          schedule_data?: any
          is_active?: boolean
          ics_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cbt_sessions: {
        Row: {
          id: string
          user_id: string
          routine_id: string | null
          questions_data: any
          answers_data: any
          fact_score: number
          emotion_drift: number
          regeneration_count: number
          cache_hit_rate: number
          response_time: number
          status: string
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          routine_id?: string | null
          questions_data?: any
          answers_data?: any
          fact_score?: number
          emotion_drift?: number
          regeneration_count?: number
          cache_hit_rate?: number
          response_time?: number
          status?: string
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          routine_id?: string | null
          questions_data?: any
          answers_data?: any
          fact_score?: number
          emotion_drift?: number
          regeneration_count?: number
          cache_hit_rate?: number
          response_time?: number
          status?: string
          started_at?: string
          completed_at?: string | null
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          certification_id: string | null
          title: string
          content: string | null
          category: string
          feedback_vector: number[] | null
          negative_ratio: number
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          certification_id?: string | null
          title: string
          content?: string | null
          category?: string
          feedback_vector?: number[] | null
          negative_ratio?: number
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          certification_id?: string | null
          title?: string
          content?: string | null
          category?: string
          feedback_vector?: number[] | null
          negative_ratio?: number
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          sentiment_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          sentiment_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          sentiment_score?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}