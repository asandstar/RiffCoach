import { useState } from 'react';
import { Sparkles, Play, Plus, BookOpen, Zap } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { useAppStore } from '@/store/useAppStore';
import { generateEfficientPracticePlan } from '@/utils/aiMock';
import type { PageType } from '@/types';

interface TodayPageProps {
  onPageChange: (page: PageType) => void;
  onQuickAdd: () => void;
}

const timeOptions = [10, 20, 30, 45];
const energyOptions = ['精力很好', '一般', '很累', '手指酸', '只想轻松复习'];

export function TodayPage({ onPageChange, onQuickAdd }: TodayPageProps) {
  const { coverProjects, sessions, currentEfficientPlan, setCurrentEfficientPlan, videoResources, recentResources, loadDemoData } = useAppStore();
  
  const [selectedTime, setSelectedTime] = useState(20);
  const [selectedEnergy, setSelectedEnergy] = useState('一般');
  const [showPlan, setShowPlan] = useState(!!currentEfficientPlan);

  const currentProject = coverProjects[0];
  const recentSession = sessions.sort((a, b) => b.date - a.date)[0];

  const recentVideo = recentResources
    .filter((r) => r.type === 'video')
    .map((r) => videoResources.find((v) => v.id === r.id))
    .filter(Boolean)[0];

  const handleGeneratePlan = () => {
    const plan = generateEfficientPracticePlan(
      { coverProjects, sessions, sources: [], knowledgeBase: { categories: [], items: [], videos: [], favorites: [] }, materialInbox: [], videoResources, recentResources, favoriteResources: [], instruments: [], painPointOptions: [], currentEfficientPlan: null, videoSize: 'compact' },
      selectedTime,
      selectedEnergy
    );
    setCurrentEfficientPlan(plan);
    setShowPlan(true);
  };

  const handleStartPractice = () => {
    onPageChange('practice');
  };

  return (
    <div className="space-y-6">
      <GlassCard elevated className="p-6 text-center">
        <h1 className="text-2xl font-extrabold text-text-primary mb-2">RiffCoach</h1>
        <p className="text-text-secondary mb-4">从喜欢的歌，到第一支 cover</p>
        <p className="text-sm text-text-tertiary mb-6">
          AI 会根据你的 cover 目标、今日可用时间、练习历史和反复卡点，生成最小有效练习计划
        </p>
        <button
          onClick={() => {
            if (confirm('加载演示数据将覆盖当前数据，确定继续吗？')) {
              loadDemoData();
            }
          }}
          className="btn-primary w-full mb-3"
        >
          加载演示数据
        </button>
        <button
          onClick={() => onPageChange('resource')}
          className="btn-secondary w-full"
        >
          开始 20 分钟高效练习
        </button>
      </GlassCard>

      <GlassCard className="p-5">
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <Zap size={20} className="text-amber-soft" />
          今天有多少时间？
        </h2>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {timeOptions.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedTime === time
                  ? 'bg-primary text-white shadow-glow'
                  : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
              }`}
            >
              {time} 分钟
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {energyOptions.map((energy) => (
            <button
              key={energy}
              onClick={() => setSelectedEnergy(energy)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedEnergy === energy
                  ? 'bg-primary text-white'
                  : 'bg-primary-subtle text-text-tertiary hover:bg-primary-light'
              }`}
            >
              {energy}
            </button>
          ))}
        </div>

        <button
          onClick={handleGeneratePlan}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Sparkles size={18} />
          生成今日计划
        </button>
      </GlassCard>

      {showPlan && currentEfficientPlan && (
        <GlassCard elevated className="p-5 fade-in">
          <h2 className="text-lg font-bold text-text-primary mb-3">今日最小有效目标</h2>
          <p className="text-primary font-semibold mb-4">{currentEfficientPlan.target}</p>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium text-text-secondary mb-2">为什么今天练这个</h3>
            <p className="text-sm text-text-primary">{currentEfficientPlan.reason}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-text-secondary mb-2">练习步骤</h3>
            <div className="space-y-2">
              {currentEfficientPlan.steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-primary-subtle rounded-lg">
                  <span className="w-6 h-6 flex items-center justify-center bg-primary text-white text-xs rounded-full font-semibold">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <span className="text-sm text-text-primary">{step.desc}</span>
                    {step.bpm > 0 && (
                      <span className="ml-2 text-xs chip chip-primary">{step.bpm} BPM</span>
                    )}
                    <span className="ml-1 text-xs text-text-tertiary">({step.duration}分钟)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {currentEfficientPlan.avoid.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-text-secondary mb-2">今天不建议做什么</h3>
              <div className="flex flex-wrap gap-2">
                {currentEfficientPlan.avoid.map((item, idx) => (
                  <span key={idx} className="chip chip-warning">{item}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-5">
            <h3 className="text-sm font-medium text-text-secondary mb-2">完成标准</h3>
            <p className="text-sm text-text-primary">{currentEfficientPlan.completion}</p>
          </div>

          <button
            onClick={handleStartPractice}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Play size={18} />
            一键开始练习
          </button>
        </GlassCard>
      )}

      {currentProject && (
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <BookOpen size={20} className="text-lavender" />
              当前 Cover 目标
            </h2>
            <button
              onClick={() => onPageChange('cover')}
              className="text-sm text-primary font-medium hover:underline"
            >
              查看
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
              {currentProject.title.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary">{currentProject.title}</h3>
              <p className="text-sm text-text-tertiary">{currentProject.artist}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-2 bg-primary-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(currentProject.sections.reduce((acc, s) => acc + s.progress, 0) / currentProject.sections.length)}%` }}
                  />
                </div>
                <span className="text-xs text-text-tertiary">
                  {Math.round(currentProject.sections.reduce((acc, s) => acc + s.progress, 0) / currentProject.sections.length)}%
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => onPageChange('practice')}
            className="btn-secondary w-full mt-4"
          >
            继续练习
          </button>
        </GlassCard>
      )}

      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Plus size={20} className="text-mint" />
            刚看到一个教程？
          </h2>
        </div>
        <button
          onClick={onQuickAdd}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          快速添加资料
        </button>
      </GlassCard>

      {recentVideo && (
        <GlassCard className="p-5">
          <h2 className="text-lg font-bold text-text-primary mb-3">继续看上次的视频</h2>
          <div className="flex items-center gap-4">
            <div className="w-20 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
              <Play size={24} className="text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text-primary truncate">{recentVideo.title}</h3>
              <p className="text-sm text-text-tertiary">上次看到 P{recentVideo.episodes?.[0]?.page || 1}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {recentVideo.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="text-xs chip chip-primary">{skill}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => onPageChange('video-study')} className="flex-1 btn-secondary">继续观看</button>
            <button onClick={() => onPageChange('resource')} className="flex-1 btn-primary">加入今日计划</button>
          </div>
        </GlassCard>
      )}

      {recentSession && (
        <GlassCard className="p-5">
          <h2 className="text-lg font-bold text-text-primary mb-3">最近练习</h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">上次练习</span>
            <span className="text-text-primary font-medium">{new Date(recentSession.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{Math.round(recentSession.durationSeconds / 60)}</p>
              <p className="text-xs text-text-tertiary">分钟</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{recentSession.bpm}</p>
              <p className="text-xs text-text-tertiary">BPM</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-soft">{recentSession.selfRating}</p>
              <p className="text-xs text-text-tertiary">自评</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
