import { useState } from 'react';
import { BookOpen, Download, Upload, RotateCcw, Info, Sparkles, Calendar } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { useAppStore } from '@/store/useAppStore';
import type { PageType } from '@/types';

interface MePageProps {
  onPageChange: (page: PageType) => void;
}

type TabType = 'profile' | 'calendar' | 'data';

export function MePage({ onPageChange }: MePageProps) {
  const { sessions, coverProjects, loadDemoData, exportData, importData } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [importFile, setImportFile] = useState<HTMLInputElement | null>(null);

  const totalPracticeMinutes = Math.round(sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60);
  const totalSessions = sessions.length;

  const handleExport = () => {
    const dataStr = exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `riffcoach-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        if (confirm('导入数据将覆盖当前数据，确定继续吗？')) {
          const success = importData(data);
          if (success) {
            alert('导入成功！');
            onPageChange('today');
          } else {
            alert('导入失败：数据格式不正确');
          }
        }
      } catch {
        alert('导入失败：文件格式错误');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadDemoData = () => {
    if (confirm('加载演示数据将覆盖当前数据，确定继续吗？')) {
      loadDemoData();
      alert('演示数据加载成功！');
      onPageChange('today');
    }
  };

  const demoSteps = [
    '加载比赛演示数据',
    '今日页选择 20 分钟和状态一般',
    '生成最小有效练习计划',
    '进入 Cover 页面查看 Demo Song Intro Riff',
    '进入 Intro Riff 练习',
    '选择卡点：节奏不稳、换弦慢',
    '备注：换弦处会抢拍',
    '完成练习',
    '查看 AI 反馈',
    '查看周复盘',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-text-primary">我的</h1>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'profile' as const, label: '概览', icon: Sparkles },
          { id: 'calendar' as const, label: '日历', icon: Calendar },
          { id: 'data' as const, label: '数据', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-primary text-white shadow-glow'
                  : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <GlassCard elevated className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xl">
                R
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary">RiffCoach 用户</h2>
                <p className="text-text-secondary text-sm">坚持练习，每天进步一点点</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{totalPracticeMinutes}</p>
                <p className="text-xs text-text-tertiary">总练习分钟</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-text-primary">{totalSessions}</p>
                <p className="text-xs text-text-tertiary">练习次数</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-soft">{coverProjects.length}</p>
                <p className="text-xs text-text-tertiary">Cover 目标</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-mint">{sessions.length > 0 ? '有' : '无'}</p>
                <p className="text-xs text-text-tertiary">本周练习</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h2 className="text-lg font-bold text-text-primary mb-4">快速入口</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onPageChange('knowledge')}
                className="flex items-center gap-3 p-4 bg-primary-light rounded-xl hover:bg-primary-subtle transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <BookOpen size={20} className="text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-text-primary">知识库</p>
                  <p className="text-xs text-text-tertiary">学习吉他知识</p>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className="flex items-center gap-3 p-4 bg-primary-light rounded-xl hover:bg-primary-subtle transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <Calendar size={20} className="text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-text-primary">练琴日历</p>
                  <p className="text-xs text-text-tertiary">查看练习记录</p>
                </div>
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={20} className="text-amber-soft" />
              <h2 className="text-lg font-bold text-text-primary">60 秒演示路径</h2>
            </div>
            <div className="space-y-2">
              {demoSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-primary-subtle rounded-lg">
                  <span className="w-6 h-6 flex items-center justify-center bg-primary text-white text-xs rounded-full font-semibold">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-text-primary">{step}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleLoadDemoData}
              className="btn-primary w-full mt-4"
            >
              开始演示
            </button>
          </GlassCard>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <GlassCard className="p-5">
            <h2 className="text-lg font-bold text-text-primary mb-4">练琴日历</h2>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <div key={day} className="text-center text-xs text-text-tertiary font-medium py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 3;
                const hasSession = day > 0 && day <= 30 && [2, 5, 8, 12, 15, 18, 22, 25, 28].includes(day);
                const isToday = day === 28;
                return (
                  <div
                    key={i}
                    className={`aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all ${
                      day <= 0 || day > 30
                        ? 'text-text-tertiary/30'
                        : hasSession
                        ? 'bg-primary text-white font-semibold'
                        : isToday
                        ? 'bg-primary-light text-primary font-semibold ring-2 ring-primary'
                        : 'text-text-secondary hover:bg-primary-light'
                    }`}
                  >
                    {day > 0 && day <= 30 ? day : ''}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border-default">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-xs text-text-tertiary">有练习</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-light ring-2 ring-primary"></div>
                <span className="text-xs text-text-tertiary">今天</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-primary">本周练习</h2>
              <button
                onClick={() => onPageChange('review')}
                className="text-sm text-primary font-medium hover:underline"
              >
                查看周复盘
              </button>
            </div>
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-primary-subtle rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {new Date(session.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {Math.round(session.durationSeconds / 60)} 分钟 · {session.bpm} BPM
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{'★'.repeat(session.selfRating)}{'☆'.repeat(5 - session.selfRating)}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="space-y-6">
          <GlassCard className="p-5">
            <h2 className="text-lg font-bold text-text-primary mb-4">数据管理</h2>
            <div className="space-y-3">
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-between p-4 bg-primary-light rounded-xl hover:bg-primary-subtle transition-all"
              >
                <div className="flex items-center gap-3">
                  <Download size={20} className="text-primary" />
                  <span className="text-text-primary font-medium">导出数据</span>
                </div>
                <span className="text-text-tertiary text-sm">JSON</span>
              </button>
              <label className="w-full flex items-center justify-between p-4 bg-primary-light rounded-xl hover:bg-primary-subtle transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <Upload size={20} className="text-primary" />
                  <span className="text-text-primary font-medium">导入数据</span>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  ref={setImportFile}
                />
                <span className="text-text-tertiary text-sm">选择文件</span>
              </label>
              <button
                onClick={handleLoadDemoData}
                className="w-full flex items-center justify-between p-4 bg-primary-light rounded-xl hover:bg-primary-subtle transition-all"
              >
                <div className="flex items-center gap-3">
                  <RotateCcw size={20} className="text-primary" />
                  <span className="text-text-primary font-medium">重置演示数据</span>
                </div>
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info size={20} className="text-text-tertiary" />
              <h2 className="text-lg font-bold text-text-primary">关于 RiffCoach</h2>
            </div>
            <p className="text-text-secondary text-sm">
              RiffCoach 是一款面向业余吉他学习者的 AI 高效练习教练。帮助你将喜欢的歌曲拆成每天能练的任务，即使每天只有 20 分钟，也能离你的 cover 目标更近一步。
            </p>
            <p className="text-text-tertiary text-xs mt-3">版本 1.0.0</p>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
