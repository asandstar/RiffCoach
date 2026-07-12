import { useState, useEffect } from 'react';
import { Play, Pause, ArrowLeft, RotateCcw, Check, Plus, Minus, Tag, MessageSquare, ChevronLeft, ChevronRight, Trophy, Clock, Save, X, FolderOpen, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { BpmKnob } from '@/components/BpmKnob';
import { useAppStore } from '@/store/useAppStore';
import { generateAIFeedback, updateCoverProgressFromSession } from '@/utils/aiMock';
import { formatTime } from '@/utils/date';
import { usePractice } from '@/hooks/usePractice';
import { timeSignatureConfigs, metronomeToneConfigs } from '@/utils/practice';
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
  
  const [repetitions, setRepetitions] = useState(0);
  const [selfRating, setSelfRating] = useState(0);
  const [selectedPainPoints, setSelectedPainPoints] = useState<PainPoint[]>([]);
  const [painPointDetailsMap, setPainPointDetailsMap] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [showDetailCard, setShowDetailCard] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [customDuration, setCustomDuration] = useState('');

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

  useEffect(() => {
    return () => {
      practice.cleanup();
    };
  }, []); // 只在组件卸载时执行 cleanup，避免每次渲染停止计时器/节拍器

  const currentProject = coverProjects[0];
  const currentSection = currentProject?.sections.find((s) => s.progress < 100);
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

    setShowCelebration(true);

    setTimeout(() => {
      const cleanBPM = selfRating <= 2 ? practice.bpm - 10 : selfRating <= 3 ? practice.bpm - 5 : practice.bpm;

      const sessionData = {
        lessonId: currentLesson?.id || null,
        instrument: 'electric' as const,
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

      const feedback = generateAIFeedback({ ...sessionData, id: 'temp' }, currentLesson, recentSessions, currentProject);

      setTimeout(() => {
        const { sessions: updatedSessions } = useAppStore.getState();
        const newSession = [...updatedSessions].sort((a, b) => b.date - a.date)[0];
        if (newSession) {
          setSessionFeedback(newSession.id, feedback);
        }
      }, 0);

      if (currentLesson?.projectId && currentLesson?.sectionId) {
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
          // 使用 currentLesson.projectId 作为 key，确保与 updatedProject 来源一致
          updateCoverProject(currentLesson.projectId, updatedProject);
        }
      }

      setTimeout(() => {
        setShowCelebration(false);
        onPageChange('ai-feedback');
      }, 2000);
    }, 500);
  };

  const beatConfig = timeSignatureConfigs[practice.timeSignature];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            practice.stopTimer();
            practice.stopMetronome();
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
          <div className="flex gap-2">
            <button
              onClick={() => practice.setShowTemplates(!practice.showTemplates)}
              className="p-2 rounded-full hover:bg-primary-light text-text-secondary transition-all"
              title="练习模板"
              aria-label="练习模板"
            >
              <FolderOpen size={16} />
            </button>
            <button
              onClick={() => setShowSaveTemplate(true)}
              className="p-2 rounded-full hover:bg-primary-light text-text-secondary transition-all"
              title="保存模板"
              aria-label="保存模板"
            >
              <Save size={16} />
            </button>
            <button
              onClick={practice.reset}
              className="p-2 rounded-full hover:bg-primary-light text-text-secondary transition-all"
              title="重置"
              aria-label="重置"
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
          <div className="flex flex-col items-center justify-center md:w-2/5 space-y-4">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle cx="72" cy="72" r="60" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="72" cy="72" r="60" fill="none" stroke="#8b5cf6" strokeWidth="8"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                  style={{ strokeDasharray: `${practice.progressRatio * 377} 377` }}
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

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={practice.skipBackward}
                disabled={practice.timeElapsed === 0}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-light text-text-secondary hover:bg-primary-subtle transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="后退5秒"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={practice.toggleTimer}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  practice.isRunning ? 'bg-amber-soft text-white' : 'bg-primary text-white shadow-glow'
                }`}
                aria-label={practice.isRunning ? '暂停' : '播放'}
              >
                {practice.isRunning ? <Pause size={28} /> : <Play size={28} />}
              </button>
              <button
                onClick={practice.skipForward}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-light text-text-secondary hover:bg-primary-subtle transition-all"
                aria-label="前进5秒"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flex items-center bg-primary-light rounded-full p-1">
              <button
                onClick={() => practice.switchTimerMode('count-up')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  practice.timerMode === 'count-up'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Clock size={12} className="inline mr-1" />正计时
              </button>
              <button
                onClick={() => practice.switchTimerMode('count-down')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  practice.timerMode === 'count-down'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Clock size={12} className="inline mr-1" />倒计时
              </button>
            </div>

            {practice.timerMode === 'count-down' && (
              <div className="w-full">
                <div className="flex items-center justify-center gap-2 flex-wrap mb-2">
                  {[5, 10, 15, 20, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => practice.setTimePoint(mins)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        Math.floor(practice.targetTime / 60) === mins
                          ? 'bg-primary text-white'
                          : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
                      }`}
                    >
                      {mins}分
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="number"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    onBlur={() => {
                      const mins = parseInt(customDuration, 10);
                      if (!isNaN(mins) && mins > 0) {
                        practice.setCustomTargetTime(mins);
                      }
                      setCustomDuration('');
                    }}
                    placeholder="自定义"
                    min="1"
                    max="180"
                    className="w-20 px-3 py-1.5 bg-primary-light rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 text-center"
                  />
                  <span className="text-xs text-text-tertiary">分钟</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={practice.toggleMetronome}
                className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  practice.isMetronomeOn ? 'bg-mint text-white shadow-glow' : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
                }`}
                title="节拍器"
                aria-label="节拍器开关"
              >
                <span className="text-2xl">♪</span>
                {practice.isMetronomeOn && (
                  <div className={`absolute inset-0 rounded-full border-2 ${
                    practice.currentBeat === 0 ? 'border-white animate-ping' : 'border-mint/50'
                  }`} />
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: beatConfig.beats }).map((_, i) => {
                const isDownbeat = beatConfig.downbeats.includes(i);
                const isActive = practice.isMetronomeOn && practice.currentBeat === i;
                return (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-100 ${
                      isDownbeat ? 'w-5 h-5' : 'w-4 h-4'
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

            <div className="flex items-center justify-center gap-1">
              {(Object.keys(timeSignatureConfigs) as Array<keyof typeof timeSignatureConfigs>).map((sig) => (
                <button
                  key={sig}
                  onClick={() => practice.changeTimeSignature(sig)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    practice.timeSignature === sig
                      ? 'bg-primary text-white'
                      : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
                  }`}
                >
                  {sig}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center">
              <BpmKnob
                value={practice.bpm}
                onChange={practice.setBpm}
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-text-tertiary">音色</span>
              {(Object.keys(metronomeToneConfigs) as Array<keyof typeof metronomeToneConfigs>).map((tone) => (
                <button
                  key={tone}
                  onClick={() => practice.setMetronomeTone(tone)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    practice.metronomeTone === tone
                      ? 'bg-primary text-white'
                      : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
                  }`}
                >
                  {metronomeToneConfigs[tone].label}
                </button>
              ))}
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
