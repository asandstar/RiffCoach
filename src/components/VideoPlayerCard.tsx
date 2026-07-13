import { useState, useEffect, useRef } from 'react';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { buildBiliPlayerUrl } from '@/utils/bilibili';
import { useAppStore } from '@/store/useAppStore';

interface VideoPlayerCardProps {
  bvid: string;
  page: number;
  onPageChange: (page: number) => void;
  title?: string;
  videoId?: string;
  pages?: Array<{
    page: number;
    title: string;
    duration: number;
    cid: number | null;
  }>;
}

export function VideoPlayerCard({ bvid, page, onPageChange, title, videoId, pages }: VideoPlayerCardProps) {
  const { videoProgresses } = useAppStore();
  const [customPage, setCustomPage] = useState(page.toString());
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const playerUrl = buildBiliPlayerUrl(bvid, page);
  const biliWatchUrl = `https://www.bilibili.com/video/${bvid}?p=${page}`;
  const hasPages = Boolean(pages?.length);
  const selectedPage = pages?.find((item) => item.page === page);

  const currentProgress = videoProgresses.find(
    (p) => p.videoId === videoId && p.page === page
  )?.progress || 0;

  // 组件卸载时停止播放器：将 src 置空，确保声音停止
  // 使用 ref 保证幂等，多次调用不会报错
  const cleanedRef = useRef(false);

  useEffect(() => {
    cleanedRef.current = false;
    return () => {
      if (cleanedRef.current) return;
      cleanedRef.current = true;
      const iframe = iframeRef.current;
      if (iframe) {
        iframe.src = 'about:blank';
      }
    };
  }, []);

  // page 外部变化时同步输入框
  useEffect(() => {
    setCustomPage(page.toString());
  }, [page]);

  const handlePageSubmit = () => {
    const trimmed = customPage.trim();
    if (!trimmed) {
      setError('请输入 P 数');
      return;
    }
    const p = parseInt(trimmed, 10);
    if (isNaN(p) || p < 1 || !Number.isInteger(p)) {
      setError('P 数必须是正整数');
      return;
    }
    setError(null);
    onPageChange(p);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageSubmit();
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="relative aspect-video bg-gray-900">
        <iframe
          ref={iframeRef}
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
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-secondary">
              当前分集：P{page}{selectedPage ? ` · ${selectedPage.title}` : ''}
            </span>
          </div>
          <a
            href={biliWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:bg-primary-light rounded-lg transition-colors"
          >
            <ExternalLink size={14} />
            在B站查看选集
          </a>
        </div>
        {hasPages ? (
          <label className="block space-y-1.5">
            <span className="text-xs text-text-tertiary">选择分集</span>
            <select
              value={page}
              onChange={(event) => onPageChange(Number(event.target.value))}
              className="w-full px-3 py-2 text-sm bg-bg-input border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {pages?.map((item) => (
                <option key={`${item.page}-${item.cid ?? 'none'}`} value={item.page}>
                  P{item.page} · {item.title}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={customPage}
                onChange={(e) => setCustomPage(e.target.value)}
                onKeyDown={handleKeyDown}
                min="1"
                step="1"
                placeholder="输入 P 数"
                className="w-20 px-2 py-1.5 text-sm bg-bg-input border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handlePageSubmit}
                className="px-3 py-1.5 text-sm bg-primary-light text-text-secondary rounded-lg hover:bg-primary-subtle transition-colors"
              >
                切换分集
              </button>
              {error && (
                <span className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={12} />
                  {error}
                </span>
              )}
            </div>
            <p className="text-xs text-text-tertiary">
              不知道分集号？先在 B 站查看，再输入对应的 P 数。
            </p>
          </>
        )}
      </div>
    </div>
  );
}
