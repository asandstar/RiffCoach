import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, AlertTriangle, Target, Calendar, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { AILoading } from '@/components/AILoading';
import { useAppStore } from '@/store/useAppStore';
import type { PageType } from '@/types';

interface AIFeedbackPageProps {
  onPageChange: (page: PageType) => void;
}

export function AIFeedbackPage({ onPageChange }: AIFeedbackPageProps) {
  const { sessions, coverProjects } = useAppStore();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [displaySummary, setDisplaySummary] = useState('');
  const [displayReason, setDisplayReason] = useState('');
  const [visibleSteps, setVisibleSteps] = useState(0);
  
  const recentSession = sessions.sort((a, b) => b.date - a.date)[0];
  const feedback = recentSession?.aiFeedback;

  useEffect(() => {
    if (!feedback) {
      setIsAnalyzing(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsAnalyzing(false);

      let sumIdx = 0;
      const sumInterval = setInterval(() => {
        if (sumIdx <= feedback.summary.length) {
          setDisplaySummary(feedback.summary.slice(0, sumIdx));
          sumIdx++;
        } else {
          clearInterval(sumInterval);
        }
      }, 25);

      setTimeout(() => {
        let reasonIdx = 0;
        const reasonInterval = setInterval(() => {
          if (reasonIdx <= feedback.reason.length) {
            setDisplayReason(feedback.reason.slice(0, reasonIdx));
            reasonIdx++;
          } else {
            clearInterval(reasonInterval);
          }
        }, 20);
      }, 800);

      setTimeout(() => {
        let stepIdx = 0;
        const stepInterval = setInterval(() => {
          if (stepIdx <= feedback.nextSteps.length) {
            setVisibleSteps(stepIdx);
            stepIdx++;
          } else {
            clearInterval(stepInterval);
          }
        }, 300);
      }, 1500);
    }, 1000);

    return () => clearTimeout(timer);
  }, [feedback]);

  if (!feedback) {
    return (
      <div className="glass-card p-8 text-center">
        <Target size={32} className="text-text-tertiary mx-auto mb-4" />
        <p className="text-text-secondary">暂无练习反馈</p>
        <button onClick={() => onPageChange('practice')} className="btn-secondary mt-4">
          开始练习
        </button>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => onPageChange('today')}
            className="p-2 hover:bg-primary-light rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-text-primary">AI 练后反馈</h1>
        </div>
        <GlassCard elevated className="p-10">
          <AILoading text="AI 正在分析你的练习数据..." size="lg" />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => onPageChange('today')}
          className="p-2 hover:bg-primary-light rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <Sparkles size={20} className="text-primary" />
          AI 练后反馈
        </h1>
      </div>

      <GlassCard elevated className="p-6 animate-fade-in">
        <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
          <Target size={20} className="text-primary" />
          今日总结
        </h2>
        <p className="text-text-secondary leading-relaxed min-h-[3rem]">
          {displaySummary}
          {displaySummary.length < feedback.summary.length && displaySummary.length > 0 && (
            <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
          )}
        </p>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <GlassCard className="p-5">
          <p className="text-sm text-text-tertiary mb-1">尝试 BPM</p>
          <p className="text-3xl font-bold text-text-primary">{feedback.triedBPM}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-sm text-text-tertiary mb-1">最高干净 BPM</p>
          <p className="text-3xl font-bold text-primary">{feedback.cleanBPM}</p>
        </GlassCard>
      </div>

      <GlassCard className="p-5 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
          <TrendingUp size={20} className="text-mint" />
          可能原因
        </h2>
        <p className="text-text-secondary min-h-[2.5rem]">
          {displayReason}
          {displayReason.length < feedback.reason.length && displayReason.length > 0 && (
            <span className="inline-block w-0.5 h-3 bg-primary ml-0.5 animate-pulse" />
          )}
        </p>
      </GlassCard>

      <GlassCard className="p-5 animate-fade-in" style={{ animationDelay: '600ms' }}>
        <h2 className="text-lg font-bold text-text-primary mb-3">下次练习计划</h2>
        <div className="space-y-2">
          {feedback.nextSteps.slice(0, visibleSteps).map((step, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 bg-primary-subtle rounded-lg animate-fade-in">
              <span className="w-6 h-6 flex items-center justify-center bg-primary text-white text-xs rounded-full font-semibold">
                {idx + 1}
              </span>
              <span className="text-sm text-text-primary">{step}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {feedback.avoid.length > 0 && (
        <GlassCard className="p-5">
          <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-soft" />
            今天不建议做什么
          </h2>
          <div className="flex flex-wrap gap-2">
            {feedback.avoid.map((item, idx) => (
              <span key={idx} className="chip chip-warning">{item}</span>
            ))}
          </div>
        </GlassCard>
      )}

      {feedback.coverUpdate && (
        <GlassCard className="p-5">
          <h2 className="text-lg font-bold text-text-primary mb-3">Cover 进度更新</h2>
          <p className="text-text-secondary">{feedback.coverUpdate}</p>
        </GlassCard>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => onPageChange('practice')}
          className="flex-1 btn-secondary"
        >
          继续练习
        </button>
        <button
          onClick={() => onPageChange('review')}
          className="flex-1 btn-primary flex items-center justify-center gap-2"
        >
          <Calendar size={18} />
          查看周复盘
        </button>
      </div>
    </div>
  );
}
