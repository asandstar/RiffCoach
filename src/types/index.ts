export type Instrument = 'electric' | 'acoustic' | 'ukulele'

export type VideoSource = 'bilibili' | 'youtube' | 'local'

export type MaterialType = 'bilibili' | 'youtube' | 'score' | 'book' | 'note' | 'other'

export type MaterialStatus = 'unprocessed' | 'processed' | 'converted'

export type Stage = '零基础' | '入门' | '进阶' | '曲目' | '技巧' | '乐理'

export type PainPoint = 
  | '节奏不稳' 
  | '换和弦慢' 
  | '手指僵硬' 
  | '大横按切换慢' 
  | '高把位音准偏差' 
  | '拨弦力度不均' 
  | '换弦慢'
  | '其他'

export interface Lesson {
  id: string
  sourceId: string
  title: string
  targetBPM: number
  tags: string[]
  instrument: Instrument
  targetDuration: number
  lastPractice?: number
  bvid?: string
  page?: number
  url?: string
  projectId?: string | null
  sectionId?: string | null
}

export interface Source {
  id: string
  name: string
  type: VideoSource | 'book' | 'custom'
  lessons: Lesson[]
}

export interface Session {
  id: string
  lessonId: string | null
  instrument: Instrument
  date: number
  durationSeconds: number
  bpm: number
  currentBPM?: number
  repetitions: number
  selfRating: number
  painPoints: PainPoint[]
  painPointDetails: { painPoint: string; detail: string }[]
  notes: string
  aiFeedback?: AIFeedback | null
  cleanBPM: number
}

export interface CoverSection {
  id: string
  name: string
  targetBPM: number
  currentCleanBPM: number
  progress: number
  painPoints: string[]
  lessonIds: string[]
}

export interface CoverProject {
  id: string
  title: string
  artist: string
  instrument: Instrument
  goal: string
  targetDate: string
  sourceLinks: { type: string; title: string; url: string; bvid?: string; page?: number }[]
  sections: CoverSection[]
  aiPlan?: {
    summary: string
    nextStep: string
    estimatedDays: number
  }
  createdAt: number
  updatedAt: number
}

export interface AIFeedback {
  summary: string
  triedBPM: number
  cleanBPM: number
  reason: string
  nextPlan: string
  nextSteps: string[]
  avoid: string[]
  coverUpdate?: string
}

export interface MaterialInboxItem {
  id: string
  title: string
  type: MaterialType
  url?: string
  bvid?: string
  page?: number
  note?: string
  coverProjectId?: string
  sectionId?: string
  status: MaterialStatus
  extracted?: {
    suggestedTitle: string
    suggestedTags: string[]
    suggestedInstrument: string
    suggestedBPM: number
    suggestedDuration: number
    suggestedTasks: {
      title: string
      targetBPM: number
      targetDuration: number
      tags: string[]
      instruction: string
      projectId?: string
      sectionId?: string
    }[]
  }
  createdAt: number
  updatedAt: number
}

export interface VideoResource {
  id: string
  title: string
  source: VideoSource
  bvid?: string
  url?: string
  instrument: Instrument
  stage: Stage
  difficulty: 1 | 2 | 3 | 4 | 5
  skills: string[]
  summary: string
  keyPoints: string[]
  commonMistakes: string[]
  suggestedPractice: {
    durationMinutes: number
    startBPM?: number
    targetBPM?: number
    steps: string[]
  }
  episodes?: {
    page: number
    title: string
    skills: string[]
    summary: string
    suggestedTaskTitle: string
  }[]
  lastOpenedAt?: number
  favorite?: boolean
}

export interface KnowledgeSource {
  type: 'book' | 'video' | 'website' | 'tutorial' | 'manual' | 'course'
  title: string
  author?: string
  url?: string
}

export interface KnowledgeReadHistory {
  id: string
  readAt: number
  progress: number // 0-100
}

export interface KnowledgeBaseItem {
  id: string
  category: string
  instrument: Instrument | 'all'
  title: string
  difficulty: 1 | 2 | 3 | 4 | 5
  tags: string[]
  summary: string
  stage: Stage
  relatedSkills: string[]
  commonMistakes: string[]
  practiceSuggestions: string[]
  content: { type: string; text?: string; items?: string[] }[]
  sources?: KnowledgeSource[]
  readingTime?: number // 预计阅读时间(分钟)
  relatedKnowledgeIds?: string[]
  relatedVideoIds?: string[]
}

export interface KnowledgeCategory {
  id: string
  name: string
  icon: string
  instrument: Instrument | 'all'
  children?: { id: string; name: string }[]
}

export interface EfficientPracticePlan {
  target: string
  reason: string
  steps: { duration: number; bpm: number; desc: string }[]
  avoid: string[]
  completion: string
  projectId: string | null
  sectionId: string | null
  lessonId: string | null
}

export interface VideoProgress {
  videoId: string;
  page: number;
  progress: number;
  lastWatchedAt: number;
}

export interface AppState {
  instruments: { id: Instrument; name: string; gradient: string }[]
  sources: Source[]
  sessions: Session[]
  painPointOptions: PainPoint[]
  knowledgeBase: {
    categories: KnowledgeCategory[]
    items: KnowledgeBaseItem[]
    videos: VideoResource[]
    favorites: string[]
    readHistory: KnowledgeReadHistory[]
  }
  coverProjects: CoverProject[]
  currentEfficientPlan: EfficientPracticePlan | null
  materialInbox: MaterialInboxItem[]
  videoResources: VideoResource[]
  recentResources: { type: string; id: string; timestamp: number }[]
  favoriteResources: string[]
  videoSize: 'compact' | 'normal' | 'full'
  hasCompletedOnboarding: boolean
  selectedInstrument: Instrument
  userLevel: 'beginner' | 'intermediate' | 'advanced'
  videoProgresses: VideoProgress[]
}

export interface AIRecommendation {
  id: string;
  title: string;
  type: 'video' | 'exercise' | 'knowledge';
  description: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  targetBPM?: number;
  durationMinutes?: number;
  tags: string[];
  videoId?: string;
  knowledgeId?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  threshold: number;
  metric: 'minutes' | 'sessions' | 'streak' | 'bpm' | 'videos';
  unlocked: boolean;
  progress: number;
}

export type PageType = 
  | 'today' 
  | 'cover' 
  | 'resource' 
  | 'review' 
  | 'me' 
  | 'video-study' 
  | 'knowledge' 
  | 'practice' 
  | 'ai-feedback'
