import { useState } from 'react';
import { Sparkles, Guitar, Music, Star, Zap, ChevronRight, X } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDemo: () => void;
  onSelectInstrument: (instrument: string) => void;
  onSelectLevel: (level: string) => void;
}

const instruments = [
  { id: 'electric', name: '电吉他', icon: '⚡', color: 'amber', desc: '推弦、揉弦、速弹' },
  { id: 'acoustic', name: '木吉他', icon: '🎸', color: 'mint', desc: '指弹、弹唱、编曲' },
  { id: 'ukulele', name: '尤克里里', icon: '🎵', color: 'lavender', desc: '小四和弦、夏威夷风格' },
];

const levels = [
  { id: 'beginner', name: '新手入门', desc: '刚接触乐器，基础练习' },
  { id: 'intermediate', name: '进阶学习', desc: '有基础，想系统提升' },
  { id: 'advanced', name: '高手精进', desc: '有经验，突破瓶颈' },
];

export function OnboardingModal({ isOpen, onClose, onLoadDemo, onSelectInstrument, onSelectLevel }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleInstrumentSelect = (id: string) => {
    setSelectedInstrument(id);
    onSelectInstrument(id);
  };

  const handleLevelSelect = (id: string) => {
    setSelectedLevel(id);
    onSelectLevel(id);
  };

  const handleStartDemo = () => {
    onLoadDemo();
    onClose();
  };

  const totalSteps = 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <GlassCard elevated className="w-full max-w-md p-6 relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-primary-light transition-colors text-text-tertiary hover:text-text-secondary"
        >
          <X size={18} />
        </button>

        <div className="flex justify-center gap-2 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i + 1 <= step ? 'w-8 bg-primary' : 'w-2 bg-primary-light'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow">
              <Sparkles size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-text-primary">欢迎来到 RiffCoach</h2>
            <p className="text-text-secondary">
              把喜欢的歌，拆成每天能练的任务。
            </p>
            <p className="text-sm text-text-tertiary">
              每天只有 20 分钟，也能离你的 cover 目标更近一步。
            </p>
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-soft/20 flex items-center justify-center">
                  <Zap size={20} className="text-amber-soft" />
                </div>
                <p className="text-xs font-medium text-text-primary">AI 计划</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-mint/20 flex items-center justify-center">
                  <Music size={20} className="text-mint" />
                </div>
                <p className="text-xs font-medium text-text-primary">视频学习</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-lavender/20 flex items-center justify-center">
                  <Star size={20} className="text-lavender" />
                </div>
                <p className="text-xs font-medium text-text-primary">周复盘</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-text-primary mb-2">选择你的乐器</h2>
              <p className="text-sm text-text-tertiary">我们会为你推荐适合的练习内容</p>
            </div>
            <div className="space-y-3">
              {instruments.map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => handleInstrumentSelect(inst.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedInstrument === inst.id
                      ? 'bg-primary text-white shadow-glow scale-[1.02]'
                      : 'bg-primary-light hover:bg-primary-subtle text-text-secondary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{inst.icon}</span>
                    <div>
                      <p className="font-bold">{inst.name}</p>
                      <p className={`text-xs ${selectedInstrument === inst.id ? 'text-white/80' : 'text-text-tertiary'}`}>
                        {inst.desc}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-text-primary mb-2">你的水平是？</h2>
              <p className="text-sm text-text-tertiary">AI 会根据你的水平调整练习难度</p>
            </div>
            <div className="space-y-3">
              {levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => handleLevelSelect(level.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedLevel === level.id
                      ? 'bg-primary text-white shadow-glow scale-[1.02]'
                      : 'bg-primary-light hover:bg-primary-subtle text-text-secondary'
                  }`}
                >
                  <p className="font-bold">{level.name}</p>
                  <p className={`text-xs ${selectedLevel === level.id ? 'text-white/80' : 'text-text-tertiary'}`}>
                    {level.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-5 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-mint to-mint-dark flex items-center justify-center shadow-glow">
              <Guitar size={40} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-2">准备好开始了吗？</h2>
              <p className="text-sm text-text-tertiary">
                加载演示数据，一键体验完整功能
              </p>
            </div>
            <div className="bg-primary-light rounded-xl p-4 text-left space-y-2">
              <p className="text-sm font-medium text-text-primary">演示内容包括：</p>
              <ul className="text-xs text-text-secondary space-y-1">
                <li>• 1 首 Demo Song Cover 项目</li>
                <li>• 12 个视频教程资源</li>
                <li>• 7 天练习历史记录</li>
                <li>• AI 练习计划生成</li>
                <li>• 完整的练习工具和周复盘</li>
              </ul>
            </div>
            <button
              onClick={handleStartDemo}
              className="btn-primary w-full text-base py-3 flex items-center justify-center gap-2"
            >
              开始体验
              <ChevronRight size={18} />
            </button>
            <button
              onClick={onClose}
              className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
            >
              先自己看看
            </button>
          </div>
        )}

        {step < 4 && (
          <div className="mt-6 flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-secondary flex-1"
              >
                上一步
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={step === 2 && !selectedInstrument || step === 3 && !selectedLevel}
              className={`flex-1 flex items-center justify-center gap-1 ${
                (step === 2 && !selectedInstrument) || (step === 3 && !selectedLevel)
                  ? 'btn-secondary opacity-50 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {step === 3 ? '完成' : '下一步'}
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
