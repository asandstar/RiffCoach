import { ArrowLeft, TrendingUp, AlertTriangle, Target, Calendar } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { useAppStore } from '@/store/useAppStore';
import type { PageType } from '@/types';

interface AIFeedbackPageProps {
  onPageChange: (page: PageType) => void;
}

export function AIFeedbackPage({ onPageChange }: AIFeedbackPageProps) {
  const { sessions, coverProjects } = useAppStore();
  
  const recentSession = sessions.sort((a, b) => b.date - a.date)[0];
  const feedback = recentSession?.aiFeedback;
  
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

      <GlassCard elevated className="p-6">
        <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
          <Target size={20} className="text-primary" />
          今日总结
        </h2>
        <p className="text-text-secondary leading-relaxed">{feedback.summary}</p>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <p className="text-sm text-text-tertiary mb-1">尝试 BPM</p>
          <p className="text-3xl font-bold text-text-primary">{feedback.triedBPM}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-sm text-text-tertiary mb-1">最高干净 BPM</p>
          <p className="text-3xl font-bold text-primary">{feedback.cleanBPM}</p>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
          <TrendingUp size={20} className="text-mint" />
          可能原因
        </h2>
        <p className="text-text-secondary">{feedback.reason}</p>
      </GlassCard>

      <GlassCard className="p-5">
        <h2 className="text-lg font-bold text-text-primary mb-3">下次练习计划</h2>
        <div className="space-y-2">
          {feedback.nextSteps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 bg-primary-subtle rounded-lg">
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
