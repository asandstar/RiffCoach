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
