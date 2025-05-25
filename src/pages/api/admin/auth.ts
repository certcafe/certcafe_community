import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@certcafe.com',
  // 실제 배포시에는 해시된 비밀번호 사용
  passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10)
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // 이메일 확인
  if (email !== ADMIN_CREDENTIALS.email) {
    return res.status(401).json({ error: '잘못된 인증 정보입니다' });
  }

  // 비밀번호 확인
  const isValidPassword = bcrypt.compareSync(password, ADMIN_CREDENTIALS.passwordHash);
  if (!isValidPassword) {
    return res.status(401).json({ error: '잘못된 인증 정보입니다' });
  }

  // JWT 토큰 생성
  const jwtSecret = process.env.JWT_SECRET || 'default_secret';
  const token = jwt.sign(
    { 
      email: email,
      role: 'admin',
      iat: Math.floor(Date.now() / 1000)
    },
    jwtSecret,
    { expiresIn: '24h' }
  );

  // 로그 기록 (보안 감사용)
  console.log(`✅ 관리자 로그인 성공: ${email} at ${new Date().toISOString()}`);

  res.status(200).json({
    success: true,
    token,
    expiresIn: 86400 // 24시간 (초)
  });
}