import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { fetchBiliEpisodes, buildBiliPlayerUrl, getBiliFallbackEpisodes, type BiliEpisode } from '@/utils/bilibili';
import { useAppStore } from '@/store/useAppStore';

interface VideoEpisodePickerProps {
  bvid: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  customEpisodes?: { page: number; title: string }[];
}

const EPISODES_PER_PAGE = 3;

export function VideoEpisodePicker({ bvid, currentPage, onPageChange, customEpisodes }: VideoEpisodePickerProps) {
  const [episodes, setEpisodes] = useState<BiliEpisode[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [customPage, setCustomPage] = useState(currentPage.toString());
  const [showManualInput, setShowManualInput] = useState(false);
  const [sourceType, setSourceType] = useState<'api' | 'custom' | 'fallback'>('fallback');
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentListPage, setCurrentListPage] = useState(1);

  useEffect(() => {
    if (!bvid) return;

    if (customEpisodes && customEpisodes.length > 0) {
      setEpisodes(customEpisodes);
      setFetchFailed(false);
      setLoading(false);
      setSourceType('custom');
      return;
    }

    setLoading(true);
    setFetchFailed(false);
    setSourceType('fallback');

    fetchBiliEpisodes(bvid)
      .then((data) => {
        if (data && data.length > 0) {
          setEpisodes(data);
          setFetchFailed(false);
          setSourceType('api');
        } else {
          setEpisodes(getBiliFallbackEpisodes(10));
          setFetchFailed(true);
          setSourceType('fallback');
        }
      })
      .catch(() => {
        setEpisodes(getBiliFallbackEpisodes(10));
        setFetchFailed(true);
        setSourceType('fallback');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [bvid, customEpisodes]);

  useEffect(() => {
    setCustomPage(currentPage.toString());
  }, [currentPage]);

  const totalPages = Math.ceil(episodes.length / EPISODES_PER_PAGE);
  const currentEpisode = episodes.find((e) => e.page === currentPage);

  const paginatedEpisodes = episodes.slice(
    (currentListPage - 1) * EPISODES_PER_PAGE,
    currentListPage * EPISODES_PER_PAGE
  );

  const handleCustomPageSubmit = () => {
    const page = parseInt(customPage, 10);
    if (page && page > 0) {
      onPageChange(page);
      setShowManualInput(false);
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCustomPageSubmit();
    }
  };

  const goToPage = (page: number) => {
    onPageChange(page);
    setShowDropdown(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text-secondary">选集</h3>
          {sourceType === 'api' && (
            <span className="text-xs text-mint bg-mint/10 px-2 py-0.5 rounded-full">
              实时获取
            </span>
          )}
          {sourceType === 'custom' && (
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              预设分集
            </span>
          )}
          {sourceType === 'fallback' && (
            <span className="text-xs text-amber-soft bg-amber-soft/10 px-2 py-0.5 rounded-full">
              预估选集
            </span>
          )}
        </div>
        <button
          onClick={() => {
            setShowDropdown(!showDropdown);
            setCurrentListPage(1);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-light rounded-lg text-sm text-text-secondary hover:bg-primary-subtle transition-all"
        >
          <span className="font-medium">
            {currentEpisode ? `P${currentEpisode.page} · ${currentEpisode.title}` : `P${currentPage}`}
          </span>
          {showDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={16} className="text-primary animate-spin" />
          <span className="ml-2 text-xs text-text-tertiary">正在获取选集...</span>
        </div>
      )}

      {showDropdown && !loading && episodes.length > 0 && (
        <div className="relative">
          <div className="bg-white rounded-xl shadow-lg border border-border-subtle overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              {paginatedEpisodes.map((ep) => (
                <button
                  key={ep.page}
                  onClick={() => goToPage(ep.page)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all text-left hover:bg-primary-light/50 ${
                    currentPage === ep.page
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text-secondary'
                  }`}
                >
                  <span className={`text-xs font-mono flex-shrink-0 w-6 ${
                    currentPage === ep.page ? 'text-primary' : 'text-text-tertiary'
                  }`}>
                    P{ep.page}
                  </span>
                  <span className="flex-1 truncate">{ep.title}</span>
                  {currentPage === ep.page && (
                    <span className="text-xs text-primary font-medium">当前</span>
                  )}
                </button>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-3 border-t border-border-subtle">
                <button
                  onClick={() => setCurrentListPage(Math.max(1, currentListPage - 1))}
                  disabled={currentListPage === 1}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-primary-light text-text-secondary hover:bg-primary-subtle transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs text-text-tertiary">
                  {currentListPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentListPage(Math.min(totalPages, currentListPage + 1))}
                  disabled={currentListPage === totalPages}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-primary-light text-text-secondary hover:bg-primary-subtle transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {fetchFailed && (
        <button
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {showManualInput ? '收起' : '手动输入 P 数'}
        </button>
      )}

      {fetchFailed && showManualInput && (
        <div className="p-3 bg-amber-soft-light rounded-lg border border-amber-soft/30">
          <p className="text-xs text-text-secondary mb-2">自动获取选集失败，请手动输入 P 数：</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customPage}
              onChange={(e) => setCustomPage(e.target.value)}
              onKeyDown={handleKeyDown}
              min="1"
              placeholder="输入 P 数"
              className="flex-1 px-3 py-2 text-sm bg-bg-input border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleCustomPageSubmit}
              className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-subtle transition-colors"
            >
              跳转
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
        <span className="text-xs text-text-tertiary">当前: P{currentPage} · 共 {episodes.length} 集</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={customPage}
            onChange={(e) => setCustomPage(e.target.value)}
            onKeyDown={handleKeyDown}
            min="1"
            className="w-14 px-2 py-1 text-xs bg-bg-input border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleCustomPageSubmit}
            className="px-3 py-1 text-xs bg-primary-light text-text-secondary rounded-lg hover:bg-primary-subtle transition-colors"
          >
            切换
          </button>
        </div>
      </div>
    </div>
  );
}

interface VideoPlayerCardProps {
  bvid: string;
  page: number;
  onPageChange: (page: number) => void;
  title?: string;
  customEpisodes?: { page: number; title: string }[];
  videoId?: string;
}

export function VideoPlayerCard({ bvid, page, onPageChange, title, customEpisodes, videoId }: VideoPlayerCardProps) {
  const { videoProgresses } = useAppStore();
  
  const playerUrl = buildBiliPlayerUrl(bvid, page);

  const currentProgress = videoProgresses.find(
    (p) => p.videoId === videoId && p.page === page
  )?.progress || 0;

  return (
    <div className="glass-card overflow-hidden">
      <div className="relative aspect-video bg-gray-900">
        <iframe
          key={`${bvid}-${page}`}
          src={playerUrl}
          title={title || '视频'}
          frameBorder="0"
          allowFullScreen
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
        />
        
        {currentProgress > 0 && currentProgress < 95 && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
              <span className="text-xs text-white">上次观看进度</span>
              <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
              <span className="text-xs text-white font-mono">{Math.round(currentProgress)}%</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <VideoEpisodePicker
          bvid={bvid}
          currentPage={page}
          onPageChange={onPageChange}
          customEpisodes={customEpisodes}
        />
      </div>
    </div>
  );
}
