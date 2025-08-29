

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type Grid = (number | null)[][];
export type GameState = 'menu' | 'playing' | 'paused' | 'won' | 'learn';

export type Theme = 'light' | 'dark';
export type ErrorCheckMode = 'instant' | 'manual' | 'off';
export type Language = 'en' | 'it';

export interface Settings {
    theme: Theme;
    errorCheckMode: ErrorCheckMode;
    language: Language;
    soundMode: 'sound' | 'vibrate' | 'mute';
}

export interface DifficultyStats {
    bestTime: number | null;
    gamesPlayed: number;
    gamesWon: number;
    totalTime: number; 
}

export interface GameStats {
    [key: string]: any; // Allow indexing with string
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
    expert: DifficultyStats;
    currentStreak: number;
    maxStreak: number;
}

export interface GameSaveState {
    difficulty: Difficulty;
    puzzle: Grid;
    solution: Grid;
    playerGrid: Grid;
    time: number;
    mistakes: number;
    hintsLeft: number;
    notes: number[][][];
}