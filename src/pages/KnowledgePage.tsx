import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, BookOpen, TrendingUp, AlertTriangle, Play, ChevronLeft, ChevronRight, Search, Star, Clock, ExternalLink, Heart, CheckCircle } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { useAppStore } from '@/store/useAppStore';
import type { PageType, KnowledgeBaseItem, KnowledgeSource } from '@/types';

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
  const { knowledgeBase, toggleKnowledgeFavorite, markKnowledgeRead, videoResources, sources, coverProjects, setPracticeContext, addRecentResource } = useAppStore();
  const [selectedInstrument, setSelectedInstrument] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('basics');
  const [selectedItem, setSelectedItem] = useState<KnowledgeBaseItem | null>(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // 搜索过滤逻辑
  const searchFilteredItems = useMemo(() => {
    if (!searchQuery.trim()) return knowledgeBase.items;
    const query = searchQuery.toLowerCase();
    return knowledgeBase.items.filter((item) => {
      return (
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        item.relatedSkills.some((skill) => skill.toLowerCase().includes(query))
      );
    });
  }, [searchQuery, knowledgeBase.items]);

  // 判断是否已收藏
  const isFavorite = (id: string) => knowledgeBase.favorites.includes(id);

  // 判断是否已读
  const isRead = (id: string) => knowledgeBase.readHistory.some((h) => h.id === id);

  // 获取阅读时间
  const getReadTime = (id: string) => {
    const history = knowledgeBase.readHistory.find((h) => h.id === id);
    return history?.readAt;
  };

  // 处理文章点击
  const handleItemClick = (item: KnowledgeBaseItem) => {
    setSelectedItem(item);
    markKnowledgeRead(item.id);
  };

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

  const openVideo = (videoId: string) => {
    const video = videoResources.find((item) => item.id === videoId);
    if (!video) return;
    const lesson = sources.flatMap((source) => source.lessons).find((item) => item.bvid === video.bvid);
    const project = coverProjects.find((item) => item.sourceLinks.some((link) => link.bvid === video.bvid));
    setPracticeContext({
      lessonId: lesson?.id || null,
      videoId,
      projectId: lesson?.projectId || project?.id || null,
      sectionId: lesson?.sectionId || null,
    });
    addRecentResource('video', videoId);
    onPageChange('video-study');
  };

  const startKnowledgePractice = () => {
    if (!selectedItem) return;
    const knowledgeTerms = [...selectedItem.tags, ...selectedItem.relatedSkills];
    const matchesKnowledgeTerm = (value: string) => knowledgeTerms.some((term) =>
      value.includes(term) || term.includes(value)
    );
    const videoId = selectedItem.relatedVideoIds?.find((id) => videoResources.some((video) => video.id === id))
      || videoResources.find((video) =>
        (selectedItem.instrument === 'all' || video.instrument === selectedItem.instrument)
        && video.skills.some(matchesKnowledgeTerm)
      )?.id
      || null;
    const allLessons = sources.flatMap((source) => source.lessons);
    const selectedVideo = videoResources.find((video) => video.id === videoId);
    const lesson = allLessons.find((item) =>
      item.instrument === selectedItem.instrument
      && item.tags.some(matchesKnowledgeTerm)
    ) || (selectedVideo
      ? allLessons.find((item) => item.bvid === selectedVideo.bvid)
      : undefined)
      || allLessons.find((item) => item.instrument === selectedItem.instrument);
    setPracticeContext({
      lessonId: lesson?.id || null,
      videoId,
      projectId: lesson?.projectId || null,
      sectionId: lesson?.sectionId || null,
    });
    onPageChange('practice');
  };

  const filteredItems = searchFilteredItems.filter((item) => {
    if (selectedInstrument === 'all') return true;
    return item.instrument === selectedInstrument || item.instrument === 'all';
  });

  // 收藏筛选
  const displayItems = showFavoritesOnly 
    ? filteredItems.filter((item) => isFavorite(item.id))
    : filteredItems;

  const currentItems = displayItems.filter((item) => item.category === selectedSubCategory);

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
        {/* 搜索栏 */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索知识点（标题、摘要、标签）..."
              className="w-full pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm rounded-xl border border-primary-light/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-text-primary placeholder:text-text-tertiary"
            />
          </div>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`p-2 rounded-xl transition-all ${
              showFavoritesOnly
                ? 'bg-primary text-white'
                : 'bg-white/50 text-text-secondary hover:bg-primary-light'
            }`}
            title={showFavoritesOnly ? '显示全部' : '只显示收藏'}
          >
            <Heart size={20} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* 搜索结果提示 */}
        {searchQuery && (
          <div className="mb-3 text-sm text-text-secondary">
            找到 {searchFilteredItems.length} 个相关知识点
          </div>
        )}

        {selectedItem ? (
          <GlassCard elevated className="p-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
              >
                <ArrowLeft size={16} />
                返回列表
              </button>
              <button
                onClick={() => toggleKnowledgeFavorite(selectedItem.id)}
                className={`p-2 rounded-full transition-all ${
                  isFavorite(selectedItem.id)
                    ? 'bg-primary text-white'
                    : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
                }`}
                title={isFavorite(selectedItem.id) ? '取消收藏' : '收藏'}
              >
                <Star size={20} fill={isFavorite(selectedItem.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            <h2 className="text-2xl font-bold text-text-primary mb-2">{selectedItem.title}</h2>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="chip chip-primary">{selectedItem.stage}</span>
              <span className="text-sm text-text-tertiary">
                难度 {'★'.repeat(selectedItem.difficulty)}{'☆'.repeat(5 - selectedItem.difficulty)}
              </span>
              {selectedItem.readingTime && (
                <span className="text-sm text-text-tertiary flex items-center gap-1">
                  <Clock size={14} />
                  {selectedItem.readingTime}分钟
                </span>
              )}
              {isRead(selectedItem.id) && (
                <span className="text-xs chip chip-success flex items-center gap-1">
                  <CheckCircle size={12} />
                  已读
                </span>
              )}
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

            {/* 资料来源 */}
            {selectedItem.sources && selectedItem.sources.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
                  <BookOpen size={18} className="text-primary" />
                  资料来源
                </h3>
                <div className="space-y-2">
                  {selectedItem.sources.map((source, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-text-secondary">
                      <span className="text-xs chip chip-primary">{source.type}</span>
                      <span className="text-sm">{source.title}</span>
                      {source.author && <span className="text-xs text-text-tertiary">- {source.author}</span>}
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-dark"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 相关知识点推荐 */}
            {selectedItem.relatedKnowledgeIds && selectedItem.relatedKnowledgeIds.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-3">相关知识点</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.relatedKnowledgeIds.map((id) => {
                    const relatedItem = knowledgeBase.items.find((item) => item.id === id);
                    if (!relatedItem) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => setSelectedItem(relatedItem)}
                        className="chip chip-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      >
                        {relatedItem.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 相关视频推荐 */}
            {selectedItem.relatedVideoIds && selectedItem.relatedVideoIds.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-3">推荐视频教程</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedItem.relatedVideoIds.map((id) => {
                    const video = videoResources.find((v) => v.id === id);
                    if (!video) return null;
                    return (
                      <GlassCard
                        key={id}
                        className="p-3 cursor-pointer hover:shadow-elevated transition-shadow"
                        onClick={() => openVideo(video.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                            <Play size={20} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-text-primary truncate">{video.title}</h4>
                            <p className="text-xs text-text-tertiary mt-1">{video.stage} · {video.instrument}</p>
                          </div>
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={startKnowledgePractice} className="flex-1 btn-primary flex items-center justify-center gap-2">
                <Play size={18} />
                去练习
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
                <p className="text-text-secondary">
                  {showFavoritesOnly ? '暂无收藏的知识点' : searchQuery ? '未找到相关知识点' : '该分类下暂无内容'}
                </p>
              </GlassCard>
            ) : (
              currentItems.map((item) => (
                <GlassCard
                  key={item.id}
                  className={`p-5 cursor-pointer hover:shadow-elevated transition-shadow relative ${
                    isRead(item.id) ? 'bg-white/40' : ''
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  {/* 已读标记 */}
                  {isRead(item.id) && (
                    <div className="absolute top-3 left-3">
                      <span className="text-xs chip chip-success flex items-center gap-1 opacity-70">
                        <CheckCircle size={10} />
                        已读
                      </span>
                    </div>
                  )}

                  {/* 收藏按钮 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleKnowledgeFavorite(item.id);
                    }}
                    className={`absolute top-3 right-3 p-1.5 rounded-full transition-all ${
                      isFavorite(item.id)
                        ? 'bg-primary text-white'
                        : 'bg-white/50 text-text-tertiary hover:bg-primary-light hover:text-primary'
                    }`}
                    title={isFavorite(item.id) ? '取消收藏' : '收藏'}
                  >
                    <Star size={16} fill={isFavorite(item.id) ? 'currentColor' : 'none'} />
                  </button>

                  <div className="flex items-start justify-between pr-8">
                    <div className="flex-1">
                      <h3 className="font-bold text-text-primary text-lg">{item.title}</h3>
                      <p className="text-text-secondary text-sm mt-1 line-clamp-2">{item.summary}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm text-text-tertiary">
                        {'★'.repeat(item.difficulty)}{'☆'.repeat(5 - item.difficulty)}
                      </span>
                      <span className="text-xs chip chip-primary">{item.stage}</span>
                      {item.readingTime && (
                        <span className="text-xs text-text-tertiary flex items-center gap-1">
                          <Clock size={12} />
                          {item.readingTime}分钟
                        </span>
                      )}
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
