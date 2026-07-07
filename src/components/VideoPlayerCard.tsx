import { useState, useEffect } from 'react';
import { Play, Settings, ChevronDown } from 'lucide-react';
import { fetchBiliEpisodes, buildBiliPlayerUrl, getBiliFallbackEpisodes, type BiliEpisode } from '@/utils/bilibili';
import { useAppStore } from '@/store/useAppStore';

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

    if (customEpisodes && customEpisodes.length > 0) {
      setEpisodes(customEpisodes);
      setFetchFailed(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchFailed(false);

    fetchBiliEpisodes(bvid)
      .then((data) => {
        if (data && data.length > 0) {
          setEpisodes(data);
          setFetchFailed(false);
        } else {
          setEpisodes(getBiliFallbackEpisodes(10));
          setFetchFailed(true);
        }
      })
      .catch(() => {
        setEpisodes(getBiliFallbackEpisodes(10));
        setFetchFailed(true);
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
            <div className="max-h-72 overflow-y-auto space-y-1 pr-2 scrollbar-thin">
              {episodes.map((ep) => (
                <button
                  key={ep.page}
                  onClick={() => onPageChange(ep.page)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all text-left ${
                    currentPage === ep.page
                      ? 'bg-primary text-white font-semibold'
                      : 'bg-primary-light/50 text-text-secondary hover:bg-primary-subtle'
                  }`}
                >
                  <span className={`text-xs font-mono flex-shrink-0 ${
                    currentPage === ep.page ? 'text-white/80' : 'text-text-tertiary'
                  }`}>
                    P{ep.page}
                  </span>
                  <span className="flex-1 truncate">{ep.title}</span>
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
            <span className="text-xs text-text-tertiary">当前: P{currentPage} · 共 {episodes.length} 集</span>
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
  videoId?: string;
}

export function VideoPlayerCard({ bvid, page, onPageChange, title, customEpisodes, videoId }: VideoPlayerCardProps) {
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const { videoProgresses } = useAppStore();
  
  const playerUrl = buildBiliPlayerUrl(bvid, page);

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5];
  
  const currentProgress = videoProgresses.find(
    (p) => p.videoId === videoId && p.page === page
  )?.progress || 0;

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
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="p-3 bg-white/90 rounded-full shadow-lg">
            <Play size={24} className="text-primary" fill="currentColor" />
          </div>
        </div>
        
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

        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-black/80 transition-colors"
            >
              <Settings size={14} />
              <span>{playbackSpeed}x</span>
              <ChevronDown size={14} />
            </button>
            
            {showSpeedMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSpeedMenu(false)}
                />
                <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl overflow-hidden z-50">
                  {speedOptions.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => {
                        setPlaybackSpeed(speed);
                        setShowSpeedMenu(false);
                      }}
                      className={`w-20 px-4 py-2 text-sm text-left transition-colors ${
                        playbackSpeed === speed
                          ? 'bg-primary text-white'
                          : 'text-text-primary hover:bg-primary-light'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
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
