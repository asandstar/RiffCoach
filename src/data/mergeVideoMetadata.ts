import biliMetadata from '@/data/biliMetadata.generated.json';
import type { VideoResource } from '@/types';

interface GeneratedVideoMetadata {
  bvid: string;
  title: string;
  description: string;
  owner: string;
  cover: string;
  pages: Array<{
    page: number;
    title: string;
    duration: number;
    cid: number | null;
  }>;
}

const generatedVideos = biliMetadata.videos as Record<string, GeneratedVideoMetadata>;

export function mergeVideoMetadata(resources: VideoResource[]): VideoResource[] {
  return resources.map((resource) => {
    const metadata = generatedVideos[resource.id];
    if (!metadata) return resource;

    return {
      ...resource,
      bvid: metadata.bvid || resource.bvid,
      title: metadata.title || resource.title,
      summary: metadata.description || resource.summary,
      cover: metadata.cover || undefined,
      owner: metadata.owner || undefined,
      pages: metadata.pages.length > 0 ? metadata.pages : undefined,
    };
  });
}
