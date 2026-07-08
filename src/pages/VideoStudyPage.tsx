import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, BookOpen, TrendingUp, AlertTriangle, Pause, RotateCcw, Check, Plus, Minus, Tag, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { VideoPlayerCard } from '@/components/VideoPlayerCard';
import { BpmKnob } from '@/components/BpmKnob';
import { useAppStore } from '@/store/useAppStore';
import { generateAIFeedback, updateCoverProgressFromSession } from '@/utils/aiMock';
import { formatTime } from '@/utils/date';
import type { PageType, PainPoint } from '@/types';

interface VideoStudyPageProps {
  onPageChange: (page: PageType) => void;
}

type ViewMode = 'info' | 'practice';

const painPointOptions: PainPoint[] = ['节奏不稳', '换和弦慢', '手指僵硬', '大横按切换慢', '高把位音准偏差', '拨弦力度不均', '换弦慢', '其他'];

const painPointDetails: Record<string, string[]> = {
  '节奏不稳': ['整段都乱', '换弦时乱', '提速后乱', '跟不上节拍器'],
  '拨弦力度不均': ['下拨太重', '上拨太弱', '音量忽大忽小', '右手容易紧张'],
  '换和弦慢': ['找不到手型', '手指抬太高', '节奏断掉', '某根弦闷掉'],
  '换弦慢': ['找不到手型', '手指抬太高', '节奏断掉', '某根弦闷掉'],
  '大横按切换慢': ['按不响', '切换慢', '手酸', '食指压不住'],
};

export function VideoStudyPage({ onPageChange }: VideoStudyPageProps) {
  const { videoResources, recentResources, coverProjects, sessions, sources, addSession, updateCoverProject, setSessionFeedback, currentEfficientPlan } = useAppStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('info');
  
  const [bpm, setBpm] = useState(70);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [repetitions, setRepetitions] = useState(0);
  const [selfRating, setSelfRating] = useState(0);
  const [selectedPainPoints, setSelectedPainPoints] = useState<PainPoint[]>([]);
  const [painPointDetailsMap, setPainPointDetailsMap] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [showDetailCard, setShowDetailCard] = useState<string | null>(null);

  const metronomeRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const bpmRef = useRef(bpm);
  const beatCounterRef = useRef(0);

  const recentVideo = recentResources
    .filter((r) => r.type === 'video')
    .map((r) => videoResources.find((v) => v.id === r.id))
    .filter(Boolean)[0];

  const video = recentVideo || videoResources[0];

  if (!video) {
    return (
      <div className="glass-card p-8 text-center">
        <BookOpen size={32} className="text-text-tertiary mx-auto mb-4" />
        <p className="text-text-secondary">没有找到视频资源</p>
        <button onClick={() => onPageChange('resource')} className="btn-secondary mt-4">
          返回资料中心
        </button>
      </div>
    );
  }

  const relatedProject = coverProjects.find((p) =>
    p.sourceLinks.some((link) => link.bvid === video.bvid)
  );

  const currentEpisode = video.episodes?.find((e) => e.page === currentPage);
  const allLessons = sources.flatMap((s) => s.lessons);
  const currentLesson = allLessons[0];
  const recentSessions = [...sessions].sort((a, b) => b.date - a.date).slice(0, 7);

  const stopMetronome = useCallback(() => {
    if (metronomeRef.current) {
      clearTimeout(metronomeRef.current);
      metronomeRef.current = null;
    }
    setIsMetronomeOn(false);
    beatCounterRef.current = 0;
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

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

          const isDownbeat = beatCounterRef.current % 4 === 0;
          const volume = isDownbeat ? 0.4 : 0.3;
          const frequency = isDownbeat ? 1200 : 800;

          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

          oscillator.frequency.value = frequency;

          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.15);

          beatCounterRef.current++;

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
    }

    return () => {
      if (metronomeRef.current) {
        clearTimeout(metronomeRef.current);
        metronomeRef.current = null;
      }
    };
  }, [isMetronomeOn]);

  useEffect(() => {
    if (isTimerRunning) {
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
  }, [isTimerRunning]);

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

  const toggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const resetPractice = () => {
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

    const cleanBPM = selfRating <= 2 ? bpm - 10 : selfRating <= 3 ? bpm - 5 : bpm;

    const sessionData = {
      lessonId: currentLesson?.id || null,
      instrument: video.instrument,
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

    const feedback = generateAIFeedback({ ...sessionData, id: 'temp' }, currentLesson, recentSessions, relatedProject || undefined);

    setTimeout(() => {
      const { sessions: updatedSessions } = useAppStore.getState();
      const newSession = [...updatedSessions].sort((a, b) => b.date - a.date)[0];
      if (newSession) {
        setSessionFeedback(newSession.id, feedback);
      }
    }, 0);

    if (relatedProject && currentLesson?.projectId && currentLesson?.sectionId) {
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
        updateCoverProject(relatedProject.id, updatedProject);
      }
    }

    onPageChange('ai-feedback');
  };

  const handleSwitchToPractice = () => {
    setViewMode('practice');
    if (video.suggestedPractice.startBPM) {
      setBpm(video.suggestedPractice.startBPM);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => onPageChange('resource')}
          className="p-2 hover:bg-primary-light rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-text-primary md:text-2xl">{video.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs chip chip-primary">{video.source === 'bilibili' ? 'B站' : 'YouTube'}</span>
            <span className="text-xs text-text-tertiary">{video.stage}</span>
            {currentEpisode && (
              <span className="text-xs text-text-secondary font-medium">
                P{currentEpisode.page} · {currentEpisode.title}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('info')}
          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
            viewMode === 'info'
              ? 'bg-gradient-primary text-white shadow-glow'
              : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
          }`}
        >
          视频信息
        </button>
        <button
          onClick={handleSwitchToPractice}
          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            viewMode === 'practice'
              ? 'bg-gradient-primary text-white shadow-glow'
              : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
          }`}
        >
          <Play size={16} />
          开始练习
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <VideoPlayerCard
            bvid={video.bvid || ''}
            page={currentPage}
            onPageChange={setCurrentPage}
            title={video.title}
            customEpisodes={video.episodes?.map((e) => ({ page: e.page, title: e.title }))}
            videoId={video.id}
          />

          {viewMode === 'info' && (
            <GlassCard className="p-5">
              <h2 className="text-lg font-bold text-text-primary mb-4">视频关键信息</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-2">AI 摘要</h3>
                  <p className="text-sm text-text-primary">{video.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary-subtle rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp size={14} className="text-mint" />
                      <span className="text-xs text-text-tertiary">适合阶段</span>
                    </div>
                    <p className="font-semibold text-text-primary">{video.stage}</p>
                  </div>
                  <div className="bg-primary-subtle rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-text-tertiary">难度</span>
                    </div>
                    <p className="font-semibold text-text-primary">{'★'.repeat(video.difficulty)}{'☆'.repeat(5 - video.difficulty)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-2">关键技能</h3>
                  <div className="flex flex-wrap gap-2">
                    {video.skills.map((skill) => (
                      <span key={skill} className="chip chip-primary">{skill}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-2">建议练习方式</h3>
                  <div className="space-y-2">
                    {video.suggestedPractice.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className="w-5 h-5 flex items-center justify-center bg-primary text-white text-xs rounded-full font-semibold">
                          {idx + 1}
                        </span>
                        <span className="text-text-primary">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-text-tertiary">推荐 BPM</span>
                    <p className="text-lg font-bold text-primary">{video.suggestedPractice.startBPM} - {video.suggestedPractice.targetBPM}</p>
                  </div>
                  <div>
                    <span className="text-xs text-text-tertiary">建议时长</span>
                    <p className="text-lg font-bold text-text-primary">{video.suggestedPractice.durationMinutes}分钟</p>
                  </div>
                </div>

                {video.commonMistakes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                      <AlertTriangle size={14} className="text-amber-soft" />
                      常见错误
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {video.commonMistakes.map((mistake) => (
                        <span key={mistake} className="chip chip-warning">{mistake}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          {viewMode === 'practice' && (
            <div className="space-y-4">
              {relatedProject && (
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-tertiary">当前 Cover</p>
                      <p className="font-semibold text-text-primary">{relatedProject.title}</p>
                    </div>
                  </div>
                </GlassCard>
              )}

              {currentEfficientPlan && (
                <GlassCard className="p-4">
                  <p className="text-sm text-text-tertiary mb-1">今日最小有效目标</p>
                  <p className="font-semibold text-text-primary">{currentEfficientPlan.target}</p>
                </GlassCard>
              )}

              {currentEpisode && (
                <GlassCard className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                      <Play size={18} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-text-tertiary">当前练习</p>
                      <p className="font-semibold text-text-primary">P{currentEpisode.page} · {currentEpisode.title}</p>
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          {viewMode === 'info' && (
            <GlassCard className="p-5 sticky top-20">
              <h2 className="text-lg font-bold text-text-primary mb-4">练习工具</h2>
              
              <div className="flex items-center justify-between mb-6">
                <div className="text-center">
                  <p className="text-xs text-text-tertiary mb-1">练习时长</p>
                  <p className="text-2xl font-bold text-text-primary font-mono tabular-nums">{formatTime(timeElapsed)}</p>
                </div>
                <div className="flex gap-2 z-10">
                  <button
                    onClick={toggleTimer}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all z-10 relative ${
                      isTimerRunning ? 'bg-amber-soft text-white shadow-glow' : 'bg-primary-light text-text-secondary'
                    }`}
                  >
                    {isTimerRunning ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <button
                    onClick={resetPractice}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-primary-light text-text-secondary hover:bg-primary-subtle transition-all z-10 relative"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button
                    onClick={toggleMetronome}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all z-10 relative ${
                      isMetronomeOn ? 'bg-mint text-white shadow-glow' : 'bg-primary-light text-text-secondary'
                    }`}
                    title="节拍器"
                  >
                    <span className="text-xl">♪</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center">
                  <BpmKnob value={bpm} onChange={setBpm} min={40} max={200} />
                  <p className="text-xs text-text-tertiary mt-3">
                    推荐: {video.suggestedPractice.startBPM} - {video.suggestedPractice.targetBPM} BPM
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                {[60, 80, 100, 120, 140, 160].map((targetBpm) => (
                  <button
                    key={targetBpm}
                    onClick={() => setBpm(targetBpm)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      bpm === targetBpm
                        ? 'bg-primary text-white'
                        : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
                    }`}
                  >
                    {targetBpm}
                  </button>
                ))}
              </div>
            </GlassCard>
          )}

          {viewMode === 'practice' && (
            <>
              <GlassCard elevated className="p-6 text-center">
                <div className="text-5xl font-bold text-primary font-mono mb-4 tabular-nums">{formatTime(timeElapsed)}</div>
                
                <div className="flex items-center justify-center gap-3 mb-6 z-10 relative">
                  <button
                    onClick={skipBackward}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-light text-text-secondary hover:bg-primary-subtle transition-all z-10 relative"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={toggleTimer}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all z-20 relative ${
                      isTimerRunning ? 'bg-amber-soft text-white' : 'bg-primary text-white shadow-glow'
                    }`}
                  >
                    {isTimerRunning ? <Pause size={28} /> : <Play size={28} />}
                  </button>
                  <button
                    onClick={skipForward}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-light text-text-secondary hover:bg-primary-subtle transition-all z-10 relative"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-4 z-10 relative">
                  <button
                    onClick={toggleMetronome}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all z-10 relative ${
                      isMetronomeOn ? 'bg-mint text-white shadow-glow' : 'bg-primary-light text-text-secondary'
                    }`}
                  >
                    <span className="text-xl">♪</span>
                  </button>
                  <button
                    onClick={resetPractice}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-primary-light text-text-secondary hover:bg-primary-subtle transition-all z-10 relative"
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
                <p className="text-xs text-text-tertiary text-center mt-3">
                  推荐: {video.suggestedPractice.startBPM} - {video.suggestedPractice.targetBPM} BPM
                </p>
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
            </>
          )}

          {viewMode === 'info' && (
            <>
              {relatedProject && (
                <GlassCard className="p-5">
                  <h2 className="text-lg font-bold text-text-primary mb-3">所属 Cover 项目</h2>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold">
                      {relatedProject.title.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary">{relatedProject.title}</h3>
                      <p className="text-sm text-text-tertiary">{relatedProject.artist}</p>
                    </div>
                    <button
                      onClick={() => onPageChange('cover')}
                      className="btn-secondary text-sm"
                    >
                      查看
                    </button>
                  </div>
                </GlassCard>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSwitchToPractice}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Play size={18} />
                  开始练习
                </button>
                <button
                  onClick={() => onPageChange('knowledge')}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2"
                >
                  <BookOpen size={18} />
                  相关知识
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
