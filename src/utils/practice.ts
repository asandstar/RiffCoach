export type TimerMode = 'count-up' | 'count-down';
export type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8';
export type MetronomeTone = 'electronic' | 'woodblock' | 'click' | 'beep';

export interface TimeSignatureConfig {
  beats: number;
  downbeats: number[];
  label: string;
}

export const timeSignatureConfigs: Record<TimeSignature, TimeSignatureConfig> = {
  '2/4': { beats: 2, downbeats: [0], label: '2/4' },
  '3/4': { beats: 3, downbeats: [0], label: '3/4' },
  '4/4': { beats: 4, downbeats: [0], label: '4/4' },
  '6/8': { beats: 6, downbeats: [0, 3], label: '6/8' },
};

export interface MetronomeToneConfig {
  label: string;
  description: string;
}

export const metronomeToneConfigs: Record<MetronomeTone, MetronomeToneConfig> = {
  electronic: { label: '电子', description: '电子音效' },
  woodblock: { label: '木鱼', description: '木鱼音效' },
  click: { label: '点击', description: '清脆点击' },
  beep: { label: '蜂鸣', description: '经典蜂鸣' },
};

export interface PracticeTemplate {
  id: string;
  name: string;
  bpm: number;
  timeSignature: TimeSignature;
  timerMode: TimerMode;
  targetTime: number;
  metronomeTone: MetronomeTone;
  createdAt: number;
}

export const defaultTemplates: PracticeTemplate[] = [
  {
    id: 'temp_1',
    name: '热身练习',
    bpm: 60,
    timeSignature: '4/4',
    timerMode: 'count-down',
    targetTime: 5 * 60,
    metronomeTone: 'electronic',
    createdAt: Date.now(),
  },
  {
    id: 'temp_2',
    name: '节奏训练',
    bpm: 80,
    timeSignature: '4/4',
    timerMode: 'count-up',
    targetTime: 15 * 60,
    metronomeTone: 'click',
    createdAt: Date.now(),
  },
  {
    id: 'temp_3',
    name: '慢速练习',
    bpm: 40,
    timeSignature: '4/4',
    timerMode: 'count-down',
    targetTime: 10 * 60,
    metronomeTone: 'woodblock',
    createdAt: Date.now(),
  },
  {
    id: 'temp_4',
    name: '3/4拍练习',
    bpm: 70,
    timeSignature: '3/4',
    timerMode: 'count-up',
    targetTime: 10 * 60,
    metronomeTone: 'electronic',
    createdAt: Date.now(),
  },
];

export function getToneFrequency(tone: MetronomeTone, isDownbeat: boolean, isSubDownbeat: boolean): number {
  switch (tone) {
    case 'woodblock':
      return isDownbeat ? 800 : isSubDownbeat ? 600 : 400;
    case 'click':
      return isDownbeat ? 1500 : isSubDownbeat ? 1200 : 800;
    case 'beep':
      return isDownbeat ? 1000 : isSubDownbeat ? 800 : 600;
    case 'electronic':
    default:
      return isDownbeat ? 1200 : isSubDownbeat ? 1000 : 800;
  }
}

export function getToneVolume(tone: MetronomeTone, isDownbeat: boolean, isSubDownbeat: boolean): number {
  switch (tone) {
    case 'woodblock':
      return isDownbeat ? 0.5 : isSubDownbeat ? 0.4 : 0.3;
    case 'click':
      return isDownbeat ? 0.4 : isSubDownbeat ? 0.35 : 0.3;
    case 'beep':
      return isDownbeat ? 0.5 : isSubDownbeat ? 0.4 : 0.3;
    case 'electronic':
    default:
      return isDownbeat ? 0.4 : isSubDownbeat ? 0.35 : 0.3;
  }
}
