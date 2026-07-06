import { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { fetchBiliEpisodes, buildBiliPlayerUrl, getBiliFallbackEpisodes, type BiliEpisode } from '@/utils/bilibili';

interface VideoEpisodePickerProps {
  bvid: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  customEpisodes?: { page: number; title: string }[];
}

export function VideoEpisodePicker({ bvid, currentPage, onPageChange, customEpisodes }: VideoEpisodePickerProps) {
  const [episodes, setEpisodes] = useState<BiliEpisode[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [customPage, setCustomPage] = useState(currentPage.toString());
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    if (!bvid) return;

    setLoading(true);
    setFetchFailed(false);

    fetchBiliEpisodes(bvid)
      .then((data) => {
        if (data && data.length > 0) {
          setEpisodes(data);
          setFetchFailed(false);
        } else if (customEpisodes && customEpisodes.length > 0) {
          setEpisodes(customEpisodes);
          setFetchFailed(false);
        } else {
          setEpisodes(getBiliFallbackEpisodes(10));
          setFetchFailed(true);
        }
      })
      .catch(() => {
        if (customEpisodes && customEpisodes.length > 0) {
          setEpisodes(customEpisodes);
          setFetchFailed(false);
        } else {
          setEpisodes(getBiliFallbackEpisodes(10));
          setFetchFailed(true);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [bvid, customEpisodes]);

  useEffect(() => {
    setCustomPage(currentPage.toString());
  }, [currentPage]);

  const handleCustomPageSubmit = () => {
    const page = parseInt(customPage, 10);
    if (page && page > 0) {
      onPageChange(page);
      setShowManualInput(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCustomPageSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-secondary">选集</h3>
        {fetchFailed && (
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            {showManualInput ? '收起' : '手动输入 P 数'}
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-xs text-text-tertiary">正在获取选集...</span>
        </div>
      ) : (
        <div className="space-y-2">
          {episodes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {episodes.map((ep) => (
                <button
                  key={ep.page}
                  onClick={() => onPageChange(ep.page)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                    currentPage === ep.page
                      ? 'bg-primary text-white font-semibold'
                      : 'bg-primary-light text-text-secondary hover:bg-primary-subtle'
                  }`}
                  title={ep.title}
                >
                  P{ep.page}
                </button>
              ))}
            </div>
          ) : null}
          
          {fetchFailed && showManualInput && (
            <div className="p-3 bg-amber-soft-light rounded-lg border border-amber-soft/30">
              <p className="text-xs text-text-secondary mb-2">自动获取选集失败，请手动输入 P 数：</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={customPage}
                  onChange={(e) => setCustomPage(e.target.value)}
                  onKeyPress={handleKeyPress}
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
            <span className="text-xs text-text-tertiary">当前播放: P{currentPage}</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={customPage}
                onChange={(e) => setCustomPage(e.target.value)}
                onKeyPress={handleKeyPress}
                min="1"
                className="w-16 px-2 py-1 text-xs bg-bg-input border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
      )}
    </div>
  );
}

interface VideoPlayerCardProps {
  bvid: string;
  page: number;
  onPageChange: (page: number) => void;
  title?: string;
  customEpisodes?: { page: number; title: string }[];
}

export function VideoPlayerCard({ bvid, page, onPageChange, title, customEpisodes }: VideoPlayerCardProps) {
  const playerUrl = buildBiliPlayerUrl(bvid, page);

  return (
    <div className="glass-card overflow-hidden">
      <div className="relative aspect-video bg-gray-900">
        <iframe
          src={playerUrl}
          title={title || '视频'}
          frameBorder="0"
          allowFullScreen
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity pointer-events-none hover:pointer-events-auto">
          <button className="p-3 bg-white/90 rounded-full shadow-lg hover:scale-110 transition-transform">
            <Play size={24} className="text-primary" fill="currentColor" />
          </button>
        </div>
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
