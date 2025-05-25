import { NextApiRequest, NextApiResponse } from 'next';
import { addProblemsToDatabase } from '../../../lib/problemDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subject, problem } = req.body;
    
    if (!subject || !problem) {
      return res.status(400).json({ error: '과목과 문제 데이터가 필요합니다' });
    }

    const addedCount = addProblemsToDatabase(subject, [problem]);
    
    if (addedCount > 0) {
      res.status(200).json({ 
        success: true, 
        message: '문제가 추가되었습니다',
        count: addedCount
      });
    } else {
      res.status(400).json({ error: '문제 추가에 실패했습니다' });
    }
  } catch (error) {
    console.error('문제 추가 API 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
}
