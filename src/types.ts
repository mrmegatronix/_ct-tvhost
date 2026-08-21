export interface SlideData {
  id: string;
  day?: string;
  title: string;
  description: string;
  price?: string;
  imageUrl?: string;
  backgroundImageUrl?: string;
  descriptionImageUrl?: string;
  highlightColor: string;
  type: 'promo' | 'video' | 'image';
  disabled: boolean;
  duration?: number; // Override default duration in ms
}

export type AppMode = 'slides' | 'raffle' | 'losers' | 'fireplace' | 'quiz' | 'ace' | 'weather';

export interface RaffleSettings {
  rangeStart: number;
  rangeEnd: number;
  drawCount: number;
  drawnNumbers: number[];
  winnerExclusions: number[];
  monsterRaffleStartDay: string;
  monsterRaffleStartTime: string;
  prizePool: number;
  eposTakings: number;
  cashTakings: number;
}

export interface LoserSettings {
  drawCount: number;
  drawnNumbers: number[];
}

export interface ScheduleItem {
  id: string;
  mode: AppMode;
  days: string[]; // ['Monday', 'Tuesday', ... 'Everyday']
  startTime: string; // 'HH:MM'
  endTime: string; // 'HH:MM'
  isActive: boolean;
}

export interface GlobalState {
  mode: AppMode;
  currentSlideIndex: number;
  isPlaying: boolean;
  slides: SlideData[];
  raffleSettings: RaffleSettings;
  loserSettings: LoserSettings;
  schedules: ScheduleItem[];
}

export const SLIDE_DURATION_MS = 30000; // Increased to 30 seconds
export const STORAGE_KEY = 'ct_tvhost_slides_v1';
export const RAFFLE_KEY = 'ct_tvhost_raffle_v1';
