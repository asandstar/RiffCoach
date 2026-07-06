import { useState } from 'react';
import { Plus, Play, ChevronRight, X, Sparkles, TrendingUp, AlertTriangle, Music } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { useAppStore } from '@/store/useAppStore';
import type { PageType, Instrument } from '@/types';

interface CoverPageProps {
  onPageChange: (page: PageType) => void;
}

export function CoverPage({ onPageChange }: CoverPageProps) {
  const { coverProjects, addCoverProject, deleteCoverProject, sources, addLesson } = useAppStore();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newProject, setNewProject] = useState<{
    title: string;
    artist: string;
    instrument: Instrument;
    goal: string;
  }>({
    title: '',
    artist: '',
    instrument: 'electric',
    goal: '',
  });

  const handleAddProject = () => {
    if (!newProject.title.trim()) {
      alert('请输入歌曲名称');
      return;
    }

    addCoverProject({
      title: newProject.title.trim(),
      artist: newProject.artist.trim() || '未知',
      instrument: newProject.instrument,
      goal: newProject.goal.trim() || `练习「${newProject.title}」直到流畅完成`,
      targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sourceLinks: [],
      sections: [
        { id: 'sec_intro', name: 'Intro', targetBPM: 80, currentCleanBPM: 0, progress: 0, painPoints: [], lessonIds: [] },
        { id: 'sec_verse', name: 'Verse', targetBPM: 80, currentCleanBPM: 0, progress: 0, painPoints: [], lessonIds: [] },
        { id: 'sec_full', name: 'Full', targetBPM: 85, currentCleanBPM: 0, progress: 0, painPoints: [], lessonIds: [] },
      ],
      aiPlan: {
        summary: '先集中完成 Intro，再进入 Verse，最后做完整串联。',
        nextStep: '今天先从第一段开始练习。',
        estimatedDays: 14,
      },
    });

    setNewProject({ title: '', artist: '', instrument: 'electric', goal: '' });
    setShowAddForm(false);
  };

  const handleAIAnalyze = (projectId: string) => {
    const project = coverProjects.find((p) => p.id === projectId);
    if (!project) return;

    project.sections.forEach((section) => {
      if (section.lessonIds.length === 0) {
        const demoSource = sources.find((s) => s.name === 'Demo Song Tutorial') || sources[0];
        const newLesson = {
          title: `${project.title} - ${section.name}`,
          targetBPM: section.targetBPM,
          tags: ['Cover', section.name],
          instrument: project.instrument,
          targetDuration: 900,
          projectId,
          sectionId: section.id,
        };
        addLesson(demoSource.id, newLesson);
      }
    });

    alert('AI 已拆解练习路径');
  };

  const handleStartSectionPractice = (projectId: string, sectionId: string) => {
    const project = coverProjects.find((p) => p.id === projectId);
    const section = project?.sections.find((s) => s.id === sectionId);
    
    if (section && section.lessonIds.length > 0) {
      onPageChange('practice');
    } else {
      alert('该段落还没有练习任务，请先点击 AI 拆解');
    }
  };

  const selectedProjectData = coverProjects.find((p) => p.id === selectedProject);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">我的 Cover 目标</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="p-2 bg-primary text-white rounded-full shadow-glow hover:scale-105 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <p className="text-text-secondary text-sm">把喜欢的歌，拆成每天能练的任务</p>

      {coverProjects.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
            <Music size={32} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">还没有 Cover 目标</h3>
          <p className="text-text-secondary text-sm mb-4">添加一个你想学会的歌曲，开始你的 cover 之旅</p>
          <button onClick={() => setShowAddForm(true)} className="btn-primary">
            添加 Cover 目标
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {coverProjects.map((project) => {
            const avgProgress = Math.round(project.sections.reduce((acc, s) => acc + s.progress, 0) / project.sections.length);
            const maxCleanBPM = Math.max(...project.sections.map((s) => s.currentCleanBPM));
            const allPainPoints = [...new Set(project.sections.flatMap((s) => s.painPoints))];

            return (
              <GlassCard key={project.id} elevated className="p-5 cursor-pointer hover:shadow-float transition-shadow" onClick={() => setSelectedProject(project.id)}>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {project.title.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text-primary text-lg">{project.title}</h3>
                    <p className="text-text-secondary text-sm">{project.artist} · {project.instrument === 'electric' ? '电吉他' : project.instrument === 'acoustic' ? '木吉他' : '尤克里里'}</p>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-text-tertiary mb-1">
                          <span>总进度</span>
                          <span>{avgProgress}%</span>
                        </div>
                        <div className="h-2 bg-primary-subtle rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${avgProgress}%` }} />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-text-primary">{maxCleanBPM}</p>
                        <p className="text-xs text-text-tertiary">最高 BPM</p>
                      </div>
                    </div>

                    {allPainPoints.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <AlertTriangle size={14} className="text-amber-soft" />
                        <div className="flex flex-wrap gap-1">
                          {allPainPoints.slice(0, 3).map((pain) => (
                            <span key={pain} className="text-xs chip chip-warning">{pain}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <ChevronRight size={20} className="text-text-tertiary" />
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {showAddForm && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[60]" onClick={() => setShowAddForm(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl rounded-t-2xl z-[60] p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">添加 Cover 目标</h2>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-primary-light rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                placeholder="歌曲名称"
                className="w-full px-4 py-3 bg-bg-input border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="text"
                value={newProject.artist}
                onChange={(e) => setNewProject({ ...newProject, artist: e.target.value })}
                placeholder="音乐人"
                className="w-full px-4 py-3 bg-bg-input border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <select
                value={newProject.instrument}
                onChange={(e) => setNewProject({ ...newProject, instrument: e.target.value as Instrument })}
                className="w-full px-4 py-3 bg-bg-input border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="electric">电吉他</option>
                <option value="acoustic">木吉他</option>
                <option value="ukulele">尤克里里</option>
              </select>
              <textarea
                value={newProject.goal}
                onChange={(e) => setNewProject({ ...newProject, goal: e.target.value })}
                placeholder="练习目标（可选）"
                rows={2}
                className="w-full px-4 py-3 bg-bg-input border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              
              <button onClick={handleAddProject} className="btn-primary w-full mt-4">
                添加 Cover 目标
              </button>
            </div>
          </div>
        </>
      )}

      {selectedProjectData && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[60]" onClick={() => setSelectedProject(null)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl rounded-t-2xl z-[60] p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">{selectedProjectData.title}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    deleteCoverProject(selectedProjectData.id);
                    setSelectedProject(null);
                  }}
                  className="p-2 text-state-error hover:bg-state-error-light rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="glass-card p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-secondary">目标</span>
                <span className="text-text-primary font-medium">{selectedProjectData.goal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">预计天数</span>
                <span className="text-text-primary font-medium">{selectedProjectData.aiPlan?.estimatedDays} 天</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">段落进度</h3>
              <div className="space-y-3">
                {selectedProjectData.sections.map((section) => (
                  <GlassCard key={section.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-text-primary">{section.name}</h4>
                        <span className="text-xs chip chip-primary">{section.targetBPM} BPM</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">{section.progress}%</span>
                    </div>
                    
                    <div className="h-2 bg-primary-subtle rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${section.progress}%` }} />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <TrendingUp size={14} className="text-mint" />
                        <span className="text-text-tertiary">最高干净 BPM: {section.currentCleanBPM}</span>
                      </div>
                      <button
                        onClick={() => handleStartSectionPractice(selectedProjectData.id, section.id)}
                        className="flex items-center gap-1 text-primary font-medium hover:underline"
                      >
                        <Play size={14} />
                        练习
                      </button>
                    </div>

                    {section.painPoints.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {section.painPoints.map((pain) => (
                          <span key={pain} className="text-xs chip chip-warning">{pain}</span>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">AI 建议</h3>
              <GlassCard className="p-4">
                <p className="text-text-primary mb-2">{selectedProjectData.aiPlan?.summary}</p>
                <p className="text-sm text-text-secondary">下一步：{selectedProjectData.aiPlan?.nextStep}</p>
              </GlassCard>
            </div>

            <button
              onClick={() => handleAIAnalyze(selectedProjectData.id)}
              className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
            >
              <Sparkles size={18} />
              AI 拆解练习路径
            </button>

            <button
              onClick={() => onPageChange('practice')}
              className="btn-secondary w-full"
            >
              继续练习
            </button>
          </div>
        </>
      )}
    </div>
  );
}
