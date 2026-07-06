import { defaultData } from './defaultData';
import type { AppState, Session, CoverProject, CoverSection, PainPoint } from '@/types';

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateDemoData(): AppState {
  const now = Date.now();
  const today = new Date();
  
  const sessions: Session[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateTs = date.getTime();
    
    const duration = 12 + Math.floor(Math.random() * 17) * 60;
    const bpm = 55 + Math.floor(Math.random() * 21);
    const selfRating = 2 + Math.floor(Math.random() * 3);
    
    const painPointsList = ['节奏不稳', '拨弦力度不均', '换弦慢', '大横按切换慢', '手指僵硬'];
    const painCount = Math.floor(Math.random() * 2) + 1;
    const painPoints = painPointsList.slice(0, painCount);
    
    sessions.push({
      id: uid('sess'),
      lessonId: i === 0 ? 'les_demo_1' : null,
      instrument: 'electric',
      date: dateTs,
      durationSeconds: duration,
      bpm: bpm,
      currentBPM: bpm,
      repetitions: 5 + Math.floor(Math.random() * 6),
      selfRating: selfRating,
      painPoints: painPoints as PainPoint[],
      painPointDetails: [],
      notes: i === 0 ? '今天换弦处会抢拍' : '',
      aiFeedback: i === 0 ? {
        summary: '今天在 75 BPM 已经能完成 Intro Riff，但节奏不稳仍然集中在换弦处。',
        triedBPM: 75,
        cleanBPM: 70,
        reason: '换弦时手指准备不充分，导致节奏断掉。',
        nextPlan: '下次先回到 70 BPM，循环练第 2 小节 5 分钟，再尝试完整段落。',
        nextSteps: ['70 BPM 第2小节循环5分钟', '70 BPM 完整段落3遍', '尝试75 BPM'],
        avoid: ['不要直接冲原速', '不要练新段落'],
        coverUpdate: 'Intro Riff 进度从 65% 更新到 70%',
      } : null,
      cleanBPM: Math.max(40, bpm - (selfRating <= 2 ? 10 : 5)),
    });
  }

  const coverSections: CoverSection[] = [
    {
      id: 'sec_intro',
      name: 'Intro Riff',
      targetBPM: 90,
      currentCleanBPM: 70,
      progress: 65,
      painPoints: ['节奏不稳', '换弦慢'],
      lessonIds: ['les_demo_1'],
    },
    {
      id: 'sec_verse',
      name: 'Verse Rhythm',
      targetBPM: 85,
      currentCleanBPM: 55,
      progress: 35,
      painPoints: ['拨弦力度不均'],
      lessonIds: [],
    },
    {
      id: 'sec_full',
      name: 'Full Run',
      targetBPM: 90,
      currentCleanBPM: 0,
      progress: 10,
      painPoints: [],
      lessonIds: [],
    },
  ];

  const coverProject: CoverProject = {
    id: 'cover_demo_1',
    title: 'Demo Song Intro Riff',
    artist: 'Favorite Artist',
    instrument: 'electric',
    goal: '先练会 intro riff，并完成一版 30 秒 cover',
    targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sourceLinks: [{ type: 'bilibili', title: 'B站教程', url: 'https://www.bilibili.com/video/BV1Nb411i7gK', bvid: 'BV1Nb411i7gK', page: 1 }],
    sections: coverSections,
    aiPlan: {
      summary: '先集中完成 Intro Riff，再进入 Verse Rhythm，最后做 30 秒完整串联。',
      nextStep: '今天先稳定 70 BPM，不要急着冲原速。',
      estimatedDays: 14,
    },
    createdAt: now - 7 * 24 * 60 * 60 * 1000,
    updatedAt: now,
  };

  const demoSource = {
    id: 'src_demo',
    name: 'Demo Song Tutorial',
    type: 'bilibili' as const,
    lessons: [{
      id: 'les_demo_1',
      sourceId: 'src_demo',
      title: 'Intro Riff Practice',
      targetBPM: 90,
      tags: ['Riff', 'Cover'],
      instrument: 'electric' as const,
      targetDuration: 900,
      bvid: 'BV1Nb411i7gK',
      page: 1,
      projectId: 'cover_demo_1',
      sectionId: 'sec_intro',
    }],
  };

  const efficientPlan = {
    target: 'Intro Riff 第 2 小节在 70 BPM 连续 3 遍不卡顿',
    reason: '你最近 3 次都在换弦时节奏不稳，今天先解决这个瓶颈。',
    steps: [
      { duration: 3, bpm: 60, desc: '空弦交替拨弦热身' },
      { duration: 8, bpm: 65, desc: '第 2 小节换弦循环' },
      { duration: 6, bpm: 70, desc: 'Intro 第 1 到 2 小节串联' },
      { duration: 3, bpm: 0, desc: '复盘并记录最高干净 BPM' },
    ],
    avoid: ['不要练新段落', '不要直接冲 90 BPM 原速'],
    completion: 'Intro Riff 在 70 BPM 连续 3 遍不卡顿',
    projectId: 'cover_demo_1',
    sectionId: 'sec_intro',
    lessonId: 'les_demo_1',
  };

  return {
    ...defaultData,
    sources: [...defaultData.sources, demoSource],
    sessions,
    coverProjects: [coverProject],
    currentEfficientPlan: efficientPlan,
    materialInbox: [],
    videoResources: defaultData.videoResources,
    recentResources: [],
    favoriteResources: [],
    videoSize: 'compact',
    painPointOptions: [...defaultData.painPointOptions],
    knowledgeBase: { ...defaultData.knowledgeBase },
  };
}
