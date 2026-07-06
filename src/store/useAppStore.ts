import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppState, Session, Lesson, CoverProject, MaterialInboxItem, EfficientPracticePlan, AIFeedback, VideoResource } from '@/types';
import { defaultData } from '@/data/defaultData';
import { generateDemoData } from '@/data/demoData';
import { extractBvid } from '@/utils/bilibili';

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function migrateData(data: Partial<AppState>): AppState {
  const result = { ...defaultData, ...data } as AppState;

  if (result.sources) {
    result.sources = result.sources.map(src => ({
      ...src,
      lessons: (src.lessons || []).map(les => ({
        projectId: les.projectId !== undefined ? les.projectId : null,
        sectionId: les.sectionId !== undefined ? les.sectionId : null,
        ...les,
      })),
    }));
  }

  if (result.sessions) {
    result.sessions = result.sessions.map(s => {
      const sessionObj = s as unknown as Record<string, unknown>;
      const selfRating = s.selfRating ?? (sessionObj.rating as number | undefined) ?? 0;
      const currentBPM = s.currentBPM || s.bpm || 0;
      const cleanBPM = s.cleanBPM !== undefined
        ? s.cleanBPM
        : Math.max(0, currentBPM - (selfRating <= 2 ? 10 : selfRating <= 3 ? 5 : 0));
      return {
        ...s,
        aiFeedback: s.aiFeedback !== undefined ? s.aiFeedback : null,
        painPointDetails: Array.isArray(s.painPointDetails) ? s.painPointDetails : [],
        cleanBPM: Math.max(0, cleanBPM),
        selfRating: selfRating,
        lessonId: s.lessonId || null,
      };
    });
  }

  if (!result.coverProjects || !Array.isArray(result.coverProjects)) {
    result.coverProjects = [];
  }

  if (result.currentEfficientPlan === undefined) {
    result.currentEfficientPlan = null;
  }

  if (result.videoSize === undefined) {
    result.videoSize = 'compact';
  }

  if (!result.materialInbox || !Array.isArray(result.materialInbox)) {
    result.materialInbox = [];
  }

  if (!result.videoResources || !Array.isArray(result.videoResources)) {
    result.videoResources = defaultData.videoResources;
  }

  if (!result.recentResources || !Array.isArray(result.recentResources)) {
    result.recentResources = [];
  }

  if (!result.favoriteResources || !Array.isArray(result.favoriteResources)) {
    result.favoriteResources = [];
  }

  if (!result.knowledgeBase) {
    result.knowledgeBase = { ...defaultData.knowledgeBase };
  }

  if (!result.painPointOptions || !Array.isArray(result.painPointOptions)) {
    result.painPointOptions = [...defaultData.painPointOptions];
  }

  if (!result.instruments || !Array.isArray(result.instruments)) {
    result.instruments = defaultData.instruments;
  }

  return result;
}

interface AppStore extends AppState {
  addSession: (session: Omit<Session, 'id'>) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  addLesson: (sourceId: string, lesson: Omit<Lesson, 'id' | 'sourceId'>) => void;
  updateLesson: (id: string, updates: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;
  addCoverProject: (project: Omit<CoverProject, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCoverProject: (id: string, updates: Partial<CoverProject>) => void;
  deleteCoverProject: (id: string) => void;
  updateCoverSection: (projectId: string, sectionId: string, updates: Partial<AppState['coverProjects'][0]['sections'][0]>) => void;
  addMaterialToInbox: (material: Omit<MaterialInboxItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMaterialInbox: (id: string, updates: Partial<MaterialInboxItem>) => void;
  deleteMaterialInbox: (id: string) => void;
  setCurrentEfficientPlan: (plan: EfficientPracticePlan | null) => void;
  setSessionFeedback: (sessionId: string, feedback: AIFeedback) => void;
  addRecentResource: (type: string, id: string) => void;
  toggleFavoriteResource: (resourceId: string) => void;
  updateVideoResourcePage: (resourceId: string, page: number) => void;
  loadDemoData: () => void;
  exportData: () => string;
  importData: (data: unknown) => boolean;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...migrateData({}),

      addSession: (session) => set((state) => ({
        sessions: [...state.sessions, { ...session, id: uid('sess') }],
      })),

      updateSession: (id, updates) => set((state) => ({
        sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      })),

      addLesson: (sourceId, lesson) => set((state) => ({
        sources: state.sources.map((src) =>
          src.id === sourceId
            ? { ...src, lessons: [...src.lessons, { ...lesson, id: uid('les'), sourceId }] }
            : src
        ),
      })),

      updateLesson: (id, updates) => set((state) => ({
        sources: state.sources.map((src) => ({
          ...src,
          lessons: src.lessons.map((les) => (les.id === id ? { ...les, ...updates } : les)),
        })),
      })),

      deleteLesson: (id) => set((state) => ({
        sources: state.sources.map((src) => ({
          ...src,
          lessons: src.lessons.filter((les) => les.id !== id),
        })),
        sessions: state.sessions.filter((s) => s.lessonId !== id),
      })),

      addCoverProject: (project) => set((state) => ({
        coverProjects: [...state.coverProjects, {
          ...project,
          id: uid('cover'),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }],
      })),

      updateCoverProject: (id, updates) => set((state) => ({
        coverProjects: state.coverProjects.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
        ),
      })),

      deleteCoverProject: (id) => set((state) => ({
        coverProjects: state.coverProjects.filter((p) => p.id !== id),
      })),

      updateCoverSection: (projectId, sectionId, updates) => set((state) => ({
        coverProjects: state.coverProjects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                sections: p.sections.map((s) =>
                  s.id === sectionId ? { ...s, ...updates } : s
                ),
                updatedAt: Date.now(),
              }
            : p
        ),
      })),

      addMaterialToInbox: (material) => set((state) => ({
        materialInbox: [...state.materialInbox, {
          ...material,
          id: uid('mat'),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }],
      })),

      updateMaterialInbox: (id, updates) => set((state) => ({
        materialInbox: state.materialInbox.map((m) =>
          m.id === id ? { ...m, ...updates, updatedAt: Date.now() } : m
        ),
      })),

      deleteMaterialInbox: (id) => set((state) => ({
        materialInbox: state.materialInbox.filter((m) => m.id !== id),
      })),

      setCurrentEfficientPlan: (plan) => set({ currentEfficientPlan: plan }),

      setSessionFeedback: (sessionId, feedback) => set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === sessionId ? { ...s, aiFeedback: feedback } : s
        ),
      })),

      addRecentResource: (type, id) => set((state) => {
        const existing = state.recentResources.find((r) => r.type === type && r.id === id);
        if (existing) {
          return {
            recentResources: [{ type, id, timestamp: Date.now() }, ...state.recentResources.filter((r) => !(r.type === type && r.id === id))].slice(0, 10),
          };
        }
        return {
          recentResources: [{ type, id, timestamp: Date.now() }, ...state.recentResources].slice(0, 10),
        };
      }),

      toggleFavoriteResource: (resourceId) => set((state) => {
        const isFav = state.favoriteResources.includes(resourceId);
        return {
          favoriteResources: isFav
            ? state.favoriteResources.filter((id) => id !== resourceId)
            : [...state.favoriteResources, resourceId],
        };
      }),

      updateVideoResourcePage: (resourceId, page) => set((state) => ({
        videoResources: state.videoResources.map((v) =>
          v.id === resourceId ? { ...v, episodes: v.episodes?.map((e) =>
            e.page === page ? { ...e, page } : e
          ) } : v
        ),
      })),

      loadDemoData: () => set(generateDemoData()),

      exportData: () => {
        const state = get();
        return JSON.stringify(state, null, 2);
      },

      importData: (data) => {
        try {
          if (typeof data !== 'object' || data === null) return false;
          const migrated = migrateData(data as Partial<AppState>);
          set(migrated);
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'riffcoach-storage',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState, version) => {
        if (version === 1) {
          return migrateData(persistedState as Partial<AppState>);
        }
        return persistedState as AppState;
      },
    }
  )
);
