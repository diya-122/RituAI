import { create } from 'zustand';
import { PhaseKey } from '@/theme';

export type Lifestyle = {
  stress: number;
  sleep: number;
  activity: 'sedentary' | 'light' | 'regular' | 'athlete';
  diet: string[];
};

export type PCOSIndicators = {
  jawlineAcne: boolean;
  hairGrowth: boolean;
  hairThinning: boolean;
  weightChanges: boolean;
  missedCycles: boolean;
  moodSwings: boolean;
  darkPatches: boolean;
};

export type DailyLog = {
  id: string;
  date: string; // ISO
  cycleDay: number;
  phase: PhaseKey;
  flow?: 0 | 1 | 2 | 3 | 4;
  mood?: 1 | 2 | 3 | 4 | 5;
  energy?: 1 | 2 | 3 | 4 | 5;
  cramps?: 0 | 1 | 2 | 3 | 4;
  bbt?: number;
  lh?: number;
  verdict?: string;
  advice?: string;
};

export type SkinScan = {
  id: string;
  date: string;
  cycleDay: number;
  imageUri?: string;
  zones: {
    forehead: number;
    leftCheek: number;
    rightCheek: number;
    chin: number;
    jawline: number;
  };
  severity: number;
  lesionTypes: { papules: number; pustules: number; comedones: number; cysts: number };
  interpretation: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'saheli';
  content: string;
  timestamp: string;
};

type State = {
  // Auth / onboarding
  isAuthed: boolean;
  hasOnboarded: boolean;
  hasSeenTutorial: boolean;
  user: {
    name: string;
    email: string;
    phone?: string;
    role: 'USER' | 'ADMIN';
  } | null;

  // Cycle / phase
  cycleDay: number;
  currentPhase: PhaseKey;
  cycleLength: number;
  cycleVariance: number;
  lastPeriodStart: string;

  // Lifestyle & PCOS
  lifestyle: Lifestyle | null;
  pcos: PCOSIndicators | null;

  // Logs & scans
  logs: DailyLog[];
  scans: SkinScan[];
  chat: ChatMessage[];

  // Risk
  riskScore: number;

  // UI
  disguiseMode: boolean;
  theme: 'auto' | 'day' | 'night';
  reduceMotion: boolean;

  // Tutorial spotlight positions (measured at runtime)
  tutorialSpots: {
    ring: { cx: number; cy: number; r: number } | null;
    saheliCard: { cx: number; cy: number; r: number } | null;
    quickLog: { cx: number; cy: number; r: number } | null;
    fab: { cx: number; cy: number; r: number } | null;
  };

  // Actions
  login: (u: { name: string; email: string; phone?: string }) => void;
  signup: (u: { name: string; email: string; phone?: string }) => void;
  logout: () => void;
  completeOnboarding: (data: { lifestyle: Lifestyle; pcos: PCOSIndicators }) => void;
  markTutorialSeen: () => void;
  setPhase: (phase: PhaseKey, day: number) => void;
  addLog: (log: Partial<DailyLog>) => void;
  addScan: (scan: SkinScan) => void;
  addChatMessage: (msg: ChatMessage) => void;
  toggleDisguise: () => void;
  setTutorialSpot: (
    key: 'ring' | 'saheliCard' | 'quickLog' | 'fab',
    spot: { cx: number; cy: number; r: number },
  ) => void;
};

const mockLogs = (): DailyLog[] => {
  const logs: DailyLog[] = [];
  const now = Date.now();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now - i * 86400000);
    logs.push({
      id: `log-${i}`,
      date: d.toISOString(),
      cycleDay: ((28 - i) % 28) + 1,
      phase: (['menstrual', 'follicular', 'ovulatory', 'luteal'] as PhaseKey[])[i % 4],
      mood: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
      energy: (((i + 1) % 5) + 1) as 1 | 2 | 3 | 4 | 5,
      flow: (i < 5 ? ((i % 4) + 1) : 0) as 0 | 1 | 2 | 3 | 4,
    });
  }
  return logs;
};

const mockScans = (): SkinScan[] => {
  const scans: SkinScan[] = [];
  for (let i = 0; i < 12; i++) {
    scans.push({
      id: `scan-${i}`,
      date: new Date(Date.now() - i * 2 * 86400000).toISOString(),
      cycleDay: ((i * 2) % 28) + 1,
      zones: {
        forehead: Math.floor(Math.random() * 4),
        leftCheek: Math.floor(Math.random() * 3),
        rightCheek: Math.floor(Math.random() * 3),
        chin: Math.floor(Math.random() * 4) + 1,
        jawline: Math.floor(Math.random() * 4) + 2,
      },
      severity: Math.floor(Math.random() * 4) + 1,
      lesionTypes: {
        papules: Math.floor(Math.random() * 5),
        pustules: Math.floor(Math.random() * 3),
        comedones: Math.floor(Math.random() * 4),
        cysts: Math.floor(Math.random() * 2),
      },
      interpretation: 'Jawline-concentrated pattern, consistent with hormonal acne.',
    });
  }
  return scans;
};

export const useStore = create<State>((set) => ({
  isAuthed: true,
  hasOnboarded: true,
  hasSeenTutorial: true,
  user: { name: 'Admin', email: 'admin@ritualai.in', role: 'ADMIN' },

  cycleDay: 14,
  currentPhase: 'ovulatory',
  cycleLength: 32,
  cycleVariance: 6,
  lastPeriodStart: new Date(Date.now() - 14 * 86400000).toISOString(),

  lifestyle: null,
  pcos: null,

  logs: mockLogs(),
  scans: mockScans(),
  chat: [
    {
      id: 'seed-1',
      role: 'saheli',
      content:
        "Namaste. I'm Saheli, your companion in this journey. I'm here to listen, to notice patterns, and to help you understand your body — on your terms.",
      timestamp: new Date().toISOString(),
    },
  ],

  riskScore: 62,

  disguiseMode: false,
  theme: 'auto',
  reduceMotion: false,

  tutorialSpots: { ring: null, saheliCard: null, quickLog: null, fab: null },

  login: (u) => {
    const isAdmin =
      u.email.toLowerCase() === 'admin@ritualai.in' ||
      u.email.toLowerCase() === 'admin@ritual.ai';
    set({
      isAuthed: true,
      hasOnboarded: true,
      hasSeenTutorial: isAdmin,
      user: {
        name: isAdmin ? 'Admin' : u.name,
        email: u.email,
        phone: u.phone,
        role: isAdmin ? 'ADMIN' : 'USER',
      },
    });
  },

  signup: (u) =>
    set({
      isAuthed: true,
      hasOnboarded: false,
      hasSeenTutorial: false,
      user: { name: u.name, email: u.email, phone: u.phone, role: 'USER' },
    }),

  logout: () =>
    set({
      isAuthed: false,
      user: null,
      hasOnboarded: false,
      hasSeenTutorial: false,
    }),

  completeOnboarding: ({ lifestyle, pcos }) =>
    set({
      hasOnboarded: true,
      lifestyle,
      pcos,
    }),

  markTutorialSeen: () => set({ hasSeenTutorial: true }),

  setPhase: (phase, day) => set({ currentPhase: phase, cycleDay: day }),

  addLog: (partial) =>
    set((s) => ({
      logs: [
        {
          id: `log-${Date.now()}`,
          date: new Date().toISOString(),
          cycleDay: s.cycleDay,
          phase: s.currentPhase,
          ...partial,
        } as DailyLog,
        ...s.logs,
      ],
    })),

  addScan: (scan) => set((s) => ({ scans: [scan, ...s.scans] })),

  addChatMessage: (msg) => set((s) => ({ chat: [...s.chat, msg] })),

  toggleDisguise: () => set((s) => ({ disguiseMode: !s.disguiseMode })),

  setTutorialSpot: (key, spot) =>
    set((s) => ({ tutorialSpots: { ...s.tutorialSpots, [key]: spot } })),
}));
