'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import EmotionIndicator from './EmotionIndicator';
import { useCreateRoutine } from '@/hooks/useRoutines';
import { useAuthStore } from '@/store';
import { Clock, Calendar, BookOpen, Target, Zap, TrendingUp } from 'lucide-react';

export default function RoutineGenerator() {
  const { user } = useAuthStore();
  const createRoutineMutation = useCreateRoutine();
  
  const [formData, setFormData] = useState({
    examType: user?.target_exam || '',
    examDate: '',
    dailyHours: 2,
    weeklyDays: 5,
    preferredTime: 'morning',
    subjects: [] as string[],
    studyStyle: 'balanced',
    difficulty: 'medium',
  });

  // 🔥 인기 자격증 20개 (순위별)
  const examOptions = [
    // IT/컴퓨터 (4개)
    { value: '정보처리기사', label: '🔥 정보처리기사 (인기 11위)', category: 'IT' },
    { value: '컴퓨터활용능력 1급', label: '💻 컴퓨터활용능력 1급 (인기 2위)', category: 'IT' },
    { value: '컴퓨터활용능력 2급', label: '💻 컴퓨터활용능력 2급 (인기 15위)', category: 'IT' },
    { value: '워드프로세서', label: '📝 워드프로세서 (인기 14위)', category: 'IT' },
    
    // 건설/안전 (4개)
    { value: '산업안전기사', label: '⚡ 산업안전기사 (인기 9위)', category: '건설/안전' },
    { value: '산업안전산업기사', label: '⚡ 산업안전산업기사 (인기 12위)', category: '건설/안전' },
    { value: '건설안전기사', label: '🏗️ 건설안전기사 (인기 18위)', category: '건설/안전' },
    { value: '위험물산업기사', label: '☢️ 위험물산업기사 (인기 19위)', category: '건설/안전' },
    
    // 전기/전자 (3개)
    { value: '전기기사', label: '⚡ 전기기사 (인기 10위)', category: '전기/전자' },
    { value: '전기산업기사', label: '⚡ 전기산업기사 (인기 13위)', category: '전기/전자' },
    { value: '전기기능사', label: '🔌 전기기능사 (인기 6위)', category: '전기/전자' },
    
    // 조리/식품 (4개)
    { value: '한식조리기능사', label: '🍲 한식조리기능사 (인기 5위)', category: '조리/식품' },
    { value: '양식조리기능사', label: '🍝 양식조리기능사 (인기 20위)', category: '조리/식품' },
    { value: '제과기능사', label: '🧁 제과기능사 (인기 7위)', category: '조리/식품' },
    { value: '제빵기능사', label: '🍞 제빵기능사 (인기 8위)', category: '조리/식품' },
    
    // 기타 (5개)
    { value: '한국사능력검정시험', label: '📚 한국사능력검정시험 (인기 1위)', category: '교양' },
    { value: '공인중개사', label: '🏠 공인중개사 (인기 3위)', category: '부동산' },
    { value: '지게차운전기능사', label: '🚛 지게차운전기능사 (인기 4위)', category: '운전/기계' },
    { value: '미용사(일반)', label: '💇 미용사(일반) (인기 16위)', category: '서비스' },
    { value: '사회복지사 1급', label: '🤝 사회복지사 1급 (인기 17위)', category: '사회복지' },
  ];

  const timeOptions = [
    { value: 'morning', label: '🌅 오전 (06:00-12:00)' },
    { value: 'afternoon', label: '☀️ 오후 (12:00-18:00)' },
    { value: 'evening', label: '🌆 저녁 (18:00-24:00)' },
    { value: 'flexible', label: '🔄 유연하게' },
  ];

  const styleOptions = [
    { value: 'intensive', label: '🔥 집중형 (긴 세션, 깊이 학습)' },
    { value: 'balanced', label: '⚖️ 균형형 (적당한 세션)' },
    { value: 'distributed', label: '📊 분산형 (짧은 세션, 자주)' },
  ];

  const difficultyOptions = [
    { value: 'easy', label: '🟢 쉬움 (기초 개념 중심)' },
    { value: 'medium', label: '🟡 보통 (균형잡힌 학습)' },
    { value: 'hard', label: '🔴 어려움 (심화 이론 중심)' },
  ];

  // 자격증별 과목 매핑 (확장됨)
  const getSubjectsByExam = (examType: string) => {
    const subjectMap: Record<string, string[]> = {
      // IT/컴퓨터
      '정보처리기사': ['소프트웨어설계', '소프트웨어개발', '데이터베이스구축', '프로그래밍언어활용', '정보시스템구축관리'],
      '컴퓨터활용능력 1급': ['컴퓨터일반', '스프레드시트', '데이터베이스'],
      '컴퓨터활용능력 2급': ['컴퓨터일반', '스프레드시트'],
      '워드프로세서': ['워드프로세싱 용어 및 기능', '편집 용어 및 기능', '컴퓨터 및 정보활용'],
      
      // 건설/안전
      '산업안전기사': ['산업안전관리론', '산업위생관리론', '인간공학및시스템안전공학', '기계위험방지기술', '전기위험방지기술', '화학설비위험방지기술'],
      '산업안전산업기사': ['산업안전관리론', '산업위생관리론', '인간공학및시스템안전공학', '기계위험방지기술'],
      '건설안전기사': ['건설안전관리론', '건설시공학', '건설구조학', '건설재료학'],
      '위험물산업기사': ['위험물질론', '제조소등의 구조 및 설비', '위험물 관계법령', '일반화학'],
      
      // 전기/전자  
      '전기기사': ['전기자기학', '전력공학', '전기기기', '회로이론 및 제어공학', '전기설비기술기준 및 판단기준'],
      '전기산업기사': ['전기자기학 및 회로이론', '전력공학', '전기기기', '전기설비'],
      '전기기능사': ['전기 이론', '전기 기기', '전기 설비', '배전공사'],
      
      // 조리/식품
      '한식조리기능사': ['한식 재료관리', '한식 조리', '위생관리', '한식상차림'],
      '양식조리기능사': ['양식 재료관리', '양식 조리', '위생관리', '양식상차림'],
      '제과기능사': ['제과 재료', '제과 이론', '제과 실기', '위생관리'],
      '제빵기능사': ['제빵 재료', '제빵 이론', '제빵 실기', '위생관리'],
      
      // 기타
      '한국사능력검정시험': ['선사시대~통일신라', '고려시대', '조선시대', '일제강점기', '현대사'],
      '공인중개사': ['부동산학개론', '민법 및 민사특별법', '부동산공법', '부동산중개업법', '부동산공시법'],
      '지게차운전기능사': ['지게차 구조 원리', '운전 및 작업방법', '안전관리', '관계법규'],
      '미용사(일반)': ['공중보건관리', '미용기술 이론', '화장품학', '미용실습'],
      '사회복지사 1급': ['사회복지기초', '사회복지실천', '사회복지정책과제도', '사회복지조사론'],
    };
    
    return subjectMap[examType] || [];
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleGenerate = async () => {
    if (!formData.examType || !formData.examDate || formData.subjects.length === 0) {
      alert('모든 필수 정보를 입력해주세요.');
      return;
    }

    try {
      await createRoutineMutation.mutateAsync({
        examType: formData.examType,
        availableHours: formData.dailyHours * formData.weeklyDays,
        subjects: formData.subjects,
        examDate: formData.examDate,
        preferredTime: formData.preferredTime,
        studyStyle: formData.studyStyle,
        difficulty: formData.difficulty,
      });
      
      alert('🎉 맞춤 루틴이 성공적으로 생성되었습니다!');
    } catch (error) {
      console.error('루틴 생성 실패:', error);
      alert('루틴 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const availableSubjects = getSubjectsByExam(formData.examType);
  const totalWeeklyHours = formData.dailyHours * formData.weeklyDays;
  const studyDaysUntilExam = formData.examDate 
    ? Math.max(0, Math.ceil((new Date(formData.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // 선택된 자격증의 카테고리 찾기
  const selectedExamCategory = examOptions.find(exam => exam.value === formData.examType)?.category;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🤖 AI 맞춤 학습 루틴 생성기
        </h1>
        <p className="text-gray-600 text-lg">
          감정 상태 + 학습 패턴 + Claude AI = 완벽한 개인화 학습 계획
        </p>
        <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 rounded-full">
          <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
          <span className="text-sm text-blue-800 font-medium">인기 자격증 20개 추가 지원! 🔥</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 메인 설정 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                🎯 목표 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Select
                  label="목표 자격증 (인기 순위별)"
                  value={formData.examType}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    examType: e.target.value,
                    subjects: [] // 자격증 변경 시 과목 초기화
                  }))}
                  options={examOptions}
                />
                {selectedExamCategory && (
                  <div className="mt-2 text-sm text-gray-600">
                    📂 카테고리: <span className="font-medium text-blue-600">{selectedExamCategory}</span>
                  </div>
                )}
              </div>

              <Input
                label="🗓️ 시험 날짜"
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData(prev => ({ ...prev, examDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                icon={<Calendar className="w-4 h-4 text-gray-400" />}
              />

              {studyDaysUntilExam > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        ⏰ 시험까지 <span className="text-2xl font-bold text-blue-600">{studyDaysUntilExam}일</span> 남음
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {studyDaysUntilExam < 30 ? '⚡ 집중 학습 모드 권장' : 
                         studyDaysUntilExam < 90 ? '📚 꾸준한 학습 진행' : '🌱 여유있는 계획 수립'}
                      </p>
                    </div>
                    <div className="text-4xl">
                      {studyDaysUntilExam < 30 ? '🔥' : studyDaysUntilExam < 90 ? '💪' : '🎯'}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-600" />
                ⏰ 학습 시간 계획
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Slider
                label="일일 학습 시간"
                value={formData.dailyHours}
                onChange={(value) => setFormData(prev => ({ ...prev, dailyHours: value }))}
                min={1}
                max={8}
                step={0.5}
                unit="시간"
              />

              <Slider
                label="주간 학습 일수"
                value={formData.weeklyDays}
                onChange={(value) => setFormData(prev => ({ ...prev, weeklyDays: value }))}
                min={3}
                max={7}
                step={1}
                unit="일"
              />

              <Select
                label="🕐 선호 시간대"
                value={formData.preferredTime}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
                options={timeOptions}
              />

              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{totalWeeklyHours}h</div>
                    <div className="text-sm text-green-700">주간 총 시간</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {studyDaysUntilExam > 0 ? Math.round(totalWeeklyHours * (studyDaysUntilExam / 7)) : 0}h
                    </div>
                    <div className="text-sm text-blue-700">총 예상 시간</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                📚 학습 과목 선택
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableSubjects.length > 0 ? (
                <div>
                  <div className="mb-4 text-sm text-gray-600">
                    📋 <strong>{formData.examType}</strong>의 주요 과목들 ({availableSubjects.length}개)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableSubjects.map((subject, index) => (
                      <button
                        key={subject}
                        onClick={() => handleSubjectToggle(subject)}
                        className={`p-4 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.subjects.includes(subject)
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{subject}</span>
                          <span className="text-xs text-gray-500">#{index + 1}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, subjects: availableSubjects }))}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      ✅ 모든 과목 선택
                    </button>
                    <span className="mx-2 text-gray-300">|</span>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, subjects: [] }))}
                      className="text-sm text-red-600 hover:text-red-800 underline"
                    >
                      ❌ 모두 해제
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-gray-500 mb-2">자격증을 먼저 선택해주세요</p>
                  <p className="text-sm text-gray-400">20개 인기 자격증에서 선택 가능합니다</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-orange-600" />
                ⚡ 학습 스타일 커스터마이징
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="🎯 학습 방식"
                value={formData.studyStyle}
                onChange={(e) => setFormData(prev => ({ ...prev, studyStyle: e.target.value }))}
                options={styleOptions}
              />

              <Select
                label="📊 난이도 수준"
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                options={difficultyOptions}
              />
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  💡 <strong>AI 팁:</strong> 감정 상태가 낮을 때는 '쉬움' 모드로 자신감을 회복하세요!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          <EmotionIndicator />

          <Card>
            <CardHeader>
              <CardTitle>🔍 생성 미리보기</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">자격증:</span>
                  <span className="font-medium text-right text-xs">
                    {formData.examType ? `${formData.examType}` : '미선택'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">선택 과목:</span>
                  <span className="font-medium">{formData.subjects.length}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">주간 시간:</span>
                  <span className="font-medium text-green-600">{totalWeeklyHours}시간</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">남은 기간:</span>
                  <span className="font-medium text-blue-600">
                    {studyDaysUntilExam > 0 ? `${studyDaysUntilExam}일` : '미설정'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AI 엔진:</span>
                  <span className="font-medium text-purple-600">Claude 🤖</span>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                variant="primary"
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                loading={createRoutineMutation.isPending}
                disabled={!formData.examType || !formData.examDate || formData.subjects.length === 0}
              >
                {createRoutineMutation.isPending ? '🔄 AI 생성 중...' : '🚀 Claude AI 루틴 생성'}
              </Button>
              
              {(!formData.examType || !formData.examDate || formData.subjects.length === 0) && (
                <p className="text-xs text-red-500 text-center">
                  ⚠️ 자격증, 시험날짜, 과목을 모두 선택해주세요
                </p>
              )}
            </CardContent>
          </Card>

          <Card variant="outline" className="bg-gradient-to-br from-purple-50 to-blue-50">
            <CardContent className="text-center">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-bold text-gray-900 mb-2">Claude AI 엔진</h3>
              <p className="text-sm text-gray-600 mb-3">
                감정 상태, 학습 패턴, 개인 성향을 종합 분석하여 최적의 맞춤 루틴을 생성합니다.
              </p>
              <div className="text-xs text-blue-600 bg-blue-100 rounded px-2 py-1">
                💰 OpenAI 대비 80% 비용 절약!
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}