import { NextApiRequest, NextApiResponse } from 'next';
import { importProblems } from '../../../lib/problemDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { jsonData } = req.body;
    
    if (!jsonData) {
      return res.status(400).json({ error: 'JSON 데이터가 필요합니다' });
    }

    // JSON 데이터를 파싱해서 각 과목별로 추가
    const problemsData = JSON.parse(jsonData);
    let totalAdded = 0;

    for (const [subject, problems] of Object.entries(problemsData)) {
      if (Array.isArray(problems)) {
        const addedCount = await importProblems(subject, JSON.stringify(problems));
        totalAdded += addedCount;
      }
    }
    
    res.status(200).json({ 
      success: true, 
      message: `총 ${totalAdded}개 문제가 추가되었습니다`,
      count: totalAdded
    });
  } catch (error) {
    console.error('JSON 가져오기 API 오류:', error);
    res.status(500).json({ error: 'JSON 파싱 또는 서버 오류가 발생했습니다' });
  }
}