import type { AppState, EfficientPracticePlan, Session, Lesson, CoverProject, AIFeedback, PainPoint } from '@/types';

export function generateEfficientPracticePlan(
  state: Partial<AppState>,
  availableMinutes: number,
  energyState: string
): EfficientPracticePlan {
  const projects = state.coverProjects || [];
  const recentSessions = [...(state.sessions || [])].sort((a, b) => b.date - a.date).slice(0, 7);
  const painCounts: Record<string, number> = {};
  
  recentSessions.forEach((s) => {
    (s.painPoints || []).forEach((p) => {
      painCounts[p] = (painCounts[p] || 0) + 1;
    });
  });

  const sortedPains = Object.entries(painCounts).sort((a, b) => b[1] - a[1]);
  const topPain = sortedPains.length > 0 ? sortedPains[0][0] : null;

  let project: CoverProject | null = null;
  let section: CoverProject['sections'][0] | null = null;
  let lessonId: string | null = null;

  if (projects.length > 0) {
    project = projects[0];
    const incompleteSections = project.sections.filter((s) => s.progress < 100);
    if (incompleteSections.length > 0) {
      section = incompleteSections.reduce((a, b) => (a.progress > b.progress ? a : b));
      if (section.lessonIds && section.lessonIds.length > 0) {
        lessonId = section.lessonIds[0];
      }
    }
  }

  const allLessons = (state.sources || []).flatMap((src) => src.lessons || []);
  let fallbackLesson: Lesson | null = null;
  if (!section && allLessons.length > 0) {
    fallbackLesson = allLessons[0];
  }

  const plan: EfficientPracticePlan = {
    target: '',
    reason: '',
    steps: [],
    avoid: [],
    completion: '',
    projectId: project?.id || null,
    sectionId: section?.id || null,
    lessonId: lessonId || fallbackLesson?.id || null,
  };

  const baseBPM = section?.currentCleanBPM || fallbackLesson?.targetBPM || 70;
  const sectionName = section?.name || fallbackLesson?.title || '练习';

  if (energyState === '轻松') {
    plan.target = `轻松复习 ${sectionName}`;
    plan.reason = '今天状态放松，适合做轻松的复习，保持手感。';
    plan.steps = [
      { duration: 3, bpm: 60, desc: '热身，活动手指' },
      { duration: Math.max(5, availableMinutes - 8), bpm: baseBPM, desc: `${sectionName}轻松练习` },
      { duration: 2, bpm: 0, desc: '简单复盘' },
    ];
    plan.avoid = ['不要冲速度', '不要练新内容'];
    plan.completion = '轻松完成，保持手感';
  } else if (availableMinutes < 15) {
    if (topPain) {
      plan.target = `集中解决「${topPain}」卡点`;
      plan.reason = `你最近多次遇到${topPain}，今天先把这个瓶颈突破。`;
      plan.steps = [
        { duration: 2, bpm: 60, desc: '空弦热身，放松手指' },
        { duration: Math.max(3, availableMinutes - 4), bpm: baseBPM, desc: `${topPain}专项练习` },
        { duration: 2, bpm: 0, desc: '复盘记录' },
      ];
      plan.avoid = ['不要练新内容', '不要冲原速'];
      plan.completion = `${topPain}有所改善，能连续完成3遍`;
    } else {
      plan.target = `${sectionName}巩固练习`;
      plan.reason = '今天时间有限，先巩固已学内容。';
      plan.steps = [
        { duration: Math.max(5, availableMinutes - 2), bpm: baseBPM, desc: `${sectionName}稳定练习` },
        { duration: 2, bpm: 0, desc: '记录最高干净BPM' },
      ];
      plan.avoid = ['不要开新段落'];
      plan.completion = '稳定完成目标BPM';
    }
  } else if (availableMinutes <= 30) {
    plan.target = `${sectionName}在${baseBPM + 5} BPM稳定完成`;
    plan.reason = topPain ? `最近${topPain}反复出现，今天结合段落练习解决。` : '今天适合做完整段落练习。';
    plan.steps = [
      { duration: 3, bpm: 60, desc: '空弦交替拨弦热身' },
      { duration: 10, bpm: baseBPM, desc: `${sectionName}分解练习` },
      { duration: Math.max(5, availableMinutes - 15), bpm: baseBPM + 5, desc: `${sectionName}完整串联` },
      { duration: 2, bpm: 0, desc: '复盘并记录' },
    ];
    plan.avoid = ['不要练新段落', topPain ? '不要直接冲原速' : ''];
    plan.completion = `${sectionName}在${baseBPM + 5} BPM连续3遍不卡顿`;
  } else {
    plan.target = `${sectionName}突破${baseBPM + 10} BPM`;
    plan.reason = '今天时间充裕，可以尝试提速并做完整练习。';
    plan.steps = [
      { duration: 3, bpm: 60, desc: '空弦热身' },
      { duration: 8, bpm: baseBPM, desc: `${sectionName}分解练习` },
      { duration: 15, bpm: baseBPM + 5, desc: `${sectionName}完整串联` },
      { duration: Math.max(5, availableMinutes - 28), bpm: baseBPM + 10, desc: '尝试提速练习' },
      { duration: 2, bpm: 0, desc: '复盘记录最高干净BPM' },
    ];
    plan.avoid = ['不要贪快，确保每个音清晰'];
    plan.completion = `${sectionName}在${baseBPM + 10} BPM能完成`;
  }

  if (energyState === '很累' || energyState === '手指酸') {
    plan.avoid.push('不要冲BPM');
    plan.steps.forEach((s) => { if (s.bpm > 0) s.bpm = Math.max(60, s.bpm - 5); });
    plan.reason += ' 今天状态不太好，降低强度，保持练习节奏就好。';
  }

  plan.avoid = plan.avoid.filter(Boolean);
  return plan;
}

export function generateAIFeedback(
  session: Session,
  lesson: Lesson | undefined,
  recentSessions: Session[],
  project: CoverProject | undefined
): AIFeedback {
  const lessonTitle = lesson?.title || '本次练习';
  const painPoints = session.painPoints || [];
  const duration = session.durationSeconds || 0;
  const durationMin = Math.round(duration / 60);
  const triedBPM = session.currentBPM || session.bpm || 80;
  const selfRating = session.selfRating || 0;
  const painDetails = Array.isArray(session.painPointDetails) ? session.painPointDetails : [];
  const notes = session.notes || '';

  let cleanBPM = session.cleanBPM || 0;
  if (cleanBPM <= 0) {
    if (selfRating <= 2 || painPoints.length >= 2) {
      cleanBPM = Math.max(40, triedBPM - 10);
    } else if (selfRating <= 3 || painPoints.length >= 1) {
      cleanBPM = Math.max(40, triedBPM - 5);
    } else {
      cleanBPM = triedBPM;
    }
  }

  const repeatedPains: string[] = [];
  if (recentSessions && recentSessions.length > 1) {
    const painCounts: Record<string, number> = {};
    recentSessions.forEach((s) => {
      (s.painPoints || []).forEach((p) => {
        painCounts[p] = (painCounts[p] || 0) + 1;
      });
    });
    Object.entries(painCounts).forEach(([p, c]) => {
      if (c >= 3) repeatedPains.push(p);
    });
  }

  let summary = `你今天练习了「${lessonTitle}」，时长 ${durationMin} 分钟，尝试速度 ${triedBPM} BPM，最高干净速度 ${cleanBPM} BPM。`;
  
  if (durationMin < 10) {
    summary += ' 练习时间偏短，建议下次保证至少 15 分钟。';
  }

  if (painPoints.length > 0) {
    const painStr = painPoints.join('、');
    summary += ` 主要卡点：${painStr}。`;
    
    if (repeatedPains.length > 0) {
      summary += ` ${repeatedPains.join('、')} 是反复出现的卡点，需要重点关注。`;
    }
  } else {
    summary += ' 没有记录卡点，建议记录更具体的练习感受。';
  }

  let mainReason = '';
  if (painPoints.includes('节奏不稳')) {
    mainReason = '节奏不稳可能是因为换弦时手指准备不充分，或者没有使用节拍器练习。';
  } else if (painPoints.includes('换弦慢') || painPoints.includes('换和弦慢')) {
    mainReason = '换弦慢通常是因为手指抬得太高，或者没有提前准备下一个和弦的手型。';
  } else if (painPoints.includes('拨弦力度不均')) {
    mainReason = '拨弦力度不均可能是因为右手手腕不够放松，或者下拨和上拨的力度不一致。';
  } else if (painPoints.includes('大横按切换慢')) {
    mainReason = '大横按切换慢是初学者常见问题，需要单独练习大横按和弦，逐步提升稳定性。';
  } else {
    mainReason = '继续保持练习，逐步提升速度和稳定性。';
  }

  const nextSteps: string[] = [];
  if (painPoints.length > 0) {
    nextSteps.push(`${cleanBPM} BPM 卡点专项练习 5 分钟`);
    nextSteps.push(`${cleanBPM} BPM 完整段落练习`);
    nextSteps.push(`尝试 ${cleanBPM + 5} BPM`);
  } else {
    nextSteps.push(`${triedBPM} BPM 稳定练习`);
    nextSteps.push(`尝试 ${triedBPM + 5} BPM`);
    nextSteps.push('加入新的练习内容');
  }

  const avoidList: string[] = [];
  if (cleanBPM < triedBPM) {
    avoidList.push(`不要直接冲 ${triedBPM} BPM，先稳定 ${cleanBPM} BPM`);
  }
  if (painPoints.length >= 2) {
    avoidList.push('不要同时解决多个卡点，先集中解决一个');
  }
  if (selfRating <= 2) {
    avoidList.push('不要追求速度，先保证质量');
  }

  let coverUpdate = '';
  if (project && lesson?.projectId && lesson?.sectionId) {
    const section = project.sections.find((s) => s.id === lesson.sectionId);
    if (section) {
      const newProgress = Math.min(100, section.progress + 5);
      const newCleanBPM = Math.max(section.currentCleanBPM, cleanBPM);
      coverUpdate = `${section.name} 进度从 ${section.progress}% 更新到 ${newProgress}%，最高干净 BPM 从 ${section.currentCleanBPM} 更新到 ${newCleanBPM}`;
    }
  }

  const nextPlanText = nextSteps.join(' → ');

  return {
    summary,
    triedBPM,
    cleanBPM,
    reason: mainReason,
    nextPlan: nextPlanText,
    nextSteps,
    avoid: avoidList.filter(Boolean),
    coverUpdate: coverUpdate || undefined,
  };
}

export function analyzeMaterial(
  material: { title: string; type: string; note?: string },
  state: Partial<AppState>
) {
  const title = material.title.toLowerCase();
  const note = (material.note || '').toLowerCase();
  const combined = title + ' ' + note;

  let suggestedTitle = material.title;
  let suggestedTags: string[] = [];
  let suggestedInstrument = 'electric';
  let suggestedBPM = 70;
  let suggestedDuration = 15;
  let reason = '';

  if (combined.includes('riff') || combined.includes('solo')) {
    suggestedTags = ['Riff', '段落练习'];
    suggestedBPM = 60;
    suggestedDuration = 20;
    reason = '检测到 riff/solo 相关内容，建议分段落练习';
  } else if (combined.includes('节奏') || combined.includes('rhythm')) {
    suggestedTags = ['节奏', '扫弦'];
    suggestedBPM = 70;
    suggestedDuration = 15;
    reason = '检测到节奏相关内容，建议配合节拍器练习';
  } else if (combined.includes('和弦') || combined.includes('chord')) {
    suggestedTags = ['和弦', '转换'];
    suggestedBPM = 60;
    suggestedDuration = 15;
    reason = '检测到和弦相关内容，建议练习和弦转换';
  } else if (combined.includes('音阶') || combined.includes('scale')) {
    suggestedTags = ['音阶', '基本功'];
    suggestedBPM = 60;
    suggestedDuration = 15;
    reason = '检测到音阶相关内容，建议慢速开始，逐步提速';
  } else if (combined.includes('拨弦') || combined.includes('picking')) {
    suggestedTags = ['拨弦', '右手'];
    suggestedBPM = 60;
    suggestedDuration = 10;
    reason = '检测到拨弦相关内容，建议练习右手技巧';
  } else {
    suggestedTags = ['练习'];
    suggestedBPM = 70;
    suggestedDuration = 15;
    reason = '通用练习内容';
  }

  if (combined.includes('木吉他') || combined.includes('acoustic')) {
    suggestedInstrument = 'acoustic';
  } else if (combined.includes('尤克里里') || combined.includes('ukulele')) {
    suggestedInstrument = 'ukulele';
  }

  const suggestedTasks = [
    {
      title: `${suggestedTitle} - 慢速练习`,
      targetBPM: suggestedBPM,
      targetDuration: suggestedDuration * 60,
      tags: [...suggestedTags, '慢速'],
      instruction: `以 ${suggestedBPM} BPM 慢速练习，确保每个音清晰准确`,
    },
    {
      title: `${suggestedTitle} - 段落分解`,
      targetBPM: suggestedBPM + 5,
      targetDuration: suggestedDuration * 60,
      tags: [...suggestedTags, '分解'],
      instruction: '将内容分解为小段落，逐一攻克',
    },
    {
      title: `${suggestedTitle} - 完整串联`,
      targetBPM: suggestedBPM + 10,
      targetDuration: suggestedDuration * 60,
      tags: [...suggestedTags, '串联'],
      instruction: '将各个段落串联起来，尝试完整演奏',
    },
  ];

  return {
    suggestedTitle,
    suggestedTags,
    suggestedInstrument,
    suggestedBPM,
    suggestedDuration,
    reason,
    suggestedTasks,
  };
}

export function updateCoverProgressFromSession(
  session: Session,
  lesson: Lesson | undefined,
  state: Partial<AppState>
): Partial<CoverProject> | null {
  if (!lesson?.projectId || !lesson?.sectionId) return null;
  if (!state.coverProjects) return null;

  const project = state.coverProjects.find((p) => p.id === lesson.projectId);
  if (!project) return null;

  const section = project.sections.find((s) => s.id === lesson.sectionId);
  if (!section) return null;

  const newProgress = Math.min(100, section.progress + 5);
  const newCleanBPM = Math.max(section.currentCleanBPM, session.cleanBPM);

  const updatedPainPoints = [...new Set([...section.painPoints, ...session.painPoints])];

  return {
    ...project,
    sections: project.sections.map((s) =>
      s.id === section.id
        ? { ...s, progress: newProgress, currentCleanBPM: newCleanBPM, painPoints: updatedPainPoints }
        : s
    ),
    updatedAt: Date.now(),
  };
}

export function getThisWeekSessions(sessions: Session[]): Session[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  return sessions.filter((s) => s.date >= monday.getTime());
}

export function getLastWeekSessions(sessions: Session[]): Session[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) - 7);
  lastMonday.setHours(0, 0, 0, 0);

  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  thisMonday.setHours(0, 0, 0, 0);

  return sessions.filter((s) => s.date >= lastMonday.getTime() && s.date < thisMonday.getTime());
}
