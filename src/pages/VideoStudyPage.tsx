import { useState } from 'react';
import { ArrowLeft, Play, BookOpen, TrendingUp, AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { VideoPlayerCard } from '@/components/VideoPlayerCard';
import { useAppStore } from '@/store/useAppStore';
import type { PageType } from '@/types';

interface VideoStudyPageProps {
  onPageChange: (page: PageType) => void;
}

export function VideoStudyPage({ onPageChange }: VideoStudyPageProps) {
  const { videoResources, recentResources, coverProjects } = useAppStore();
  const [currentPage, setCurrentPage] = useState(1);

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
          <h1 className="text-xl font-bold text-text-primary">{video.title}</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs chip chip-primary">{video.source === 'bilibili' ? 'B站' : 'YouTube'}</span>
            <span className="text-xs text-text-tertiary">{video.stage}</span>
          </div>
        </div>
      </div>

      <VideoPlayerCard
        bvid={video.bvid || ''}
        page={currentPage}
        onPageChange={setCurrentPage}
        title={video.title}
        customEpisodes={video.episodes?.map((e) => ({ page: e.page, title: e.title }))}
      />

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
          onClick={() => onPageChange('practice')}
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
    </div>
  );
}
