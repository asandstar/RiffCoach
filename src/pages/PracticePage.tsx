import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, ArrowLeft, RotateCcw, Check, Plus, Minus, Tag, MessageSquare, ChevronLeft, ChevronRight, Target, Trophy } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { BpmKnob } from '@/components/BpmKnob';
import { useAppStore } from '@/store/useAppStore';
import { generateAIFeedback, updateCoverProgressFromSession } from '@/utils/aiMock';
import { formatTime } from '@/utils/date';
import type { PageType, PainPoint } from '@/types';

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

  const timerRef = useRef<number | null>(null);
  const metronomeRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const currentProject = coverProjects[0];
  const currentSection = currentProject?.sections.find((s) => s.progress < 100);
  const allLessons = sources.flatMap((s) => s.lessons);
  const currentLesson = allLessons[0];
  const recentSessions = [...sessions].sort((a, b) => b.date - a.date).slice(0, 7);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const stopMetronome = useCallback(() => {
    if (metronomeRef.current) {
      clearInterval(metronomeRef.current);
      metronomeRef.current = null;
    }
    setIsMetronomeOn(false);
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      stopTimer();
    }

    return () => stopTimer();
  }, [isRunning, stopTimer]);

  useEffect(() => {
    if (isMetronomeOn) {
      const interval = (60 / bpm) * 1000;
      let beatCounter = 0;
      
      const playClick = () => {
        const ctx = audioContextRef.current;
        if (!ctx) return;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        const isDownbeat = beatCounter % 4 === 0;
        oscillator.frequency.value = isDownbeat ? 1200 : 800;
        gainNode.gain.setValueAtTime(isDownbeat ? 0.15 : 0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
        
        beatCounter++;
        setBeatCount(beatCounter);
      };

      metronomeRef.current = window.setInterval(playClick, interval);
    } else {
      stopMetronome();
    }

    return () => stopMetronome();
  }, [isMetronomeOn, bpm, stopMetronome]);

  useEffect(() => {
    if (isMetronomeOn) {
      stopMetronome();
      setIsMetronomeOn(true);
    }
  }, [bpm, stopMetronome]);

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const toggleMetronome = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsMetronomeOn((prev) => !prev);
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
    setTimeElapsed(minutes * 60);
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
          knowledgeBase: { categories: [], items: [], videos: [], favorites: [] },
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

      <GlassCard elevated className="p-6 text-center">
        <div className="relative inline-flex items-center justify-center mb-4">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(timeElapsed / 3600) * 352} 352`}
              className="transition-all duration-500"
              style={{
                strokeDasharray: `${(Math.min(timeElapsed, 3600) / 3600) * 352} 352`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-primary font-mono tabular-nums">{formatTime(timeElapsed)}</div>
            <span className="text-xs text-text-tertiary">累计练习</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-6">
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
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleMetronome}
            className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isMetronomeOn ? 'bg-mint text-white shadow-glow' : 'bg-primary-light text-text-secondary'
            }`}
          >
            <span className="text-xl">♪</span>
            {isMetronomeOn && (
              <div className={`absolute inset-0 rounded-full border-2 ${
                beatCount % 4 === 0 ? 'border-white animate-ping' : 'border-mint/50'
              }`} />
            )}
          </button>
          <button
            onClick={resetTimer}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-primary-light text-text-secondary hover:bg-primary-subtle transition-all"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          {[5, 10, 15, 20, 30, 45, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => setTimePoint(mins)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                Math.floor(timeElapsed / 60) === mins
                  ? 'bg-primary text-white'
                  : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
              }`}
            >
              {mins}分
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-sm font-medium text-text-secondary mb-4 text-center">BPM 调节</h3>
        <div className="flex items-center justify-center">
          <BpmKnob value={bpm} onChange={setBpm} min={40} max={200} />
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="text-sm font-medium text-text-secondary mb-4">重复次数</h3>
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setRepetitions((prev) => Math.max(0, prev - 1))}
            className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center hover:bg-primary-subtle transition-all"
          >
            <Minus size={20} />
          </button>
          <span className="text-3xl font-bold text-text-primary font-mono">{repetitions}</span>
          <button
            onClick={() => setRepetitions((prev) => prev + 1)}
            className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center hover:bg-primary-subtle transition-all"
          >
            <Plus size={20} />
          </button>
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
