import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSignUp } from '@/hooks/useAuth';
import { Mail, Lock, User, GraduationCap, Eye, EyeOff } from 'lucide-react';

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    targetExam: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const router = useRouter();
  const signUpMutation = useSignUp();

  const examOptions = [
    '컴퓨터활용능력 1급',
    '컴퓨터활용능력 2급',
    '정보처리기사',
    '정보처리산업기사',
    '사회복지사 1급',
    '산업안전기사',
    '전산세무회계',
    '기타',
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }
    
    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';
    } else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '비밀번호는 영문과 숫자를 포함해야 합니다';
    }
    
    // 비밀번호 확인
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }
    
    // 이름 검증
    if (!formData.name) {
      newErrors.name = '이름을 입력해주세요';
    } else if (formData.name.length < 2) {
      newErrors.name = '이름은 2자 이상이어야 합니다';
    }
    
    // 목표 자격증 검증
    if (!formData.targetExam) {
      newErrors.targetExam = '목표 자격증을 선택해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await signUpMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        targetExam: formData.targetExam,
      });
      
      // 성공 시 로그인 페이지로 이동
      router.push('/login?message=회원가입이 완료되었습니다. 로그인해주세요.');
    } catch (error: any) {
      setErrors({ 
        email: error.message || '회원가입에 실패했습니다' 
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 메시지 클리어
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">CertCafe 회원가입</h1>
          <p className="text-gray-600 mt-2">AI와 함께하는 스마트 자격증 학습</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="이메일"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your@email.com"
            icon={<Mail className="h-4 w-4 text-gray-400" />}
            error={errors.email}
          />

          <Input
            label="이름"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="홍길동"
            icon={<User className="h-4 w-4 text-gray-400" />}
            error={errors.name}
          />

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              목표 자격증
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <select
                value={formData.targetExam}
                onChange={(e) => handleInputChange('targetExam', e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <option value="">자격증을 선택하세요</option>
                {examOptions.map(exam => (
                  <option key={exam} value={exam}>{exam}</option>
                ))}
              </select>
            </div>
            {errors.targetExam && (
              <p className="text-sm text-red-600 mt-1">{errors.targetExam}</p>
            )}
          </div>

          <div className="relative">
            <Input
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="영문, 숫자 포함 8자 이상"
              icon={<Lock className="h-4 w-4 text-gray-400" />}
              error={errors.password}
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Input
            label="비밀번호 확인"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            icon={<Lock className="h-4 w-4 text-gray-400" />}
            error={errors.confirmPassword}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={signUpMutation.isPending}
          >
            회원가입
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            이미 계정이 있으신가요?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
