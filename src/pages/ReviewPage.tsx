import { useState } from 'react';
import { Calendar, TrendingUp, AlertTriangle, Music, X, Edit2, Check } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { useAppStore } from '@/store/useAppStore';
import { getThisWeekSessions, getLastWeekSessions } from '@/utils/aiMock';
import { formatDate } from '@/utils/date';
import type { PageType, Session, PainPoint } from '@/types';

interface ReviewPageProps {
  onPageChange: (page: PageType) => void;
}

export function ReviewPage({ onPageChange }: ReviewPageProps) {
  const { sessions, coverProjects, sources, updateSession } = useAppStore();
  
  const [selectedWeek, setSelectedWeek] = useState<'this' | 'last'>('this');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editSession, setEditSession] = useState<Partial<Session>>({});
  
  const thisWeekSessions = getThisWeekSessions(sessions);
  const lastWeekSessions = getLastWeekSessions(sessions);
  const currentSessions = selectedWeek === 'this' ? thisWeekSessions : lastWeekSessions;

  const totalMinutes = Math.round(currentSessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60);
  const practiceDays = new Set(currentSessions.map((s) => new Date(s.date).toDateString())).size;
  const avgBpm = currentSessions.length > 0 
    ? Math.round(currentSessions.reduce((acc, s) => acc + s.bpm, 0) / currentSessions.length) 
    : 0;

  const painCounts: Record<string, number> = {};
  currentSessions.forEach((s) => {
    (s.painPoints || []).forEach((p) => {
      painCounts[p] = (painCounts[p] || 0) + 1;
    });
  });
  const repeatedPains = Object.entries(painCounts).filter(([, c]) => c >= 2);

  const skillProgress = currentSessions.length > 1 
    ? '整体呈上升趋势' 
    : currentSessions.length === 1 
      ? '开始起步' 
      : '暂无数据';

  const recentSession = sessions.sort((a, b) => b.date - a.date)[0];
  const aiSuggestion = recentSession?.aiFeedback?.nextPlan || '继续保持练习，逐步提升速度和稳定性。';

  const painPointOptions: PainPoint[] = ['节奏不稳', '换和弦慢', '手指僵硬', '大横按切换慢', '高把位音准偏差', '拨弦力度不均', '换弦慢', '其他'];

  const handleOpenDetail = (session: Session) => {
    setSelectedSession(session);
    setEditSession({});
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    if (selectedSession) {
      setEditSession(selectedSession);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedSession && editSession) {
      updateSession(selectedSession.id, editSession);
      setSelectedSession({ ...selectedSession, ...editSession });
      setIsEditing(false);
    }
  };

  const handleEditChange = (field: keyof Session, value: unknown) => {
    setEditSession(prev => ({ ...prev, [field]: value }));
  };

  const togglePainPoint = (painPoint: PainPoint) => {
    if (selectedSession) {
      const currentPoints = (editSession.painPoints as PainPoint[]) || [...selectedSession.painPoints];
      const newPoints = currentPoints.includes(painPoint)
        ? currentPoints.filter(p => p !== painPoint)
        : [...currentPoints, painPoint];
      setEditSession(prev => ({ ...prev, painPoints: newPoints }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-text-primary">周复盘</h1>
        <div className="flex items-center gap-2 bg-primary-light rounded-full p-1">
          <button
            onClick={() => setSelectedWeek('this')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedWeek === 'this' ? 'bg-primary text-white' : 'text-text-secondary'
            }`}
          >
            本周
          </button>
          <button
            onClick={() => setSelectedWeek('last')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedWeek === 'last' ? 'bg-primary text-white' : 'text-text-secondary'
            }`}
          >
            上周
          </button>
        </div>
      </div>

      {currentSessions.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Calendar size={32} className="text-text-tertiary mx-auto mb-4" />
          <p className="text-text-secondary">本周还没有练习记录</p>
          <button onClick={() => onPageChange('practice')} className="btn-secondary mt-4">
            开始练习
          </button>
        </GlassCard>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <GlassCard className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{totalMinutes}</p>
              <p className="text-xs text-text-tertiary mt-1">总练习分钟</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="text-3xl font-bold text-text-primary">{practiceDays}</p>
              <p className="text-xs text-text-tertiary mt-1">练习天数</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-soft">{avgBpm}</p>
              <p className="text-xs text-text-tertiary mt-1">平均 BPM</p>
            </GlassCard>
          </div>

          {coverProjects.length > 0 && (
            <GlassCard className="p-5">
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <Music size={20} className="text-lavender" />
                Cover 进度
              </h2>
              <div className="space-y-4">
                {coverProjects.map((project) => {
                  const avgProgress = Math.round(project.sections.reduce((acc, s) => acc + s.progress, 0) / project.sections.length);
                  const maxCleanBPM = Math.max(...project.sections.map((s) => s.currentCleanBPM));
                  return (
                    <div key={project.id}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-text-primary">{project.title}</h3>
                        <span className="text-sm font-semibold text-primary">{avgProgress}%</span>
                      </div>
                      <div className="h-2 bg-primary-subtle rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${avgProgress}%` }} />
                      </div>
                      <p className="text-xs text-text-tertiary">最高干净 BPM: {maxCleanBPM}</p>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}

          <GlassCard className="p-5">
            <h2 className="text-lg font-bold text-text-primary mb-4">本周练了什么</h2>
            <div className="space-y-3">
              {currentSessions.slice(0, 5).map((session) => {
                const lesson = sources.flatMap((s) => s.lessons).find((l) => l.id === session.lessonId);
                return (
                  <div 
                    key={session.id} 
                    className="flex items-center justify-between p-3 bg-primary-subtle rounded-lg cursor-pointer hover:bg-primary-light transition-colors"
                    onClick={() => handleOpenDetail(session)}
                  >
                    <div>
                      <p className="font-medium text-text-primary">{lesson?.title || '练习'}</p>
                      <p className="text-xs text-text-tertiary">{formatDate(session.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{Math.round(session.durationSeconds / 60)}分钟</p>
                      <p className="text-xs text-text-tertiary">{session.bpm} BPM</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-mint" />
              技能进步
            </h2>
            <p className="text-text-secondary">{skillProgress}</p>
          </GlassCard>

          {repeatedPains.length > 0 && (
            <GlassCard className="p-5">
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-soft" />
                反复卡点
              </h2>
              <div className="flex flex-wrap gap-2">
                {repeatedPains.map(([pain, count]) => (
                  <span key={pain} className="chip chip-warning">{pain} ({count}次)</span>
                ))}
              </div>
            </GlassCard>
          )}

          <GlassCard className="p-5">
            <h2 className="text-lg font-bold text-text-primary mb-4">AI 下周建议</h2>
            <p className="text-text-secondary">{aiSuggestion}</p>
          </GlassCard>
        </>
      )}

      {selectedSession && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[60]" onClick={() => { setSelectedSession(null); setIsEditing(false); }} />
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl rounded-t-2xl z-[60] p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">练习详情</h2>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button onClick={handleStartEdit} className="p-2 hover:bg-primary-light rounded-full">
                    <Edit2 size={20} />
                  </button>
                ) : (
                  <button onClick={handleSaveEdit} className="p-2 bg-primary text-white rounded-full">
                    <Check size={20} />
                  </button>
                )}
                <button onClick={() => { setSelectedSession(null); setIsEditing(false); }} className="p-2 hover:bg-primary-light rounded-full">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <GlassCard className="p-4">
                <h3 className="text-sm font-medium text-text-secondary mb-2">练习项目</h3>
                <p className="font-semibold text-text-primary">
                  {sources.flatMap((s) => s.lessons).find((l) => l.id === selectedSession.lessonId)?.title || '练习'}
                </p>
              </GlassCard>

              <GlassCard className="p-4">
                <h3 className="text-sm font-medium text-text-secondary mb-2">日期</h3>
                <p className="font-semibold text-text-primary">{formatDate(selectedSession.date)}</p>
              </GlassCard>

              <GlassCard className="p-4">
                <h3 className="text-sm font-medium text-text-secondary mb-3">练习时长</h3>
                {isEditing ? (
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleEditChange('durationSeconds', Math.max(60, (editSession.durationSeconds as number) || selectedSession.durationSeconds - 60))}
                      className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-primary">{Math.round(((editSession.durationSeconds as number) || selectedSession.durationSeconds) / 60)} 分钟</span>
                    <button 
                      onClick={() => handleEditChange('durationSeconds', ((editSession.durationSeconds as number) || selectedSession.durationSeconds) + 60)}
                      className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <p className="font-semibold text-text-primary">{Math.round(selectedSession.durationSeconds / 60)} 分钟</p>
                )}
              </GlassCard>

              <GlassCard className="p-4">
                <h3 className="text-sm font-medium text-text-secondary mb-3">BPM</h3>
                {isEditing ? (
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleEditChange('bpm', Math.max(40, (editSession.bpm as number) || selectedSession.bpm - 1))}
                      className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-primary">{(editSession.bpm as number) || selectedSession.bpm}</span>
                    <button 
                      onClick={() => handleEditChange('bpm', Math.min(200, ((editSession.bpm as number) || selectedSession.bpm) + 1))}
                      className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <p className="font-semibold text-text-primary">{selectedSession.bpm} BPM</p>
                )}
              </GlassCard>

              <GlassCard className="p-4">
                <h3 className="text-sm font-medium text-text-secondary mb-3">自评</h3>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleEditChange('selfRating', rating)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          ((editSession.selfRating as number) || selectedSession.selfRating) >= rating
                            ? 'bg-primary text-white'
                            : 'bg-primary-light'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <span key={rating} className={`text-lg ${rating <= selectedSession.selfRating ? '' : 'text-text-tertiary'}`}>★</span>
                    ))}
                  </div>
                )}
              </GlassCard>

              <GlassCard className="p-4">
                <h3 className="text-sm font-medium text-text-secondary mb-3">卡点标签</h3>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {painPointOptions.map((pain) => (
                      <button
                        key={pain}
                        onClick={() => togglePainPoint(pain)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          ((editSession.painPoints as PainPoint[]) || selectedSession.painPoints).includes(pain)
                            ? 'bg-primary text-white'
                            : 'bg-primary-light text-text-secondary'
                        }`}
                      >
                        {pain}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedSession.painPoints.map((pain) => (
                      <span key={pain} className="chip chip-warning">{pain}</span>
                    ))}
                    {selectedSession.painPoints.length === 0 && (
                      <span className="text-sm text-text-tertiary">无</span>
                    )}
                  </div>
                )}
              </GlassCard>

              <GlassCard className="p-4">
                <h3 className="text-sm font-medium text-text-secondary mb-2">备注</h3>
                {isEditing ? (
                  <textarea
                    value={(editSession.notes as string) || selectedSession.notes}
                    onChange={(e) => handleEditChange('notes', e.target.value)}
                    placeholder="记录练习感受..."
                    rows={3}
                    className="w-full px-4 py-3 bg-bg-input border border-border-default rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                ) : (
                  <p className="text-text-secondary">{selectedSession.notes || '无备注'}</p>
                )}
              </GlassCard>

              {selectedSession.aiFeedback && (
                <GlassCard className="p-4">
                  <h3 className="text-sm font-medium text-text-secondary mb-2">AI 反馈</h3>
                  <p className="text-sm text-text-primary">{selectedSession.aiFeedback.summary}</p>
                </GlassCard>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
