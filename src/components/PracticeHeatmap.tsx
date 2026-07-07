import { useMemo } from 'react';
import type { Session } from '@/types';

interface PracticeHeatmapProps {
  sessions: Session[];
  days?: number;
}

export function PracticeHeatmap({ sessions, days = 35 }: PracticeHeatmapProps) {
  const { weeks, maxMinutes } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dayMap: Record<string, number> = {};
    sessions.forEach((s) => {
      const date = new Date(s.date);
      date.setHours(0, 0, 0, 0);
      const key = date.toISOString().split('T')[0];
      dayMap[key] = (dayMap[key] || 0) + Math.round(s.durationSeconds / 60);
    });

    const dayData: { date: Date; minutes: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dayData.push({ date: d, minutes: dayMap[key] || 0 });
    }

    const weeks: { date: Date; minutes: number }[][] = [];
    const startDay = dayData[0].date.getDay();
    
    for (let i = 0; i < startDay; i++) {
      const emptyDate = new Date(dayData[0].date);
      emptyDate.setDate(emptyDate.getDate() - (startDay - i));
      dayData.unshift({ date: emptyDate, minutes: -1 });
    }

    for (let i = 0; i < dayData.length; i += 7) {
      weeks.push(dayData.slice(i, i + 7));
    }

    const maxMin = Math.max(...dayData.filter((d) => d.minutes >= 0).map((d) => d.minutes), 30);

    return { weeks, maxMinutes: maxMin };
  }, [sessions, days]);

  const getColor = (minutes: number) => {
    if (minutes < 0) return 'bg-transparent';
    if (minutes === 0) return 'bg-primary-light/50';
    const ratio = minutes / maxMinutes;
    if (ratio < 0.25) return 'bg-primary/30';
    if (ratio < 0.5) return 'bg-primary/50';
    if (ratio < 0.75) return 'bg-primary/70';
    return 'bg-primary';
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const totalMinutes = sessions.reduce((acc, s) => acc + Math.round(s.durationSeconds / 60), 0);
  const activeDays = new Set(sessions.map((s) => new Date(s.date).toDateString())).size;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-text-primary">{totalMinutes}</p>
          <p className="text-xs text-text-tertiary">分钟（最近 {days} 天）</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{activeDays}</p>
          <p className="text-xs text-text-tertiary">练习天数</p>
        </div>
      </div>

      <div className="flex gap-1">
        <div className="flex flex-col gap-1 mr-1">
          {weekDays.map((d, i) => (
            <div key={d} className="h-3 text-[9px] text-text-tertiary flex items-center justify-end pr-1">
              {i % 2 === 1 ? d : ''}
            </div>
          ))}
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div
                  key={`${wi}-${di}`}
                  className={`w-3 h-3 rounded-sm ${getColor(day.minutes)} transition-colors`}
                  title={day.minutes >= 0 ? `${day.date.toLocaleDateString()}：${day.minutes} 分钟` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 text-xs text-text-tertiary">
        <span>少</span>
        <div className="w-3 h-3 rounded-sm bg-primary-light/50" />
        <div className="w-3 h-3 rounded-sm bg-primary/30" />
        <div className="w-3 h-3 rounded-sm bg-primary/50" />
        <div className="w-3 h-3 rounded-sm bg-primary/70" />
        <div className="w-3 h-3 rounded-sm bg-primary" />
        <span>多</span>
      </div>
    </div>
  );
}
