import type { Achievement, Session, VideoProgress } from '@/types';

const achievementDefinitions = [
  { id: 'first_practice', title: '初试啼声', description: '完成第一次练习', icon: '🎸', color: 'bg-primary', threshold: 1, metric: 'sessions' as const },
  { id: 'five_minutes', title: '热身完成', description: '累计练习超过5分钟', icon: '⏱️', color: 'bg-mint', threshold: 5, metric: 'minutes' as const },
  { id: 'thirty_minutes', title: '渐入佳境', description: '累计练习超过30分钟', icon: '🔥', color: 'bg-amber-soft', threshold: 30, metric: 'minutes' as const },
  { id: 'one_hour', title: '专心致志', description: '累计练习超过1小时', icon: '💪', color: 'bg-lavender', threshold: 60, metric: 'minutes' as const },
  { id: 'three_hours', title: '持之以恒', description: '累计练习超过3小时', icon: '🌟', color: 'bg-primary', threshold: 180, metric: 'minutes' as const },
  { id: 'five_sessions', title: '习惯养成', description: '完成5次练习', icon: '📅', color: 'bg-mint', threshold: 5, metric: 'sessions' as const },
  { id: 'ten_sessions', title: '坚持不懈', description: '完成10次练习', icon: '🔄', color: 'bg-amber-soft', threshold: 10, metric: 'sessions' as const },
  { id: 'weekly_streak', title: '周练达人', description: '连续7天练习', icon: '🏆', color: 'bg-lavender', threshold: 7, metric: 'streak' as const },
  { id: 'bpm_80', title: '渐入佳境', description: '达到80 BPM', icon: '⚡', color: 'bg-primary', threshold: 80, metric: 'bpm' as const },
  { id: 'bpm_100', title: '行云流水', description: '达到100 BPM', icon: '🚀', color: 'bg-amber-soft', threshold: 100, metric: 'bpm' as const },
  { id: 'video_completion', title: '学习达人', description: '完成1个视频学习', icon: '📚', color: 'bg-mint', threshold: 1, metric: 'videos' as const },
  { id: 'three_videos', title: '知识渊博', description: '完成3个视频学习', icon: '🎓', color: 'bg-lavender', threshold: 3, metric: 'videos' as const },
];

function calculateStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0;

  const sortedSessions = [...sessions].sort((a, b) => b.date - a.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sessionDates = new Set(
    sortedSessions.map((s) => {
      const d = new Date(s.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    checkDate.setHours(0, 0, 0, 0);

    if (sessionDates.has(checkDate.getTime())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

export function calculateAchievements(
  sessions: Session[],
  videoProgresses: VideoProgress[]
): Achievement[] {
  const totalMinutes = Math.round(sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60);
  const totalSessions = sessions.length;
  const streak = calculateStreak(sessions);
  const maxBPM = sessions.length > 0 ? Math.max(...sessions.map((s) => s.bpm || 0)) : 0;
  const completedVideos = videoProgresses.filter((p) => p.progress >= 80).length;

  const metrics: Record<string, number> = {
    minutes: totalMinutes,
    sessions: totalSessions,
    streak: streak,
    bpm: maxBPM,
    videos: completedVideos,
  };

  return achievementDefinitions.map((def) => {
    const progress = metrics[def.metric] || 0;
    const unlocked = progress >= def.threshold;

    return {
      ...def,
      unlocked,
      progress,
    };
  });
}
