import type { AppState, EfficientPracticePlan, Session, Lesson, CoverProject, AIFeedback, PainPoint, AIRecommendation } from '@/types';
import {
  painPointKnowledgeMap,
  feedbackTemplates,
  encouragementTemplates,
  weeklyGoalTemplates,
  getSeverityFromRating,
  pickByDate,
  pickRandom,
} from './aiKnowledge';

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

  // --- 趋势分析 ---
  const trend = analyzeProgressTrend(session, recentSessions, cleanBPM);

  // --- 生成 summary ---
  let summary = `你今天练习了「${lessonTitle}」，时长 ${durationMin} 分钟，尝试速度 ${triedBPM} BPM，最高干净速度 ${cleanBPM} BPM。`;
  
  if (durationMin < 10) {
    summary += ` ${pickByDate(feedbackTemplates.shortPractice)}`;
  }

  if (painPoints.length > 0) {
    const painStr = painPoints.join('、');
    summary += ` 主要卡点：${painStr}。`;
    
    const repeatedPains = getRepeatedPains(recentSessions);
    if (repeatedPains.length > 0) {
      summary += ` ${repeatedPains.join('、')} 是反复出现的卡点，需要重点关注。`;
    }

    summary += ` ${pickByDate(feedbackTemplates.withPainPoints)}`;
  } else {
    summary += ` ${pickByDate(feedbackTemplates.noPainPoints)}`;
  }

  // --- 生成 reason（使用知识库）---
  const mainPainPoint = painPoints[0] || painPoints[1];
  let mainReason = '';
  if (mainPainPoint && painPointKnowledgeMap[mainPainPoint]) {
    const knowledge = painPointKnowledgeMap[mainPainPoint];
    const severity = getSeverityFromRating(selfRating);
    const reasons = knowledge.reasons[severity];
    mainReason = pickByDate(reasons, painPoints.length);
  } else {
    mainReason = '继续保持练习，逐步提升速度和稳定性。';
  }

  // --- 生成 nextSteps（使用知识库的建议）---
  const nextSteps: string[] = [];
  if (painPoints.length > 0 && painPointKnowledgeMap[painPoints[0]]) {
    const knowledge = painPointKnowledgeMap[painPoints[0]];
    const severity = getSeverityFromRating(selfRating);
    const suggestions = knowledge.suggestions[severity];
    nextSteps.push(...suggestions.slice(0, 2));
    nextSteps.push(`尝试 ${cleanBPM + 5} BPM`);
  } else {
    nextSteps.push(`${triedBPM} BPM 稳定练习`);
    nextSteps.push(`尝试 ${triedBPM + 5} BPM`);
    nextSteps.push('加入新的练习内容');
  }

  // --- 生成 avoid ---
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

  // --- 生成 coverUpdate ---
  let coverUpdate = '';
  if (project && lesson?.projectId && lesson?.sectionId) {
    const section = project.sections.find((s) => s.id === lesson.sectionId);
    if (section) {
      const newProgress = Math.min(100, section.progress + 5);
      const newCleanBPM = Math.max(section.currentCleanBPM, cleanBPM);
      coverUpdate = `${section.name} 进度从 ${section.progress}% 更新到 ${newProgress}%，最高干净 BPM 从 ${section.currentCleanBPM} 更新到 ${newCleanBPM}`;
    }
  }

  // --- 生成 encouragement ---
  let encouragement: string | undefined;
  if (selfRating >= 4) {
    encouragement = pickByDate(feedbackTemplates.highRating);
  } else if (selfRating <= 2) {
    encouragement = pickByDate(feedbackTemplates.lowRating);
  }
  if (!encouragement || Math.random() > 0.5) {
    encouragement = pickByDate(encouragementTemplates);
  }

  // --- 生成 weeklyGoal ---
  const userLevel = (session as { userLevel?: string }).userLevel || 'beginner';
  const levelGoals = weeklyGoalTemplates[userLevel] || weeklyGoalTemplates.beginner;
  const weeklyGoal = pickByDate(levelGoals);

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
    trend,
    encouragement,
    weeklyGoal,
  };
}

/** 分析练习进步趋势 */
function analyzeProgressTrend(
  currentSession: Session,
  recentSessions: Session[],
  currentCleanBPM: number
): AIFeedback['trend'] {
  if (!recentSessions || recentSessions.length < 2) {
    return {
      direction: 'stable',
      bpmChange: 0,
      durationChange: 0,
      painPointChange: 0,
      description: '练习数据还不足够，继续坚持记录，很快就能看到趋势。',
    };
  }

  const thisWeekSessions = getThisWeekSessions(recentSessions);
  const lastWeekSessions = getLastWeekSessions(recentSessions);

  const thisWeekDuration = thisWeekSessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60;
  const lastWeekDuration = lastWeekSessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60;

  const thisWeekBPM = thisWeekSessions.length > 0
    ? thisWeekSessions.reduce((acc, s) => acc + (s.bpm || 70), 0) / thisWeekSessions.length
    : 70;
  const lastWeekBPM = lastWeekSessions.length > 0
    ? lastWeekSessions.reduce((acc, s) => acc + (s.bpm || 70), 0) / lastWeekSessions.length
    : 70;

  const thisWeekPainCount = thisWeekSessions.reduce((acc, s) => acc + (s.painPoints?.length || 0), 0);
  const lastWeekPainCount = lastWeekSessions.reduce((acc, s) => acc + (s.painPoints?.length || 0), 0);

  const bpmChange = Math.round(thisWeekBPM - lastWeekBPM);
  const durationChange = Math.round(thisWeekDuration - lastWeekDuration);
  const painPointChange = thisWeekPainCount - lastWeekPainCount;

  let direction: 'improving' | 'stable' | 'declining' = 'stable';
  let description = '';

  const score = (bpmChange > 0 ? 1 : bpmChange < 0 ? -1 : 0)
    + (durationChange > 5 ? 1 : durationChange < -5 ? -1 : 0)
    + (painPointChange < 0 ? 1 : painPointChange > 0 ? -1 : 0);

  if (score >= 2) {
    direction = 'improving';
    description = '你的练习趋势正在上升！';
    if (bpmChange > 0) description += ` BPM提升了${bpmChange}，`;
    if (durationChange > 0) description += `练习时长增加了${durationChange}分钟，`;
    if (painPointChange < 0) description += '卡点数量减少了。';
    description += '继续保持这个节奏！';
  } else if (score <= -2) {
    direction = 'declining';
    description = '最近练习状态有所波动，';
    if (bpmChange < 0) description += `BPM下降了${Math.abs(bpmChange)}，`;
    if (durationChange < 0) description += `练习时长减少了${Math.abs(durationChange)}分钟，`;
    if (painPointChange > 0) description += '卡点有所增加。';
    description += '不要焦虑，调整节奏再来。';
  } else {
    direction = 'stable';
    description = '练习状态保持稳定。';
    if (bpmChange > 0) description += ` BPM小幅提升${bpmChange}，`;
    else if (bpmChange < 0) description += ` BPM小幅波动${Math.abs(bpmChange)}，`;
    description += '稳扎稳打，持续积累。';
  }

  return { direction, bpmChange, durationChange, painPointChange, description };
}

/** 获取反复出现的卡点 */
function getRepeatedPains(recentSessions: Session[]): string[] {
  const repeatedPains: string[] = [];
  if (!recentSessions || recentSessions.length < 2) return repeatedPains;
  const painCounts: Record<string, number> = {};
  recentSessions.forEach((s) => {
    (s.painPoints || []).forEach((p) => {
      painCounts[p] = (painCounts[p] || 0) + 1;
    });
  });
  Object.entries(painCounts).forEach(([p, c]) => {
    if (c >= 3) repeatedPains.push(p);
  });
  return repeatedPains;
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

export function generateAIRecommendations(state: Partial<AppState>): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];
  const sessions = state.sessions || [];
  const videoResources = state.videoResources || [];
  const knowledgeBase = state.knowledgeBase || { categories: [], items: [], videos: [], favorites: [] };
  const userLevel = (state as { userLevel?: 'beginner' | 'intermediate' | 'advanced' }).userLevel || 'beginner';

  const painCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    (s.painPoints || []).forEach((p) => {
      painCounts[p] = (painCounts[p] || 0) + 1;
    });
  });

  const sortedPains = Object.entries(painCounts).sort((a, b) => b[1] - a[1]);
  const topPains = sortedPains.slice(0, 2);

  const recentSessions = [...sessions].sort((a, b) => b.date - a.date);
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60;
  const avgBPM = sessions.length > 0
    ? sessions.reduce((acc, s) => acc + s.bpm, 0) / sessions.length
    : 70;

  if (topPains.length > 0) {
    recommendations.push({
      id: `rec_pain_${topPains[0][0]}`,
      title: `${topPains[0][0]}专项训练`,
      type: 'exercise',
      description: `针对「${topPains[0][0]}」进行专项练习，每天坚持10-15分钟`,
      reason: `你最近${topPains[0][1]}次练习都遇到了「${topPains[0][0]}」，需要重点突破`,
      priority: 'high',
      durationMinutes: 15,
      tags: ['专项', '卡点突破'],
    });
  }

  const recentVideoIds = (state.recentResources || [])
    .filter((r) => r.type === 'video')
    .map((r) => r.id);

  const unfinishedVideos = videoResources.filter((v) => {
    const progress = (state.videoProgresses || []).find((p) => p.videoId === v.id);
    return progress && progress.progress < 80;
  });

  if (unfinishedVideos.length > 0 && !recentVideoIds.includes(unfinishedVideos[0].id)) {
    recommendations.push({
      id: `rec_video_${unfinishedVideos[0].id}`,
      title: unfinishedVideos[0].title,
      type: 'video',
      description: `继续学习「${unfinishedVideos[0].title}」，完成剩余内容`,
      reason: '你上次观看了这个视频但还没看完，继续学习效果更好',
      priority: 'medium',
      durationMinutes: 20,
      tags: ['继续学习', unfinishedVideos[0].stage],
      videoId: unfinishedVideos[0].id,
    });
  }

  if (recentSessions.length > 0 && recentSessions[0].date < Date.now() - 24 * 60 * 60 * 1000) {
    recommendations.push({
      id: 'rec_streak',
      title: '保持练习节奏',
      type: 'exercise',
      description: '今天还没有练习，花10分钟保持手感',
      reason: '保持连续练习对进步很重要，不要中断你的练习节奏',
      priority: 'high',
      durationMinutes: 10,
      tags: ['日常练习', '节奏保持'],
    });
  }

  if (totalMinutes < 60 && sessions.length < 3) {
    recommendations.push({
      id: 'rec_consistency',
      title: '基础巩固练习',
      type: 'exercise',
      description: '今天练习时间较短，建议进行基础巩固练习',
      reason: '基础巩固是进步的关键，每天至少保持15分钟练习',
      priority: 'medium',
      durationMinutes: 15,
      tags: ['基础', '巩固'],
    });
  }

  const knowledgeRecommendations = knowledgeBase.items.filter((item) => {
    const userSkills = new Set<string>();
    sessions.forEach((s) => {
      s.painPoints?.forEach((p) => userSkills.add(p));
    });
    return item.relatedSkills.some((skill) => userSkills.has(skill));
  });

  if (knowledgeRecommendations.length > 0) {
    recommendations.push({
      id: `rec_knowledge_${knowledgeRecommendations[0].id}`,
      title: knowledgeRecommendations[0].title,
      type: 'knowledge',
      description: `学习「${knowledgeRecommendations[0].title}」相关知识`,
      reason: '了解相关乐理知识有助于更好地理解练习内容',
      priority: 'low',
      durationMinutes: 10,
      tags: ['乐理', knowledgeRecommendations[0].category],
      knowledgeId: knowledgeRecommendations[0].id,
    });
  }

  if (avgBPM > 80 && userLevel === 'beginner') {
    recommendations.push({
      id: 'rec_slow',
      title: '慢速精准练习',
      type: 'exercise',
      description: '以60-70 BPM慢速练习，确保每个音清晰准确',
      reason: '当前练习速度偏快，建议降低速度，注重精准度',
      priority: 'medium',
      targetBPM: 70,
      durationMinutes: 20,
      tags: ['慢速', '精准'],
    });
  }

  return recommendations.slice(0, 5);
}
