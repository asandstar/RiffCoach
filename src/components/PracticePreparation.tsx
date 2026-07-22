import { useState } from 'react';
import { Check, Gauge, Music2, SkipForward } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import type { Instrument } from '@/types';

interface PracticePreparationProps {
  instrument: Instrument;
  suggestedBpm: number;
  onReady: (options: { tuningCompleted: boolean; startWithMetronome: boolean }) => void;
}

const tuningByInstrument: Record<Instrument, string> = {
  electric: 'E · A · D · G · B · E',
  acoustic: 'E · A · D · G · B · E',
  ukulele: 'G · C · E · A',
};

const instrumentNames: Record<Instrument, string> = {
  electric: '电吉他',
  acoustic: '木吉他',
  ukulele: '尤克里里',
};

export function PracticePreparation({ instrument, suggestedBpm, onReady }: PracticePreparationProps) {
  const [tuningCompleted, setTuningCompleted] = useState<boolean | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  return (
    <GlassCard elevated className="p-6 space-y-5">
      <div>
        <p className="text-sm text-text-tertiary mb-1">练习前准备</p>
        <h2 className="text-xl font-bold text-text-primary">先确认调音，再开始练习</h2>
      </div>

      <div className="p-4 bg-primary-subtle rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Music2 size={18} className="text-primary" />
          <span className="font-semibold text-text-primary">{instrumentNames[instrument]}标准调音</span>
        </div>
        <p className="text-2xl font-bold tracking-wider text-primary">{tuningByInstrument[instrument]}</p>
      </div>

      {showGuide && (
        <div className="p-4 border border-primary/20 rounded-xl text-sm text-text-secondary space-y-2">
          <p>使用实体调音器或手机调音工具，从最粗弦到最细弦依次校准。</p>
          <p>每根弦调好后再整体复查一次；本阶段不调用麦克风，也不会自动判断音高。</p>
        </div>
      )}

      {tuningCompleted === null ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button onClick={() => setTuningCompleted(true)} className="btn-primary flex items-center justify-center gap-2">
            <Check size={16} />已调音
          </button>
          <button onClick={() => setShowGuide((value) => !value)} className="btn-secondary">
            查看指引
          </button>
          <button onClick={() => setTuningCompleted(false)} className="btn-secondary flex items-center justify-center gap-2">
            <SkipForward size={16} />暂时跳过
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-mint/10 rounded-xl">
            <div className="flex items-center gap-2 text-text-secondary">
              <Gauge size={18} className="text-mint" />本次建议 BPM
            </div>
            <span className="text-2xl font-bold text-primary">{suggestedBpm}</span>
          </div>
          <p className="text-sm text-text-secondary">选择开始方式</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onReady({ tuningCompleted, startWithMetronome: true })}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <span aria-hidden>♪</span>开启节拍器
            </button>
            <button
              onClick={() => onReady({ tuningCompleted, startWithMetronome: false })}
              className="btn-secondary"
            >
              先熟悉动作
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
