import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { DefaultSeo } from 'next-seo' // 👈 이것만 추가

// 👈 SEO 설정 추가
const defaultSEO = {
  titleTemplate: '%s | CertCafe',
  defaultTitle: 'CertCafe - AI 기반 자격증 학습 플랫폼',
  description: '정보처리기사 CBT 모의고사와 감정 기반 맞춤 학습을 제공하는 AI 플랫폼입니다.',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://certcafe.com',
    siteName: 'CertCafe',
  },
}

export default function App({ Component, pageProps }: AppProps) {
  // QueryClient를 useState로 생성 (리렌더링 시 새로 생성 방지)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // 기본 쿼리 옵션
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5분
      },
      mutations: {
        // 기본 뮤테이션 옵션
        retry: 1,
      },
    },
  }))

  return (
    <>
      <DefaultSeo {...defaultSEO} /> {/* 👈 이것만 추가 */}
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </>
  )
}