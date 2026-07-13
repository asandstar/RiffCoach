import { useState } from 'react';
import { Search, Plus, Play, Sparkles, Clock, Tag, FileText, BookOpen, Music } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { useAppStore } from '@/store/useAppStore';
import { analyzeMaterial } from '@/utils/aiMock';
import type { PageType, Instrument } from '@/types';

interface ResourcePageProps {
  onPageChange: (page: PageType) => void;
  onQuickAdd: () => void;
}

export function ResourcePage({ onPageChange, onQuickAdd }: ResourcePageProps) {
  const { materialInbox, videoResources, sources, updateMaterialInbox, addLesson, recentResources, addRecentResource } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'videos' | 'recent' | 'inbox' | 'lessons'>('videos');
  const allLessons = sources.flatMap((s) => s.lessons);

  const filteredVideos = videoResources.filter((v) =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredLessons = allLessons.filter((l) =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAIAnalyze = (materialId: string) => {
    const material = materialInbox.find((m) => m.id === materialId);
    if (!material) return;

    const result = analyzeMaterial({ title: material.title, type: material.type, note: material.note }, useAppStore.getState());
    updateMaterialInbox(materialId, {
      status: 'processed',
      extracted: {
        suggestedTitle: result.suggestedTitle,
        suggestedTags: result.suggestedTags,
        suggestedInstrument: result.suggestedInstrument,
        suggestedBPM: result.suggestedBPM,
        suggestedDuration: result.suggestedDuration,
        suggestedTasks: result.suggestedTasks,
      },
    });

    alert('AI 分析完成，已更新素材状态');
  };

  const handleConvertToLessons = (materialId: string) => {
    const material = materialInbox.find((m) => m.id === materialId);
    if (!material?.extracted) return;

    const extracted = material.extracted;
    const demoSource = sources.find((s) => s.name === 'Demo Song Tutorial') || sources[0];

    extracted.suggestedTasks.forEach((task) => {
      addLesson(demoSource.id, {
        title: task.title,
        targetBPM: task.targetBPM,
        tags: task.tags,
        instrument: extracted.suggestedInstrument as Instrument,
        targetDuration: task.targetDuration,
        bvid: material.bvid || undefined,
        projectId: material.coverProjectId || undefined,
        sectionId: material.sectionId || undefined,
      });
    });

    updateMaterialInbox(materialId, { status: 'converted' });
    alert('已转换为练习任务');
  };

  const handleVideoClick = (video: typeof videoResources[0]) => {
    addRecentResource('video', video.id);
    onPageChange('video-study');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-text-primary">资料中心</h1>
        <button
          onClick={onQuickAdd}
          className="p-2 bg-primary text-white rounded-full shadow-glow hover:scale-105 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="粘贴 B站 / YouTube 链接，或搜索：爬格子、交替拨弦、五声音阶..."
          className="w-full pl-11 pr-4 py-3 bg-bg-input border border-border-default rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'videos' as const, label: '视频教程', icon: Play },
          { id: 'recent' as const, label: '最近使用', icon: Clock },
          { id: 'inbox' as const, label: '素材篮', icon: FileText },
          { id: 'lessons' as const, label: '已整理练习', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-glow'
                  : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'recent' && (
        <div className="space-y-4">
          {recentResources.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Clock size={32} className="text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">还没有最近使用的资源</p>
              <button onClick={() => setActiveTab('videos')} className="btn-secondary mt-4">
                浏览视频教程
              </button>
            </GlassCard>
          ) : (
            <>
              {recentResources.slice(0, 5).map((r) => {
                const video = videoResources.find((v) => v.id === r.id);
                if (!video) return null;
                return (
                  <GlassCard key={r.id} className="p-4 cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => handleVideoClick(video)}>
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-9 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <Play size={18} className="text-white/70" />
                        {video.cover && (
                          <img
                            src={video.cover}
                            alt={video.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(event) => { event.currentTarget.style.display = 'none'; }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-text-primary truncate">{video.title}</h3>
                        {video.owner && <p className="text-xs text-text-tertiary truncate">UP 主：{video.owner}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-text-tertiary">{video.stage}</span>
                          <div className="flex gap-1">
                            {video.skills.slice(0, 2).map((skill) => (
                              <span key={skill} className="text-xs chip chip-primary">{skill}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-text-tertiary">
                        {new Date(r.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </GlassCard>
                );
              })}
            </>
          )}
        </div>
      )}

      {activeTab === 'inbox' && (
        <div className="space-y-4">
          {materialInbox.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <FileText size={32} className="text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">素材篮是空的</p>
              <button onClick={onQuickAdd} className="btn-secondary mt-4">
                添加资料
              </button>
            </GlassCard>
          ) : (
            materialInbox.map((material) => (
              <GlassCard key={material.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary">{material.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs chip ${
                        material.status === 'unprocessed' ? 'chip-warning' :
                        material.status === 'processed' ? 'chip-info' : 'chip-success'
                      }`}>
                        {material.status === 'unprocessed' ? '未整理' :
                         material.status === 'processed' ? '已整理' : '已转为练习'}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {material.type === 'bilibili' ? 'B站' :
                         material.type === 'youtube' ? 'YouTube' :
                         material.type === 'score' ? '曲谱' :
                         material.type === 'book' ? '教程书' :
                         material.type === 'note' ? '笔记' : '其他'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {material.note && (
                  <p className="text-sm text-text-secondary mb-3">{material.note}</p>
                )}

                {material.extracted && (
                  <div className="bg-primary-subtle rounded-lg p-3 mb-3">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {material.extracted.suggestedTags.map((tag) => (
                        <span key={tag} className="text-xs chip chip-primary">{tag}</span>
                      ))}
                    </div>
                    <p className="text-xs text-text-secondary">
                      建议 BPM: {material.extracted.suggestedBPM} | 建议时长: {material.extracted.suggestedDuration}分钟
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {material.status === 'unprocessed' && (
                    <button
                      onClick={() => handleAIAnalyze(material.id)}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
                    >
                      <Sparkles size={16} />
                      AI 整理
                    </button>
                  )}
                  {material.status === 'processed' && (
                    <button
                      onClick={() => handleConvertToLessons(material.id)}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
                    >
                      <Plus size={16} />
                      转为练习任务
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const matchedVideo = material.bvid
                        ? videoResources.find((v) => v.bvid === material.bvid)
                        : videoResources[0];
                      if (matchedVideo) {
                        addRecentResource('video', matchedVideo.id);
                      }
                      onPageChange('video-study');
                    }}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
                  >
                    <Play size={16} />
                    播放
                  </button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="space-y-4">
          {filteredVideos.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Play size={32} className="text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">没有找到相关视频</p>
            </GlassCard>
          ) : (
            filteredVideos.map((video) => (
              <GlassCard
                key={video.id}
                className="p-4 cursor-pointer hover:shadow-elevated transition-shadow"
                onClick={() => handleVideoClick(video)}
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-32 h-20 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <Play size={28} className="text-white/70" />
                    {video.cover && (
                      <img
                        src={video.cover}
                        alt={video.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(event) => { event.currentTarget.style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-primary line-clamp-2">{video.title}</h3>
                    {video.owner && <p className="text-xs text-text-tertiary mt-1">UP 主：{video.owner}</p>}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs chip chip-primary">
                        {video.instrument === 'electric' ? '电吉他' : video.instrument === 'acoustic' ? '木吉他' : '尤克里里'}
                      </span>
                      <span className="text-xs chip chip-success">{video.stage}</span>
                      <span className="text-xs text-text-tertiary">
                        难度 {'★'.repeat(video.difficulty)}{'☆'.repeat(5 - video.difficulty)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-2 line-clamp-2">{video.summary}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {video.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="text-xs chip chip-primary">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}

      {activeTab === 'lessons' && (
        <div className="space-y-4">
          {filteredLessons.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <BookOpen size={32} className="text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">还没有整理的练习任务</p>
              <button onClick={onQuickAdd} className="btn-secondary mt-4">
                添加资料并整理
              </button>
            </GlassCard>
          ) : (
            filteredLessons.map((lesson) => (
              <GlassCard key={lesson.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-text-primary">{lesson.title}</h3>
                  <span className="text-sm font-semibold text-primary">{lesson.targetBPM} BPM</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs chip chip-primary">
                      {lesson.instrument === 'electric' ? '电吉他' : lesson.instrument === 'acoustic' ? '木吉他' : '尤克里里'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {lesson.tags.map((tag) => (
                        <span key={tag} className="text-xs chip chip-primary">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => onPageChange('practice')}
                    className="flex items-center gap-1 text-primary font-medium text-sm hover:underline"
                  >
                    <Play size={14} />
                    去练习
                  </button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );
}
