import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, ArrowLeft, RotateCcw, Check, Plus, Minus, Tag, MessageSquare, ChevronLeft, ChevronRight, Target, Trophy } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { BpmKnob } from '@/components/BpmKnob';
import { useAppStore } from '@/store/useAppStore';
import { generateAIFeedback, updateCoverProgressFromSession } from '@/utils/aiMock';
import { formatTime } from '@/utils/date';
import type { PageType, PainPoint } from '@/types';

type TimerMode = 'count-up' | 'count-down';
type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8';

interface PracticePageProps {
  onPageChange: (page: PageType) => void;
}

const painPointOptions: PainPoint[] = ['节奏不稳', '换和弦慢', '手指僵硬', '大横按切换慢', '高把位音准偏差', '拨弦力度不均', '换弦慢', '其他'];

const painPointDetails: Record<string, string[]> = {
  '节奏不稳': ['整段都乱', '换弦时乱', '提速后乱', '跟不上节拍器'],
  '拨弦力度不均': ['下拨太重', '上拨太弱', '音量忽大忽小', '右手容易紧张'],
  '换和弦慢': ['找不到手型', '手指抬太高', '节奏断掉', '某根弦闷掉'],
  '换弦慢': ['找不到手型', '手指抬太高', '节奏断掉', '某根弦闷掉'],
  '大横按切换慢': ['按不响', '切换慢', '手酸', '食指压不住'],
};

const timeSignatureConfigs: Record<TimeSignature, { beats: number; downbeats: number[]; label: string }> = {
  '2/4': { beats: 2, downbeats: [0], label: '2/4' },
  '3/4': { beats: 3, downbeats: [0], label: '3/4' },
  '4/4': { beats: 4, downbeats: [0], label: '4/4' },
  '6/8': { beats: 6, downbeats: [0, 3], label: '6/8' },
};

export function PracticePage({ onPageChange }: PracticePageProps) {
  const { coverProjects, sessions, sources, addSession, updateCoverProject, setSessionFeedback, currentEfficientPlan } = useAppStore();
  
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [bpm, setBpm] = useState(70);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [repetitions, setRepetitions] = useState(0);
  const [selfRating, setSelfRating] = useState(0);
  const [selectedPainPoints, setSelectedPainPoints] = useState<PainPoint[]>([]);
  const [painPointDetailsMap, setPainPointDetailsMap] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [showDetailCard, setShowDetailCard] = useState<string | null>(null);
  const [beatCount, setBeatCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const [timerMode, setTimerMode] = useState<TimerMode>('count-up');
  const [targetTime, setTargetTime] = useState(30 * 60);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>('4/4');
  const [currentBeat, setCurrentBeat] = useState(0);

  const timerRef = useRef<number | null>(null);
  const metronomeRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const bpmRef = useRef(bpm);
  const beatCounterRef = useRef(0);
  const timeSignatureRef = useRef(timeSignature);

  const currentProject = coverProjects[0];
  const currentSection = currentProject?.sections.find((s) => s.progress < 100);
  const allLessons = sources.flatMap((s) => s.lessons);
  const currentLesson = allLessons[0];
  const recentSessions = [...sessions].sort((a, b) => b.date - a.date).slice(0, 7);

  const displayTime = timerMode === 'count-up'
    ? timeElapsed
    : Math.max(0, targetTime - timeElapsed);

  const progressRatio = timerMode === 'count-up'
    ? Math.min(timeElapsed, 3600) / 3600
    : Math.min(timeElapsed, targetTime) / targetTime;

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    timeSignatureRef.current = timeSignature;
  }, [timeSignature]);

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

          let volume = 0.3;
          let frequency = 800;
          if (isDownbeat) {
            volume = 0.4;
            frequency = 1200;
          } else if (isSubDownbeat) {
            volume = 0.35;
            frequency = 1000;
          }

          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

          oscillator.frequency.value = frequency;

          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.15);

          beatCounterRef.current++;
          setBeatCount(beatCounterRef.current);
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

  const resetTimer = () => {
    stopTimer();
    stopMetronome();
    setTimeElapsed(0);
    setRepetitions(0);
    setSelfRating(0);
    setSelectedPainPoints([]);
    setPainPointDetailsMap({});
    setNotes('');
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

  const togglePainPoint = (painPoint: PainPoint) => {
    setSelectedPainPoints((prev) =>
      prev.includes(painPoint)
        ? prev.filter((p) => p !== painPoint)
        : [...prev, painPoint]
    );
  };

  const selectPainPointDetail = (painPoint: string, detail: string) => {
    setPainPointDetailsMap((prev) => ({ ...prev, [painPoint]: detail }));
    setShowDetailCard(null);
  };

  const handleCompletePractice = () => {
    stopTimer();
    stopMetronome();

    if (timeElapsed < 10 && !confirm('练习时间很短，确定要保存吗？')) {
      return;
    }

    setShowCelebration(true);

    setTimeout(() => {
      const cleanBPM = selfRating <= 2 ? bpm - 10 : selfRating <= 3 ? bpm - 5 : bpm;

      const sessionData = {
        lessonId: currentLesson?.id || null,
        instrument: 'electric' as const,
        date: Date.now(),
        durationSeconds: timeElapsed,
        bpm: bpm,
        currentBPM: bpm,
        repetitions: repetitions,
        selfRating: selfRating,
        painPoints: selectedPainPoints,
        painPointDetails: Object.entries(painPointDetailsMap).map(([painPoint, detail]) => ({ painPoint, detail })),
        notes: notes,
        cleanBPM: Math.max(40, cleanBPM),
      };

      addSession(sessionData);

      const feedback = generateAIFeedback({ ...sessionData, id: 'temp' }, currentLesson, recentSessions, currentProject);

      setTimeout(() => {
        const { sessions: updatedSessions } = useAppStore.getState();
        const newSession = [...updatedSessions].sort((a, b) => b.date - a.date)[0];
        if (newSession) {
          setSessionFeedback(newSession.id, feedback);
        }
      }, 0);

      if (currentProject && currentLesson?.projectId && currentLesson?.sectionId) {
        const updatedProject = updateCoverProgressFromSession({ ...sessionData, id: 'temp' }, currentLesson, {
          coverProjects,
          sessions: [...sessions, { ...sessionData, id: 'temp' }],
          sources,
          knowledgeBase: { categories: [], items: [], videos: [], favorites: [], readHistory: [] },
          materialInbox: [],
          videoResources: [],
          recentResources: [],
          favoriteResources: [],
          instruments: [],
          painPointOptions: [],
          currentEfficientPlan: null,
          videoSize: 'compact',
        });

        if (updatedProject) {
          updateCoverProject(currentProject.id, updatedProject);
        }
      }

      setTimeout(() => {
        setShowCelebration(false);
        onPageChange('ai-feedback');
      }, 2000);
    }, 500);
  };

  const beatConfig = timeSignatureConfigs[timeSignature];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            stopTimer();
            stopMetronome();
            onPageChange('today');
          }}
          className="p-2 hover:bg-primary-light rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-text-primary">练习</h1>
        <div className="w-8" />
      </div>

      {currentProject && (
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-tertiary">当前 Cover</p>
              <p className="font-semibold text-text-primary">{currentProject.title}</p>
            </div>
            {currentSection && (
              <div className="text-right">
                <p className="text-sm text-text-tertiary">当前段落</p>
                <p className="font-semibold text-text-primary">{currentSection.name}</p>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {currentEfficientPlan && (
        <GlassCard className="p-4">
          <p className="text-sm text-text-tertiary mb-1">今日最小有效目标</p>
          <p className="font-semibold text-text-primary">{currentEfficientPlan.target}</p>
        </GlassCard>
      )}

      <GlassCard elevated className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary">练习工具</h3>
          <button
            onClick={resetTimer}
            className="p-2 rounded-full hover:bg-primary-light text-text-secondary transition-all"
            title="重置"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center justify-center md:w-2/5">
            <div className="relative inline-flex items-center justify-center mb-3">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                  style={{
                    strokeDasharray: `${progressRatio * 377} 377`,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-primary font-mono tabular-nums">
                  {formatTime(displayTime)}
                </div>
                <span className="text-xs text-text-tertiary mt-1">
                  {timerMode === 'count-up' ? '累计练习' : `倒计时 / ${formatTime(targetTime)}`}
                </span>
              </div>
            </div>

            <div className="flex items-center bg-primary-light rounded-full p-1">
              <button
                onClick={() => switchTimerMode('count-up')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  timerMode === 'count-up'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                正计时
              </button>
              <button
                onClick={() => switchTimerMode('count-down')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  timerMode === 'count-down'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                倒计时
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={skipBackward}
                disabled={timeElapsed === 0}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-light text-text-secondary hover:bg-primary-subtle transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={toggleTimer}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isRunning ? 'bg-amber-soft text-white' : 'bg-primary text-white shadow-glow'
                }`}
              >
                {isRunning ? <Pause size={28} /> : <Play size={28} />}
              </button>
              <button
                onClick={skipForward}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-light text-text-secondary hover:bg-primary-subtle transition-all"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={toggleMetronome}
                className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isMetronomeOn ? 'bg-mint text-white shadow-glow' : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
                }`}
                title="节拍器"
              >
                <span className="text-xl">♪</span>
                {isMetronomeOn && (
                  <div className={`absolute inset-0 rounded-full border-2 ${
                    currentBeat === 0 ? 'border-white animate-ping' : 'border-mint/50'
                  }`} />
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              {[5, 10, 15, 20, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setTimePoint(mins)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    timerMode === 'count-down' && Math.floor(targetTime / 60) === mins
                      ? 'bg-primary text-white'
                      : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
                  }`}
                >
                  {mins}分
                </button>
              ))}
            </div>

            <hr className="border-border-subtle" />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">节拍</span>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: beatConfig.beats }).map((_, i) => {
                    const isDownbeat = beatConfig.downbeats.includes(i);
                    const isActive = isMetronomeOn && currentBeat === i;
                    return (
                      <div
                        key={i}
                        className={`rounded-full transition-all duration-100 ${
                          isDownbeat ? 'w-4 h-4' : 'w-3 h-3'
                        } ${
                          isActive
                            ? isDownbeat
                              ? 'bg-primary shadow-lg shadow-primary/50 scale-125'
                              : 'bg-primary/80 scale-110'
                            : isDownbeat
                            ? 'bg-primary/30'
                            : 'bg-text-tertiary/30'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {(Object.keys(timeSignatureConfigs) as TimeSignature[]).map((sig) => (
                  <button
                    key={sig}
                    onClick={() => changeTimeSignature(sig)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      timeSignature === sig
                        ? 'bg-primary text-white'
                        : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
                    }`}
                  >
                    {sig}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-text-tertiary mb-1">BPM</p>
                  <p className="text-2xl font-bold text-text-primary font-mono">{bpm}</p>
                </div>
                <BpmKnob
                  value={bpm}
                  onChange={setBpm}
                  onChangeEnd={(finalBpm) => {
                    if (audioContextRef.current?.state === 'suspended') {
                      audioContextRef.current.resume().catch(() => {});
                    }
                  }}
                  min={40}
                  max={200}
                />
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setBpm((prev) => Math.min(200, prev + 5))}
                    className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center hover:bg-primary-subtle transition-all text-text-secondary"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => setBpm((prev) => Math.max(40, prev - 5))}
                    className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center hover:bg-primary-subtle transition-all text-text-secondary"
                  >
                    <Minus size={14} />
                  </button>
                </div>
              </div>
            </div>

            <hr className="border-border-subtle" />

            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-text-secondary">重复次数</span>
              <button
                onClick={() => setRepetitions((prev) => Math.max(0, prev - 1))}
                className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center hover:bg-primary-subtle transition-all"
              >
                <Minus size={16} />
              </button>
              <span className="text-2xl font-bold text-text-primary font-mono w-12 text-center">{repetitions}</span>
              <button
                onClick={() => setRepetitions((prev) => prev + 1)}
                className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center hover:bg-primary-subtle transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="text-sm font-medium text-text-secondary mb-4">自评</h3>
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => setSelfRating(rating)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                selfRating >= rating
                  ? 'bg-amber-soft text-white'
                  : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="text-center text-text-tertiary text-sm mt-2">
          {selfRating === 0 ? '请选择自评' : selfRating === 1 ? '还需要努力' : selfRating === 2 ? '不太理想' : selfRating === 3 ? '一般' : selfRating === 4 ? '不错' : '很好'}
        </p>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <Tag size={16} />
            卡点标签
          </h3>
          <span className="text-xs text-text-tertiary">{selectedPainPoints.length} 个</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {painPointOptions.map((painPoint) => {
            const isSelected = selectedPainPoints.includes(painPoint);
            const hasDetails = painPointDetails[painPoint];
            return (
              <button
                key={painPoint}
                onClick={() => {
                  if (hasDetails) {
                    setShowDetailCard(isSelected ? null : painPoint);
                  }
                  togglePainPoint(painPoint);
                }}
                className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
                }`}
              >
                {painPoint}
                {hasDetails && <MessageSquare size={12} />}
              </button>
            );
          })}
        </div>

        {showDetailCard && painPointDetails[showDetailCard] && (
          <div className="mt-4 p-3 bg-primary-subtle rounded-xl">
            <p className="text-xs text-text-tertiary mb-2">{showDetailCard} - 请选择具体问题：</p>
            <div className="flex flex-wrap gap-2">
              {painPointDetails[showDetailCard].map((detail) => (
                <button
                  key={detail}
                  onClick={() => selectPainPointDetail(showDetailCard, detail)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    painPointDetailsMap[showDetailCard] === detail
                      ? 'bg-primary text-white'
                      : 'bg-white text-text-secondary hover:bg-primary-light'
                  }`}
                >
                  {detail}
                </button>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="text-sm font-medium text-text-secondary mb-3">备注</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="记录练习感受、问题和改进方向..."
          rows={3}
          className="w-full px-4 py-3 bg-bg-input border border-border-default rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
        />
      </GlassCard>

      <button
        onClick={handleCompletePractice}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Check size={18} />
        完成练习
      </button>

      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 text-center animate-scale-in shadow-2xl max-w-sm mx-4">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-soft to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <Trophy size={40} className="text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-mint rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce">
                +1
              </div>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">练习完成！</h2>
            <p className="text-text-secondary">已保存练习记录</p>
            <div className="mt-4 flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
