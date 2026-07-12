export function extractBvid(url: string | undefined): string | null {
  if (!url) return null;
  const match = url.match(/BV([a-zA-Z0-9]{10})/);
  return match ? 'BV' + match[1] : null;
}

export function extractVideoId(url: string | undefined, platform: 'bilibili' | 'youtube'): string | null {
  if (!url) return null;
  if (platform === 'bilibili') {
    return extractBvid(url);
  }
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
  return youtubeMatch ? youtubeMatch[1] : null;
}

export function parseVideoUrl(url: string): { platform: 'bilibili' | 'youtube'; id: string; page?: number } | null {
  if (!url) return null;

  const bvidMatch = url.match(/BV([a-zA-Z0-9]{10})/);
  if (bvidMatch) {
    const pageMatch = url.match(/[\?&]page=(\d+)/);
    return {
      platform: 'bilibili',
      id: 'BV' + bvidMatch[1],
      page: pageMatch ? parseInt(pageMatch[1], 10) : undefined,
    };
  }

  const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
  if (youtubeMatch) {
    return {
      platform: 'youtube',
      id: youtubeMatch[1],
    };
  }

  return null;
}

export function buildBiliPlayerUrl(bvid: string, page: number = 1): string {
  return `https://player.bilibili.com/player.html?bvid=${bvid}&page=${page}&high_quality=1`;
}

export interface BiliVideoInfo {
  bvid: string;
  title: string;
  cover: string;
  description: string;
  owner?: string;
  viewCount?: number;
  pages: Array<{ page: number; title: string; duration: number }>;
}

interface SelfHostApiResponse {
  success: boolean;
  error?: string;
  data?: BiliVideoInfo;
}

interface BiliDirectApiResponse {
  code: number;
  message?: string;
  data?: {
    bvid: string;
    title: string;
    pic: string;
    desc: string;
    owner?: { name: string };
    stat?: { view: number };
    pages?: Array<{ page: number; part: string; duration: number }>;
  };
}

export async function fetchBiliVideoInfo(bvid: string): Promise<BiliVideoInfo | null> {
  try {
    const selfHostUrl = `/api/bili-video?bvid=${bvid}`;
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 8000);

    const response = await fetch(selfHostUrl, {
      signal: abortController.signal,
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json() as SelfHostApiResponse;
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch {
  }

  const apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
  const proxies = [
    (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`,
  ];

  for (const makeProxyUrl of proxies) {
    try {
      const proxyUrl = makeProxyUrl(apiUrl);
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 5000);

      const response = await fetch(proxyUrl, {
        signal: abortController.signal,
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const data = await response.json() as BiliDirectApiResponse;
      if (data.code === 0 && data.data) {
        return {
          bvid: data.data.bvid,
          title: data.data.title,
          cover: data.data.pic,
          description: data.data.desc,
          owner: data.data.owner?.name,
          viewCount: data.data.stat?.view,
          pages: (data.data.pages || []).map(p => ({
            page: p.page,
            title: p.part,
            duration: p.duration,
          })),
        };
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function fetchBiliCover(bvid: string): Promise<string | null> {
  const info = await fetchBiliVideoInfo(bvid);
  return info?.cover || null;
}
