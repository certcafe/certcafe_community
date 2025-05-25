'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Camera, CameraOff, RotateCcw } from 'lucide-react';
import { useAnalyzeEmotion } from '@/hooks/useEmotion';

interface WebcamCaptureProps {
  onAnalysisComplete?: (result: any) => void;
  className?: string;
}

export default function WebcamCapture({ onAnalysisComplete, className }: WebcamCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const analyzeEmotion = useAnalyzeEmotion();

  const startStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('웹캠 접근 실패:', error);
      alert('웹캠에 접근할 수 없습니다. 브라우저 권한을 확인해주세요.');
    }
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !isStreaming) return;

    setIsAnalyzing(true);

    try {
      // 캔버스에 현재 프레임 캡처
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      // 이미지 데이터를 base64로 변환
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // 감정 분석 API 호출
      await analyzeEmotion.mutateAsync({
        inputType: 'webcam',
        data: {
          image: imageData,
          timestamp: new Date().toISOString()
        }
      });

      onAnalysisComplete?.(analyzeEmotion.data);
      
    } catch (error) {
      console.error('감정 분석 실패:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isStreaming, analyzeEmotion, onAnalysisComplete]);

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">실시간 감정 분석</h3>
          <div className="flex space-x-2">
            <Button
              variant={isStreaming ? "danger" : "primary"}
              size="sm"
              onClick={isStreaming ? stopStream : startStream}
              className="flex items-center space-x-2"
            >
              {isStreaming ? (
                <>
                  <CameraOff className="h-4 w-4" />
                  <span>카메라 끄기</span>
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  <span>카메라 켜기</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Video Stream */}
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 bg-gray-100 rounded-lg object-cover"
            style={{ transform: 'scaleX(-1)' }} // 거울 효과
          />
          
          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center text-gray-500">
                <Camera className="h-12 w-12 mx-auto mb-2" />
                <p>카메라를 켜서 감정 분석을 시작하세요</p>
              </div>
            </div>
          )}

          {/* Overlay for analysis */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <div className="bg-white/90 rounded-lg p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-700">감정 분석 중...</p>
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-3">
          <Button
            variant="primary"
            onClick={captureAndAnalyze}
            disabled={!isStreaming || isAnalyzing}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>지금 분석하기</span>
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-blue-900 mb-1">사용 방법</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 카메라를 켜고 화면 중앙에 얼굴이 나오도록 조정하세요</li>
            <li>• "지금 분석하기" 버튼을 눌러 현재 감정 상태를 분석합니다</li>
            <li>• 분석 결과는 자동으로 학습 루틴에 반영됩니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}