import { useState, useEffect } from 'react';
import { Sparkles, Play, Plus, BookOpen, Zap, Clock, Target, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { AILoading } from '@/components/AILoading';
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [displayTarget, setDisplayTarget] = useState('');
  const [displayReason, setDisplayReason] = useState('');
  const [typedStep, setTypedStep] = useState(0);

  const currentProject = coverProjects[0];
  const recentSession = sessions.sort((a, b) => b.date - a.date)[0];

  const recentVideo = recentResources
    .filter((r) => r.type === 'video')
    .map((r) => videoResources.find((v) => v.id === r.id))
    .filter(Boolean)[0];

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setShowPlan(false);
    setDisplayTarget('');
    setDisplayReason('');
    setTypedStep(0);

    setTimeout(() => {
      const plan = generateEfficientPracticePlan(
        { coverProjects, sessions, sources: [], knowledgeBase: { categories: [], items: [], videos: [], favorites: [] }, materialInbox: [], videoResources, recentResources, favoriteResources: [], instruments: [], painPointOptions: [], currentEfficientPlan: null, videoSize: 'compact' },
        selectedTime,
        selectedEnergy
      );
      setCurrentEfficientPlan(plan);
      setIsGenerating(false);
      setShowPlan(true);

      let targetIdx = 0;
      const targetInterval = setInterval(() => {
        if (targetIdx <= plan.target.length) {
          setDisplayTarget(plan.target.slice(0, targetIdx));
          targetIdx++;
        } else {
          clearInterval(targetInterval);
        }
      }, 40);

      setTimeout(() => {
        let reasonIdx = 0;
        const reasonInterval = setInterval(() => {
          if (reasonIdx <= plan.reason.length) {
            setDisplayReason(plan.reason.slice(0, reasonIdx));
            reasonIdx++;
          } else {
            clearInterval(reasonInterval);
          }
        }, 25);
      }, 600);

      setTimeout(() => {
        let stepIdx = 0;
        const stepInterval = setInterval(() => {
          if (stepIdx <= plan.steps.length) {
            setTypedStep(stepIdx);
            stepIdx++;
          } else {
            clearInterval(stepInterval);
          }
        }, 300);
      }, 1200);
    }, 1500);
  };

  const handleStartPractice = () => {
    onPageChange('practice');
  };

  useEffect(() => {
    if (currentEfficientPlan && showPlan) {
      setDisplayTarget(currentEfficientPlan.target);
      setDisplayReason(currentEfficientPlan.reason);
      setTypedStep(currentEfficientPlan.steps.length);
    }
  }, []);

  return (
    <div className="space-y-6">
      <GlassCard elevated className="p-6 text-center overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-mint to-amber-soft" />
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow animate-float">
          <Sparkles size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary via-mint to-amber-soft bg-clip-text text-transparent mb-2">
          RiffCoach
        </h1>
        <p className="text-text-secondary mb-3 font-medium">每天 20 分钟，离你的 cover 更近一步</p>
        <p className="text-sm text-text-tertiary mb-5">
          AI 智能分析你的目标、时间和卡点，生成最小有效练习计划
        </p>
        
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock size={16} className="text-primary" />
            </div>
            <p className="text-xs text-text-secondary">选时间</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-mint/15 flex items-center justify-center">
              <Sparkles size={16} className="text-mint" />
            </div>
            <p className="text-xs text-text-secondary">AI 生成</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-amber-soft/15 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-amber-soft" />
            </div>
            <p className="text-xs text-text-secondary">开练</p>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('加载演示数据将覆盖当前数据，确定继续吗？')) {
              loadDemoData();
            }
          }}
          className="btn-primary w-full mb-3"
        >
          加载演示数据，一键体验
        </button>
        <button
          onClick={() => onPageChange('resource')}
          className="btn-secondary w-full"
        >
          浏览视频教程
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

      {isGenerating && (
        <GlassCard elevated className="p-8">
          <AILoading text="AI 正在为你定制练习计划..." size="lg" />
        </GlassCard>
      )}

      {showPlan && currentEfficientPlan && !isGenerating && (
        <GlassCard elevated className="p-5 animate-fade-in">
          <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-primary animate-pulse" />
            今日最小有效目标
          </h2>
          <p className="text-primary font-semibold mb-4 min-h-[1.5rem]">
            {displayTarget}
            {displayTarget.length < currentEfficientPlan.target.length && (
              <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
            )}
          </p>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium text-text-secondary mb-2">为什么今天练这个</h3>
            <p className="text-sm text-text-primary min-h-[2.5rem]">
              {displayReason}
              {displayReason.length < currentEfficientPlan.reason.length && displayReason.length > 0 && (
                <span className="inline-block w-0.5 h-3 bg-primary ml-0.5 animate-pulse" />
              )}
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-text-secondary mb-2">练习步骤</h3>
            <div className="space-y-2">
              {currentEfficientPlan.steps.slice(0, typedStep).map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-primary-subtle rounded-lg animate-fade-in">
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
