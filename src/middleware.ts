import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🔐 관리자 경로 보호
  if (pathname.startsWith('/admin')) {
    
    // 1️⃣ IP 제한 (선택사항)
    const allowedIPs = process.env.ALLOWED_ADMIN_IPS?.split(',') || [];
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      console.log(`❌ 차단된 IP에서 관리자 접근 시도: ${clientIP}`);
      return new NextResponse('Access Denied', { status: 403 });
    }

    // 2️⃣ 세션 토큰 검증
    const authToken = request.cookies.get('admin_token')?.value;
    
    if (!authToken) {
      // 인증 페이지로 리디렉션
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const jwtSecret = process.env.JWT_SECRET || 'default_secret';
      jwt.verify(authToken, jwtSecret);
    } catch (error) {
      console.log('❌ 유효하지 않은 관리자 토큰');
      // 쿠키 삭제하고 로그인 페이지로
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }

  // 3️⃣ API 엔드포인트 보호
  if (pathname.startsWith('/api/admin')) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const jwtSecret = process.env.JWT_SECRET || 'default_secret';
      jwt.verify(token, jwtSecret);
    } catch (error) {
      return new NextResponse(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};
