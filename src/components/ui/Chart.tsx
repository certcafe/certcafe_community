'use client';

import { useEffect, useRef } from 'react';

interface ChartProps {
  data: Array<{ x: string | number; y: number; label?: string }>;
  type?: 'line' | 'bar' | 'area';
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export default function Chart({ 
  data, 
  type = 'line', 
  width = 400, 
  height = 200,
  color = '#3b82f6',
  className 
}: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas 설정
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    // 데이터 범위 계산
    const maxY = Math.max(...data.map(d => d.y), 1);
    const minY = Math.min(...data.map(d => d.y), 0);
    const range = maxY - minY || 1;

    // 여백 설정
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // 그리드 그리기
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // 수평 그리드
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * chartHeight) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // 수직 그리드
    for (let i = 0; i <= data.length - 1; i++) {
      const x = padding + (i * chartWidth) / (data.length - 1);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // 데이터 포인트 계산
    const points = data.map((d, index) => ({
      x: padding + (index * chartWidth) / (data.length - 1),
      y: height - padding - ((d.y - minY) / range) * chartHeight,
      value: d.y
    }));

    if (type === 'line' || type === 'area') {
      // Area fill (if area type)
      if (type === 'area') {
        ctx.fillStyle = color + '20'; // 20% opacity
        ctx.beginPath();
        ctx.moveTo(points[0].x, height - padding);
        points.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.lineTo(points[points.length - 1].x, height - padding);
        ctx.closePath();
        ctx.fill();
      }

      // Line
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();

      // Points
      ctx.fillStyle = color;
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    } else if (type === 'bar') {
      // Bars
      ctx.fillStyle = color;
      const barWidth = chartWidth / data.length * 0.6;
      
      points.forEach(point => {
        const barHeight = (height - padding) - point.y;
        ctx.fillRect(
          point.x - barWidth / 2,
          point.y,
          barWidth,
          barHeight
        );
      });
    }

    // Labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    // Y축 레이블
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * chartHeight) / 5;
      const value = maxY - (i * range) / 5;
      ctx.textAlign = 'right';
      ctx.fillText(value.toFixed(1), padding - 10, y + 4);
    }

    // X축 레이블
    ctx.textAlign = 'center';
    data.forEach((d, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1);
      ctx.fillText(
        typeof d.x === 'string' ? d.x : d.x.toString(),
        x,
        height - padding + 20
      );
    });

  }, [data, type, width, height, color]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}