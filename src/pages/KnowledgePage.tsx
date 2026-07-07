import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, TrendingUp, AlertTriangle, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { useAppStore } from '@/store/useAppStore';
import type { PageType, KnowledgeBaseItem } from '@/types';

const STORAGE_KEY = 'knowledge_nav_collapsed';

interface KnowledgePageProps {
  onPageChange: (page: PageType) => void;
}

const instrumentCategories: { id: string; name: string; icon: string }[] = [
  { id: 'all', name: '全部', icon: '🎸' },
  { id: 'electric', name: '电吉他', icon: '⚡' },
  { id: 'acoustic', name: '木吉他', icon: '🌲' },
  { id: 'ukulele', name: '尤克里里', icon: '🎵' },
];

const subCategories: { id: string; name: string; icon: string }[] = [
  { id: 'basics', name: '入门', icon: '📚' },
  { id: 'practice', name: '基本功', icon: '💪' },
  { id: 'technique', name: '技巧', icon: '🎯' },
  { id: 'theory', name: '乐理', icon: '🎼' },
];

export function KnowledgePage({ onPageChange }: KnowledgePageProps) {
  const { knowledgeBase } = useAppStore();
  const [selectedInstrument, setSelectedInstrument] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('basics');
  const [selectedItem, setSelectedItem] = useState<KnowledgeBaseItem | null>(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setIsNavCollapsed(saved === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, isNavCollapsed.toString());
  }, [isNavCollapsed]);

  const toggleNav = () => {
    setIsNavCollapsed((prev) => !prev);
  };

  const filteredItems = knowledgeBase.items.filter((item) => {
    if (selectedInstrument === 'all') return true;
    return item.instrument === selectedInstrument || item.instrument === 'all';
  });

  const currentItems = filteredItems.filter((item) => item.category === selectedSubCategory);

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div 
        className={`lg:flex-shrink-0 transition-all duration-300 ease-in-out ${
          isNavCollapsed ? 'lg:w-14' : 'lg:w-64'
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-xl font-bold text-text-primary">知识库</h1>
          <button
            onClick={toggleNav}
            className="ml-auto p-2 hover:bg-primary-light rounded-full transition-colors"
          >
            {isNavCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <div className="glass-card p-3 mb-4">
            {!isNavCollapsed && <h3 className="text-sm font-semibold text-text-secondary mb-3">乐器分类</h3>}
            <div className="space-y-1">
              {instrumentCategories.map((cat) => {
                const count = selectedSubCategory
                  ? knowledgeBase.items.filter((item) => {
                      const instMatch = cat.id === 'all' ? true : item.instrument === cat.id || item.instrument === 'all';
                      return instMatch && item.category === selectedSubCategory;
                    }).length
                  : knowledgeBase.items.filter((item) => 
                      cat.id === 'all' ? true : item.instrument === cat.id || item.instrument === 'all'
                    ).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedInstrument(cat.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${
                      selectedInstrument === cat.id
                        ? 'bg-primary text-white'
                        : 'bg-primary-light hover:bg-primary-subtle text-text-secondary'
                    }`}
                    title={cat.name}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      {!isNavCollapsed && <span className="font-medium text-sm">{cat.name}</span>}
                    </div>
                    {!isNavCollapsed && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedInstrument === cat.id ? 'bg-white/20' : 'bg-white/50'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-3">
            {!isNavCollapsed && <h3 className="text-sm font-semibold text-text-secondary mb-3">知识分类</h3>}
            <div className="space-y-1">
              {subCategories.map((cat) => {
                const count = knowledgeBase.items.filter((item) => {
                  const instMatch = selectedInstrument === 'all' ? true : item.instrument === selectedInstrument || item.instrument === 'all';
                  return instMatch && item.category === cat.id;
                }).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedSubCategory(cat.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${
                      selectedSubCategory === cat.id
                        ? 'bg-primary text-white'
                        : 'bg-primary-light hover:bg-primary-subtle text-text-secondary'
                    }`}
                    title={cat.name}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      {!isNavCollapsed && <span className="font-medium text-sm">{cat.name}</span>}
                    </div>
                    {!isNavCollapsed && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedSubCategory === cat.id ? 'bg-white/20' : 'bg-white/50'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
      </div>

      <div className="flex-1">
        {selectedItem ? (
          <GlassCard elevated className="p-6">
            <button
              onClick={() => setSelectedItem(null)}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4"
            >
              <ArrowLeft size={16} />
              返回列表
            </button>
            
            <h2 className="text-2xl font-bold text-text-primary mb-2">{selectedItem.title}</h2>
            <div className="flex items-center gap-2 mb-4">
              <span className="chip chip-primary">{selectedItem.stage}</span>
              <span className="text-sm text-text-tertiary">
                难度 {'★'.repeat(selectedItem.difficulty)}{'☆'.repeat(5 - selectedItem.difficulty)}
              </span>
              <div className="flex gap-1">
                {selectedItem.tags.map((tag) => (
                  <span key={tag} className="text-xs chip chip-primary">{tag}</span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-2">一句话解释</h3>
              <p className="text-text-secondary">{selectedItem.summary}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-2">关联技能</h3>
              <div className="flex flex-wrap gap-2">
                {selectedItem.relatedSkills.map((skill) => (
                  <span key={skill} className="chip chip-success">{skill}</span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-soft" />
                常见错误
              </h3>
              <ul className="space-y-2">
                {selectedItem.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-text-secondary">
                    <span className="text-amber-soft">•</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
                <TrendingUp size={18} className="text-mint" />
                练习建议
              </h3>
              <ul className="space-y-2">
                {selectedItem.practiceSuggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-text-secondary">
                    <span className="text-mint">✓</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            {selectedItem.content && selectedItem.content.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-2">详细内容</h3>
                <div className="space-y-4">
                  {selectedItem.content.map((item, idx) => {
                    if (item.type === 'paragraph') {
                      return <p key={idx} className="text-text-secondary">{item.text}</p>;
                    }
                    if (item.type === 'list' && item.items) {
                      return (
                        <ul key={idx} className="space-y-2">
                          {item.items.map((listItem, listIdx) => (
                            <li key={listIdx} className="flex items-start gap-2 text-text-secondary">
                              <span className="text-primary">•</span>
                              {listItem}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    if (item.type === 'tip' && item.text) {
                      return (
                        <div key={idx} className="bg-amber-soft-light p-4 rounded-xl">
                          <p className="text-sm text-text-secondary">{item.text}</p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => onPageChange('practice')} className="flex-1 btn-primary flex items-center justify-center gap-2">
                <Play size={18} />
                加入练习
              </button>
              <button onClick={() => onPageChange('resource')} className="flex-1 btn-secondary flex items-center justify-center gap-2">
                <BookOpen size={18} />
                相关视频
              </button>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">
              {instrumentCategories.find((c) => c.id === selectedInstrument)?.name} · {subCategories.find((c) => c.id === selectedSubCategory)?.name}
            </h2>
            
            {currentItems.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <BookOpen size={32} className="text-text-tertiary mx-auto mb-4" />
                <p className="text-text-secondary">该分类下暂无内容</p>
              </GlassCard>
            ) : (
              currentItems.map((item) => (
                <GlassCard
                  key={item.id}
                  className="p-5 cursor-pointer hover:shadow-elevated transition-shadow"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-text-primary text-lg">{item.title}</h3>
                      <p className="text-text-secondary text-sm mt-1 line-clamp-2">{item.summary}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm text-text-tertiary">
                        {'★'.repeat(item.difficulty)}{'☆'.repeat(5 - item.difficulty)}
                      </span>
                      <span className="text-xs chip chip-primary">{item.stage}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-xs chip chip-primary">{tag}</span>
                    ))}
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
