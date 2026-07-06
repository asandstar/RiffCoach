import { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { analyzeMaterial } from '@/utils/aiMock';
import { extractBvid } from '@/utils/bilibili';
import type { MaterialType, Instrument } from '@/types';

interface QuickAddMaterialSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const materialTypes: { value: MaterialType; label: string }[] = [
  { value: 'bilibili', label: 'B站' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'score', label: '曲谱' },
  { value: 'book', label: '教程书' },
  { value: 'note', label: '笔记' },
  { value: 'other', label: '其他' },
];

const purposes = [
  { value: 'current-cover', label: '当前 Cover' },
  { value: 'new-cover', label: '新建 Cover' },
  { value: 'favorite', label: '只是先收藏' },
  { value: 'basic', label: '基础练习' },
];

export function QuickAddMaterialSheet({ isOpen, onClose }: QuickAddMaterialSheetProps) {
  const [linkOrTitle, setLinkOrTitle] = useState('');
  const [materialType, setMaterialType] = useState<MaterialType>('bilibili');
  const [purpose, setPurpose] = useState('basic');
  const [note, setNote] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ReturnType<typeof analyzeMaterial> | null>(null);
  
  const { addMaterialToInbox, addLesson, coverProjects, sources } = useAppStore();

  const handleQuickAdd = () => {
    if (!linkOrTitle.trim()) {
      alert('请输入链接或标题');
      return;
    }

    const bvid = extractBvid(linkOrTitle);
    const url = linkOrTitle.includes('http') ? linkOrTitle : undefined;

    addMaterialToInbox({
      title: linkOrTitle.trim(),
      type: materialType,
      url,
      bvid: bvid || undefined,
      note: note || undefined,
      status: 'unprocessed',
    });

    setLinkOrTitle('');
    setNote('');
    setShowAnalysis(false);
    onClose();
    alert('已添加到素材篮');
  };

  const handleAIAnalyze = () => {
    if (!linkOrTitle.trim()) {
      alert('请输入链接或标题');
      return;
    }

    const result = analyzeMaterial({ title: linkOrTitle, type: materialType, note }, useAppStore.getState());
    setAnalysisResult(result);
    setShowAnalysis(true);
  };

  const handleConvertToLessons = () => {
    if (!analysisResult) return;

    const demoSource = sources.find((s) => s.name === 'Demo Song Tutorial') || sources[0];
    
    analysisResult.suggestedTasks.forEach((task) => {
        addLesson(demoSource.id, {
          title: task.title,
          targetBPM: task.targetBPM,
          tags: task.tags,
          instrument: analysisResult.suggestedInstrument as Instrument,
          targetDuration: task.targetDuration,
          bvid: extractBvid(linkOrTitle) || undefined,
        });
      });

    addMaterialToInbox({
      title: linkOrTitle.trim(),
      type: materialType,
      url: linkOrTitle.includes('http') ? linkOrTitle : undefined,
      bvid: extractBvid(linkOrTitle) || undefined,
      note: note || undefined,
      status: 'converted',
      extracted: {
        suggestedTitle: analysisResult.suggestedTitle,
        suggestedTags: analysisResult.suggestedTags,
        suggestedInstrument: analysisResult.suggestedInstrument,
        suggestedBPM: analysisResult.suggestedBPM,
        suggestedDuration: analysisResult.suggestedDuration,
        suggestedTasks: analysisResult.suggestedTasks,
      },
    });

    setLinkOrTitle('');
    setNote('');
    setShowAnalysis(false);
    onClose();
    alert('已转换为练习任务');
  };

  return (
    <>
      <div className={`sheet-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <div className={`bottom-sheet ${isOpen ? 'active' : ''}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">快速添加资料</h2>
            <button onClick={onClose} className="p-2 hover:bg-primary-light rounded-full transition-colors">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                链接或标题
              </label>
              <input
                type="text"
                value={linkOrTitle}
                onChange={(e) => setLinkOrTitle(e.target.value)}
                placeholder="粘贴 B站 / YouTube 链接，或搜索：爬格子、交替拨弦..."
                className="w-full px-4 py-3 bg-bg-input border border-border-default rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">类型</label>
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value as MaterialType)}
                  className="w-full px-4 py-3 bg-bg-input border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                >
                  {materialTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">用途</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-input border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                >
                  {purposes.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">备注（可选）</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="补充说明..."
                rows={2}
                className="w-full px-4 py-3 bg-bg-input border border-border-default rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
              />
            </div>

            {showAnalysis && analysisResult && (
              <div className="glass-card p-4 space-y-3">
                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-soft" />
                  AI 分析结果
                </h3>
                <p className="text-sm text-text-secondary">{analysisResult.reason}</p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.suggestedTags.map((tag) => (
                    <span key={tag} className="chip chip-primary">{tag}</span>
                  ))}
                </div>
                <div className="text-sm text-text-secondary">
                  建议 BPM: <span className="font-semibold text-text-primary">{analysisResult.suggestedBPM}</span>
                  {' | '}
                  建议时长: <span className="font-semibold text-text-primary">{analysisResult.suggestedDuration}分钟</span>
                </div>
                <div className="space-y-2 mt-2">
                  <p className="text-sm font-medium text-text-secondary">建议练习任务：</p>
                  {analysisResult.suggestedTasks.map((task, idx) => (
                    <div key={idx} className="text-xs p-2 bg-primary-subtle rounded-lg">
                      <span className="font-semibold">{task.title}</span>
                      <p className="text-text-tertiary mt-1">{task.instruction}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleQuickAdd}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                先放进素材篮
              </button>
              {!showAnalysis ? (
                <button
                  onClick={handleAIAnalyze}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} />
                  AI 整理成练习任务
                </button>
              ) : (
                <button
                  onClick={handleConvertToLessons}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  确认转换
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
