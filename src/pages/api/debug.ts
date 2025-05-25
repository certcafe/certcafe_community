// src/pages/api/debug.ts
import type { NextApiRequest, NextApiResponse } from 'next'

type DebugResponse = {
  status: string;
  message: string;
  environment?: any;
  timestamp?: string;
  receivedBody?: any;
  details?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DebugResponse>
) {
  if (req.method === 'GET') {
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      openaiKey: !!process.env.OPENAI_API_KEY,
      nodeEnv: process.env.NODE_ENV
    }

    return res.status(200).json({
      status: 'success',
      message: 'Pages Router API 정상 작동',
      environment: envCheck,
      timestamp: new Date().toISOString()
    })
  }

  if (req.method === 'POST') {
    try {
      // Supabase 환경변수 확인
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({
          status: 'env_error',
          message: 'Supabase 환경변수가 설정되지 않았습니다'
        })
      }

      // OpenAI API 키 확인
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({
          status: 'openai_env_error',
          message: 'OpenAI API 키가 설정되지 않았습니다'
        })
      }

      // OpenAI API 연결 테스트
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        })

        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.json()
          return res.status(500).json({
            status: 'openai_error',
            message: `OpenAI API 오류: ${openaiResponse.status}`,
            details: errorData
          })
        }

        return res.status(200).json({
          status: 'all_success',
          message: '🎉 모든 환경 설정이 정상입니다!',
          receivedBody: req.body,
          timestamp: new Date().toISOString()
        })

      } catch (fetchError: any) {
        return res.status(500).json({
          status: 'network_error',
          message: 'OpenAI API 연결 실패',
          details: fetchError.message
        })
      }

    } catch (error: any) {
      return res.status(500).json({
        status: 'general_error',
        message: error.message
      })
    }
  }

  return res.status(405).json({
    status: 'method_not_allowed',
    message: 'GET 또는 POST 메서드만 지원합니다'
  })
}