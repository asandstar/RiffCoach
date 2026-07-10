import { useState, useEffect, useRef, useCallback } from 'react';
import { timeSignatureConfigs, getToneFrequency, getToneVolume, type TimerMode, type TimeSignature, type MetronomeTone, type PracticeTemplate, defaultTemplates } from '@/utils/practice';

interface UsePracticeOptions {
  initialBpm?: number;
  initialTimeSignature?: TimeSignature;
  initialTimerMode?: TimerMode;
  initialTargetTime?: number;
}

export function usePractice(options: UsePracticeOptions = {}) {
  const {
    initialBpm = 70,
    initialTimeSignature = '4/4',
    initialTimerMode = 'count-up',
    initialTargetTime = 30 * 60,
  } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [bpm, setBpm] = useState(initialBpm);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerMode>(initialTimerMode);
  const [targetTime, setTargetTime] = useState(initialTargetTime);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>(initialTimeSignature);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [metronomeTone, setMetronomeTone] = useState<MetronomeTone>('electronic');
  const [templates, setTemplates] = useState<PracticeTemplate[]>(() => {
    const saved = localStorage.getItem('practiceTemplates');
    return saved ? JSON.parse(saved) : defaultTemplates;
  });
  const [showTemplates, setShowTemplates] = useState(false);

  const timerRef = useRef<number | null>(null);
  const metronomeRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const bpmRef = useRef(bpm);
  const beatCounterRef = useRef(0);
  const timeSignatureRef = useRef(timeSignature);
  const metronomeToneRef = useRef(metronomeTone);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    timeSignatureRef.current = timeSignature;
  }, [timeSignature]);

  useEffect(() => {
    metronomeToneRef.current = metronomeTone;
  }, [metronomeTone]);

  useEffect(() => {
    localStorage.setItem('practiceTemplates', JSON.stringify(templates));
  }, [templates]);

  const displayTime = timerMode === 'count-up'
    ? timeElapsed
    : Math.max(0, targetTime - timeElapsed);

  const progressRatio = timerMode === 'count-up'
    ? Math.min(timeElapsed, 3600) / 3600
    : Math.min(timeElapsed, targetTime) / targetTime;

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopMetronome = useCallback(() => {
    if (metronomeRef.current) {
      clearTimeout(metronomeRef.current);
      metronomeRef.current = null;
    }
    setIsMetronomeOn(false);
    beatCounterRef.current = 0;
    setCurrentBeat(0);
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (timerMode === 'count-down' && timeElapsed >= targetTime && isRunning) {
      setIsRunning(false);
    }
  }, [timeElapsed, targetTime, timerMode, isRunning]);

  useEffect(() => {
    if (isMetronomeOn) {
      const playClick = () => {
        try {
          const ctx = audioContextRef.current;
          if (!ctx) return;

          if (ctx.state === 'suspended') {
            ctx.resume().catch((err) => {
              console.warn('AudioContext resume failed:', err);
            });
          }

          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);

          const config = timeSignatureConfigs[timeSignatureRef.current];
          const beatIndex = beatCounterRef.current % config.beats;
          const isDownbeat = config.downbeats.includes(beatIndex);
          const isSubDownbeat = timeSignatureRef.current === '6/8' && beatIndex === 3;

          const tone = metronomeToneRef.current;
          const frequency = getToneFrequency(tone, isDownbeat, isSubDownbeat);
          const volume = getToneVolume(tone, isDownbeat, isSubDownbeat);

          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

          oscillator.frequency.value = frequency;

          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.15);

          beatCounterRef.current++;
          setCurrentBeat(beatIndex);

          const nextInterval = (60 / bpmRef.current) * 1000;
          metronomeRef.current = window.setTimeout(playClick, nextInterval);
        } catch (err) {
          console.warn('Metronome sound error:', err);
        }
      };

      playClick();
    } else {
      if (metronomeRef.current) {
        clearTimeout(metronomeRef.current);
        metronomeRef.current = null;
      }
      beatCounterRef.current = 0;
      setCurrentBeat(0);
    }

    return () => {
      if (metronomeRef.current) {
        clearTimeout(metronomeRef.current);
        metronomeRef.current = null;
      }
    };
  }, [isMetronomeOn]);

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const toggleMetronome = () => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) {
          alert('您的浏览器不支持音频功能，请使用现代浏览器（Chrome、Firefox、Safari等）');
          return;
        }
        audioContextRef.current = new AudioContextClass();
      }

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch((err) => {
          console.warn('AudioContext resume failed:', err);
        });
      }

      setIsMetronomeOn((prev) => !prev);
    } catch (err) {
      console.error('Failed to create AudioContext:', err);
      alert('音频功能初始化失败，请检查浏览器设置或尝试刷新页面');
    }
  };

  const reset = () => {
    stopTimer();
    stopMetronome();
    setTimeElapsed(0);
  };

  const skipBackward = () => {
    setTimeElapsed((prev) => Math.max(0, prev - 60));
  };

  const skipForward = () => {
    setTimeElapsed((prev) => prev + 60);
  };

  const setTimePoint = (minutes: number) => {
    setTimerMode('count-down');
    setTargetTime(minutes * 60);
    if (isRunning) {
      setTimeElapsed(0);
    }
  };

  const switchTimerMode = (mode: TimerMode) => {
    setTimerMode(mode);
    setTimeElapsed(0);
  };

  const changeTimeSignature = (sig: TimeSignature) => {
    setTimeSignature(sig);
    beatCounterRef.current = 0;
    setCurrentBeat(0);
  };

  const saveTemplate = (name: string) => {
    const newTemplate: PracticeTemplate = {
      id: `temp_${Date.now()}`,
      name,
      bpm,
      timeSignature,
      timerMode,
      targetTime,
      metronomeTone,
      createdAt: Date.now(),
    };
    setTemplates((prev) => [newTemplate, ...prev]);
    setShowTemplates(false);
  };

  const loadTemplate = (template: PracticeTemplate) => {
    setBpm(template.bpm);
    setTimeSignature(template.timeSignature);
    setTimerMode(template.timerMode);
    setTargetTime(template.targetTime);
    setMetronomeTone(template.metronomeTone);
    setTimeElapsed(0);
    setShowTemplates(false);
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

  const setCustomTargetTime = (minutes: number) => {
    const validatedMinutes = Math.max(1, Math.min(180, minutes));
    setTargetTime(validatedMinutes * 60);
  };

  return {
    isRunning,
    timeElapsed,
    displayTime,
    progressRatio,
    bpm,
    setBpm,
    isMetronomeOn,
    timerMode,
    targetTime,
    timeSignature,
    currentBeat,
    metronomeTone,
    setMetronomeTone,
    templates,
    showTemplates,
    setShowTemplates,
    toggleTimer,
    toggleMetronome,
    stopTimer,
    stopMetronome,
    reset,
    skipBackward,
    skipForward,
    setTimePoint,
    switchTimerMode,
    changeTimeSignature,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    setCustomTargetTime,
  };
}
