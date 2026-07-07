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
          <div className="text-center space-y-6 animate-fade-in-up">
            <div className="relative">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary via-mint to-amber-soft flex items-center justify-center shadow-glow animate-float">
                <Sparkles size={48} className="text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-soft flex items-center justify-center animate-bounce">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary via-mint to-amber-soft bg-clip-text text-transparent mb-2">
                欢迎来到 RiffCoach
              </h2>
              <p className="text-text-secondary">
                把喜欢的歌，拆成每天能练的任务。
              </p>
              <p className="text-sm text-text-tertiary mt-2">
                每天只有 20 分钟，也能离你的 cover 目标更近一步。
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center group">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-soft/15 flex items-center justify-center group-hover:bg-amber-soft/25 transition-all duration-300 group-hover:scale-110">
                  <Zap size={24} className="text-amber-soft" />
                </div>
                <p className="text-xs font-medium text-text-primary">AI 计划</p>
              </div>
              <div className="text-center group">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-mint/15 flex items-center justify-center group-hover:bg-mint/25 transition-all duration-300 group-hover:scale-110">
                  <Music size={24} className="text-mint" />
                </div>
                <p className="text-xs font-medium text-text-primary">视频学习</p>
              </div>
              <div className="text-center group">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-lavender/15 flex items-center justify-center group-hover:bg-lavender/25 transition-all duration-300 group-hover:scale-110">
                  <Star size={24} className="text-lavender" />
                </div>
                <p className="text-xs font-medium text-text-primary">周复盘</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-text-primary mb-2">选择你的乐器</h2>
              <p className="text-sm text-text-tertiary">我们会为你推荐适合的练习内容</p>
            </div>
            <div className="space-y-3">
              {instruments.map((inst, idx) => (
                <button
                  key={inst.id}
                  onClick={() => handleInstrumentSelect(inst.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                    selectedInstrument === inst.id
                      ? 'bg-primary text-white shadow-glow scale-[1.02]'
                      : 'bg-primary-light hover:bg-primary-subtle text-text-secondary hover:scale-[1.01]'
                  }`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{inst.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-lg">{inst.name}</p>
                      <p className={`text-xs ${selectedInstrument === inst.id ? 'text-white/80' : 'text-text-tertiary'}`}>
                        {inst.desc}
                      </p>
                    </div>
                    {selectedInstrument === inst.id && (
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-text-primary mb-2">你的水平是？</h2>
              <p className="text-sm text-text-tertiary">AI 会根据你的水平调整练习难度</p>
            </div>
            <div className="space-y-3">
              {levels.map((level, idx) => (
                <button
                  key={level.id}
                  onClick={() => handleLevelSelect(level.id)}
                  className={`w-full p-5 rounded-xl text-left transition-all duration-300 ${
                    selectedLevel === level.id
                      ? 'bg-primary text-white shadow-glow scale-[1.02]'
                      : 'bg-primary-light hover:bg-primary-subtle text-text-secondary hover:scale-[1.01]'
                  }`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">{level.name}</p>
                      <p className={`text-xs mt-1 ${selectedLevel === level.id ? 'text-white/80' : 'text-text-tertiary'}`}>
                        {level.desc}
                      </p>
                    </div>
                    {selectedLevel === level.id && (
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-6 animate-fade-in-up">
            <div className="relative">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-mint via-primary to-lavender flex items-center justify-center shadow-glow animate-pulse-slow">
                <Guitar size={48} className="text-white" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-soft text-white text-xs font-bold rounded-full shadow-lg">
                Ready!
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-2">准备好开始了吗？</h2>
              <p className="text-sm text-text-tertiary">
                加载演示数据，一键体验完整功能
              </p>
            </div>
            <div className="bg-gradient-to-r from-primary/5 via-mint/5 to-amber-soft/5 rounded-xl p-5 text-left space-y-3 border border-primary/10">
              <p className="text-sm font-medium text-text-primary flex items-center gap-2">
                <Sparkles size={16} className="text-amber-soft" />
                演示内容包括：
              </p>
              <ul className="text-xs text-text-secondary space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint mt-1.5 flex-shrink-0" />
                  1 首 Demo Song Cover 项目
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  12 个视频教程资源
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-lavender mt-1.5 flex-shrink-0" />
                  7 天练习历史记录
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-soft mt-1.5 flex-shrink-0" />
                  AI 练习计划生成
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint mt-1.5 flex-shrink-0" />
                  完整的练习工具和周复盘
                </li>
              </ul>
            </div>
            <button
              onClick={handleStartDemo}
              className="btn-primary w-full text-base py-4 flex items-center justify-center gap-2 animate-pulse-once"
            >
              开始体验
              <ChevronRight size={18} className="animate-bounce-right" />
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
              disabled={(step === 2 && !selectedInstrument) || (step === 3 && !selectedLevel)}
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
