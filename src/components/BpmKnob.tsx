import { useState, useRef, useCallback, useEffect } from 'react';

interface BpmKnobProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const MIN_BPM = 40;
const MAX_BPM = 200;
const ROTATION_RANGE = 270;
const START_ANGLE = -135;

export function BpmKnob({ value, onChange, min = MIN_BPM, max = MAX_BPM }: BpmKnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const [showError, setShowError] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);
  const startAngleRef = useRef(0);
  const startValueRef = useRef(0);

  const percentage = ((value - min) / (max - min)) * 100;
  const rotation = START_ANGLE + (percentage / 100) * ROTATION_RANGE;

  const getAngle = useCallback((clientX: number, clientY: number) => {
    if (!knobRef.current) return 0;
    const rect = knobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  }, []);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    startAngleRef.current = getAngle(clientX, clientY);
    startValueRef.current = value;
  }, [value, getAngle]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const currentAngle = getAngle(clientX, clientY);
    let deltaAngle = currentAngle - startAngleRef.current;
    
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;
    
    const valueDelta = (deltaAngle / ROTATION_RANGE) * (max - min);
    const newValue = Math.round(startValueRef.current + valueDelta);
    const clampedValue = Math.max(min, Math.min(max, newValue));
    
    onChange(clampedValue);
  }, [isDragging, getAngle, min, max, onChange]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleMouseUp = () => handleEnd();
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowError(false);
  };

  const handleInputBlur = () => {
    const newValue = parseInt(inputValue, 10);
    if (isNaN(newValue) || newValue < min || newValue > max) {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      setInputValue(value.toString());
    } else {
      onChange(newValue);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setInputValue(value.toString());
    }
  };

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-4 z-10 relative">
      <div
        ref={knobRef}
        className={`relative w-32 h-32 rounded-full cursor-pointer select-none transition-shadow z-20 ${
          isDragging ? 'shadow-glow' : 'hover:shadow-elevated'
        }`}
        style={{
          background: 'linear-gradient(145deg, #ffffff, #e6e6e6)',
          boxShadow: '8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff',
        }}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            handleStart(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
      >
        <svg
          className="absolute inset-2 w-28 h-28"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 283} 283`}
            transform="rotate(-135 50 50)"
            style={{
              stroke: '#8b5cf6',
              transition: isDragging ? 'none' : 'stroke-dasharray 0.1s ease-out',
            }}
          />
        </svg>
        
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary"
          style={{
            transform: `translateX(-50%) rotate(${rotation}deg) translateY(-40px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            min={min}
            max={max}
            className={`w-16 text-center text-3xl font-bold font-mono bg-transparent border-none outline-none ${
              showError ? 'text-red-500' : 'text-primary'
            }`}
          />
          <span className="text-xs text-text-tertiary mt-1">BPM</span>
        </div>
      </div>

      {showError && (
        <div className="text-sm text-red-500 animate-pulse">
          请输入 {min}-{max} 范围内的有效数值
        </div>
      )}

      <div className="flex items-center gap-4 z-10 relative">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center hover:bg-primary-subtle transition-all z-10 relative"
        >
          <span className="text-xl font-bold text-text-secondary">-</span>
        </button>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center hover:bg-primary-subtle transition-all z-10 relative"
        >
          <span className="text-xl font-bold text-text-secondary">+</span>
        </button>
      </div>

      <div className="flex items-center justify-between w-full max-w-[200px] text-xs text-text-tertiary">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}