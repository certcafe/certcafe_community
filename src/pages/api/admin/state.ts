import { NextApiRequest, NextApiResponse } from 'next';
import { getProblemStats, getAvailableSubjects } from '../../../lib/problemDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const subjects = getAvailableSubjects();
    const allStats: Record<string, any> = {};
    
    subjects.forEach(subject => {
      allStats[subject] = getProblemStats(subject);
    });
    
    res.status(200).json({
      success: true,
      subjects,
      stats: allStats
    });
  } catch (error) {
    console.error('통계 조회 API 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
}