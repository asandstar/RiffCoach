export function extractBvid(url: string | undefined): string | null {
  if (!url) return null;
  const match = url.match(/BV([a-zA-Z0-9]{10})/);
  return match ? 'BV' + match[1] : null;
}

export function buildBiliPlayerUrl(bvid: string, page: number = 1): string {
  return `https://player.bilibili.com/player.html?bvid=${bvid}&page=${page}&high_quality=1`;
}

export interface BiliEpisode {
  page: number;
  title: string;
  cid?: number;
}

export async function fetchBiliEpisodes(bvid: string): Promise<BiliEpisode[] | null> {
  const apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
  const proxies = [
    (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`,
    (url: string) => `https://proxy.cors.sh/${url}`,
    (url: string) => `https://cors-anywhere.herokuapp.com/${url}`,
  ];
  
  for (let attempt = 0; attempt < 2; attempt++) {
    for (const makeProxyUrl of proxies) {
      try {
        const proxyUrl = makeProxyUrl(apiUrl);
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 5000);
        
        const response = await fetch(proxyUrl, { 
          signal: abortController.signal,
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) continue;
        
        const data = await response.json() as BiliApiResponse;
        if (data.code === 0 && data.data && data.data.pages && data.data.pages.length > 0) {
          return normalizeBiliEpisodes(data);
        }
      } catch (error) {
        continue;
      }
    }
    if (attempt === 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  return null;
}

interface BiliApiPage {
  page: number;
  part?: string;
  cid?: number;
}

interface BiliApiResponse {
  code: number;
  data?: {
    pages?: BiliApiPage[];
  };
}

export function normalizeBiliEpisodes(apiResponse: BiliApiResponse): BiliEpisode[] {
  if (!apiResponse?.data?.pages) return [];
  return apiResponse.data.pages.map((p) => ({
    page: p.page,
    title: p.part || `第 ${p.page} 集`,
    cid: p.cid,
  }));
}

export function getBiliFallbackEpisodes(maxPage: number): BiliEpisode[] {
  const episodes: BiliEpisode[] = [];
  for (let i = 1; i <= maxPage; i++) {
    episodes.push({ page: i, title: `第 ${i} 集` });
  }
  return episodes;
}
