import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Play, BookOpen, TrendingUp, AlertTriangle, Pause, RotateCcw, Check, Plus, Minus, Tag, MessageSquare, ChevronLeft, ChevronRight, Clock, Music, Save, X, FolderOpen, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { VideoPlayerCard } from '@/components/VideoPlayerCard';
import { BpmKnob } from '@/components/BpmKnob';
import { useAppStore } from '@/store/useAppStore';
import { generateAIFeedback, updateCoverProgressFromSession } from '@/utils/aiMock';
import { formatTime } from '@/utils/date';
import { usePractice } from '@/hooks/usePractice';
import { timeSignatureConfigs, metronomeToneConfigs } from '@/utils/practice';
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
  
  const [repetitions, setRepetitions] = useState(0);
  const [selfRating, setSelfRating] = useState(0);
  const [selectedPainPoints, setSelectedPainPoints] = useState<PainPoint[]>([]);
  const [painPointDetailsMap, setPainPointDetailsMap] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [showDetailCard, setShowDetailCard] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  const practice = usePractice({
    initialBpm: 70,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          practice.toggleTimer();
          break;
        case 'KeyB':
          e.preventDefault();
          practice.toggleMetronome();
          break;
        case 'KeyR':
          e.preventDefault();
          practice.reset();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          practice.skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          practice.skipForward();
          break;
        case 'Equal':
        case 'Plus':
          e.preventDefault();
          practice.setBpm((prev) => Math.min(200, prev + 5));
          break;
        case 'Minus':
        case 'NumpadSubtract':
          e.preventDefault();
          practice.setBpm((prev) => Math.max(40, prev - 5));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [practice]);

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
    practice.stopTimer();
    practice.stopMetronome();

    if (practice.timeElapsed < 10 && !confirm('练习时间很短，确定要保存吗？')) {
      return;
    }

    const cleanBPM = selfRating <= 2 ? practice.bpm - 10 : selfRating <= 3 ? practice.bpm - 5 : practice.bpm;

    const sessionData = {
      lessonId: currentLesson?.id || null,
      instrument: video.instrument,
      date: Date.now(),
      durationSeconds: practice.timeElapsed,
      bpm: practice.bpm,
      currentBPM: practice.bpm,
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
      practice.setBpm(video.suggestedPractice.startBPM);
    }
  };

  const beatConfig = timeSignatureConfigs[practice.timeSignature];

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
                  <p className="text-2xl font-bold text-text-primary font-mono tabular-nums">{formatTime(practice.displayTime)}</p>
                </div>
                <div className="flex gap-2 z-10">
                  <button
                    onClick={practice.toggleTimer}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all z-10 relative ${
                      practice.isRunning ? 'bg-amber-soft text-white shadow-glow' : 'bg-primary-light text-text-secondary'
                    }`}
                  >
                    {practice.isRunning ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <button
                    onClick={practice.reset}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-primary-light text-text-secondary hover:bg-primary-subtle transition-all z-10 relative"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button
                    onClick={practice.toggleMetronome}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all z-10 relative ${
                      practice.isMetronomeOn ? 'bg-mint text-white shadow-glow' : 'bg-primary-light text-text-secondary'
                    }`}
                    title="节拍器"
                  >
                    <span className="text-xl">♪</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center">
                  <BpmKnob value={practice.bpm} onChange={practice.setBpm} min={40} max={200} />
                  <p className="text-xs text-text-tertiary mt-3">
                    推荐: {video.suggestedPractice.startBPM} - {video.suggestedPractice.targetBPM} BPM
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                {[60, 80, 100, 120, 140, 160].map((targetBpm) => (
                  <button
                    key={targetBpm}
                    onClick={() => practice.setBpm(targetBpm)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      practice.bpm === targetBpm
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
              <GlassCard elevated className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-text-primary">练习工具</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => practice.setShowTemplates(!practice.showTemplates)}
                      className="p-2 rounded-full hover:bg-primary-light text-text-secondary transition-all"
                      title="练习模板"
                    >
                      <FolderOpen size={16} />
                    </button>
                    <button
                      onClick={() => setShowSaveTemplate(true)}
                      className="p-2 rounded-full hover:bg-primary-light text-text-secondary transition-all"
                      title="保存模板"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={practice.reset}
                      className="p-2 rounded-full hover:bg-primary-light text-text-secondary transition-all"
                      title="重置"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>

                {practice.showTemplates && (
                  <div className="mb-4 p-3 bg-primary-subtle rounded-xl max-h-48 overflow-y-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-secondary">练习模板</span>
                      <button onClick={() => practice.setShowTemplates(false)} className="text-text-tertiary hover:text-text-secondary">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {practice.templates.map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between p-2 bg-white rounded-lg hover:bg-primary-light transition-all"
                        >
                          <button
                            onClick={() => practice.loadTemplate(template)}
                            className="flex-1 text-left"
                          >
                            <p className="text-sm font-medium text-text-primary">{template.name}</p>
                            <p className="text-xs text-text-tertiary">
                              {template.bpm} BPM · {template.timeSignature} · {template.timerMode === 'count-up' ? '正计时' : '倒计时'}
                            </p>
                          </button>
                          <button
                            onClick={() => practice.deleteTemplate(template.id)}
                            className="p-1 text-text-tertiary hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center justify-center md:w-2/5">
                    <div className="relative inline-flex items-center justify-center mb-3">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                        <circle
                          cx="64" cy="64" r="56" fill="none" stroke="#8b5cf6" strokeWidth="8"
                          strokeLinecap="round"
                          className="transition-all duration-500"
                          style={{ strokeDasharray: `${practice.progressRatio * 352} 352` }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-3xl font-bold text-primary font-mono tabular-nums">
                          {formatTime(practice.displayTime)}
                        </div>
                        <span className="text-xs text-text-tertiary mt-1">
                          {practice.timerMode === 'count-up' ? '累计练习' : `倒计时 / ${formatTime(practice.targetTime)}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center bg-primary-light rounded-full p-1">
                      <button
                        onClick={() => practice.switchTimerMode('count-up')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          practice.timerMode === 'count-up'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <Clock size={12} className="inline mr-1" />正计时
                      </button>
                      <button
                        onClick={() => practice.switchTimerMode('count-down')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          practice.timerMode === 'count-down'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <Clock size={12} className="inline mr-1" />倒计时
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={practice.skipBackward}
                        disabled={practice.timeElapsed === 0}
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-primary-light text-text-secondary hover:bg-primary-subtle transition-all disabled:opacity-50"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={practice.toggleTimer}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                          practice.isRunning ? 'bg-amber-soft text-white' : 'bg-primary text-white shadow-glow'
                        }`}
                      >
                        {practice.isRunning ? <Pause size={24} /> : <Play size={24} />}
                      </button>
                      <button
                        onClick={practice.skipForward}
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-primary-light text-text-secondary hover:bg-primary-subtle transition-all"
                      >
                        <ChevronRight size={18} />
                      </button>
                      <button
                        onClick={practice.toggleMetronome}
                        className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                          practice.isMetronomeOn ? 'bg-mint text-white shadow-glow' : 'bg-primary-light text-text-secondary'
                        }`}
                        title="节拍器"
                      >
                        <span className="text-lg">♪</span>
                        {practice.isMetronomeOn && (
                          <div className={`absolute inset-0 rounded-full border-2 ${
                            practice.currentBeat === 0 ? 'border-white animate-ping' : 'border-mint/50'
                          }`} />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {[5, 10, 15, 20, 30, 45, 60].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => practice.setTimePoint(mins)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                            practice.timerMode === 'count-down' && Math.floor(practice.targetTime / 60) === mins
                              ? 'bg-primary text-white'
                              : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
                          }`}
                        >
                          {mins}分
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-4 px-2">
                      <div className="flex items-center gap-2">
                        <Music size={14} className="text-text-secondary" />
                        <div className="flex items-center gap-1">
                          {Array.from({ length: beatConfig.beats }).map((_, i) => {
                            const isDownbeat = beatConfig.downbeats.includes(i);
                            const isActive = practice.isMetronomeOn && practice.currentBeat === i;
                            return (
                              <div
                                key={i}
                                className={`rounded-full transition-all duration-100 ${
                                  isDownbeat ? 'w-3 h-3' : 'w-2.5 h-2.5'
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
                        {(Object.keys(timeSignatureConfigs) as Array<keyof typeof timeSignatureConfigs>).map((sig) => (
                          <button
                            key={sig}
                            onClick={() => practice.changeTimeSignature(sig)}
                            className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                              practice.timeSignature === sig
                                ? 'bg-primary text-white'
                                : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
                            }`}
                          >
                            {sig}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <div className="text-center">
                        <p className="text-xs text-text-tertiary">BPM</p>
                        <p className="text-xl font-bold text-text-primary font-mono">{practice.bpm}</p>
                      </div>
                      <BpmKnob value={practice.bpm} onChange={practice.setBpm} min={40} max={200} />
                      <div className="flex flex-col gap-1">
                        <button onClick={() => practice.setBpm((prev) => Math.min(200, prev + 5))} className="w-7 h-7 rounded bg-primary-light flex items-center justify-center hover:bg-primary-subtle text-text-secondary">
                          <Plus size={12} />
                        </button>
                        <button onClick={() => practice.setBpm((prev) => Math.max(40, prev - 5))} className="w-7 h-7 rounded bg-primary-light flex items-center justify-center hover:bg-primary-subtle text-text-secondary">
                          <Minus size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs text-text-tertiary">音色</span>
                      {(Object.keys(metronomeToneConfigs) as Array<keyof typeof metronomeToneConfigs>).map((tone) => (
                        <button
                          key={tone}
                          onClick={() => practice.setMetronomeTone(tone)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                            practice.metronomeTone === tone
                              ? 'bg-primary text-white'
                              : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
                          }`}
                        >
                          {metronomeToneConfigs[tone].label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-sm text-text-secondary">重复次数</span>
                  <button onClick={() => setRepetitions((prev) => Math.max(0, prev - 1))} className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center hover:bg-primary-subtle">
                    <Minus size={14} />
                  </button>
                  <span className="text-xl font-bold text-text-primary font-mono w-10 text-center">{repetitions}</span>
                  <button onClick={() => setRepetitions((prev) => prev + 1)} className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center hover:bg-primary-subtle">
                    <Plus size={14} />
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

              <button onClick={handleCompletePractice} className="btn-primary w-full flex items-center justify-center gap-2">
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
                    <button onClick={() => onPageChange('cover')} className="btn-secondary text-sm">
                      查看
                    </button>
                  </div>
                </GlassCard>
              )}

              <div className="flex gap-3">
                <button onClick={handleSwitchToPractice} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <Play size={18} />
                  开始练习
                </button>
                <button onClick={() => onPageChange('knowledge')} className="flex-1 btn-secondary flex items-center justify-center gap-2">
                  <BookOpen size={18} />
                  相关知识
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showSaveTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">保存练习模板</h3>
              <button onClick={() => setShowSaveTemplate(false)} className="text-text-tertiary hover:text-text-secondary">
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="输入模板名称..."
              className="w-full px-4 py-3 bg-bg-input border border-border-default rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowSaveTemplate(false)} className="flex-1 btn-secondary">取消</button>
              <button
                onClick={() => {
                  if (newTemplateName.trim()) {
                    practice.saveTemplate(newTemplateName.trim());
                    setNewTemplateName('');
                  }
                }}
                className="flex-1 btn-primary"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
