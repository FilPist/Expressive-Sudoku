import type { Difficulty, GameStats, DifficultyStats } from '../types';

const STATS_KEY = 'sudokuGameStats';

const createDefaultStats = (): GameStats => {
  const defaultDifficultyStats: DifficultyStats = {
    bestTime: null,
    gamesPlayed: 0,
    gamesWon: 0,
    totalTime: 0,
  };
  return {
    easy: { ...defaultDifficultyStats },
    medium: { ...defaultDifficultyStats },
    hard: { ...defaultDifficultyStats },
    expert: { ...defaultDifficultyStats },
    currentStreak: 0,
    maxStreak: 0,
  };
};

export const loadStats = (): GameStats => {
  try {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to ensure all keys are present
      const defaults = createDefaultStats();
      return {
          ...defaults,
          ...parsed,
          easy: {...defaults.easy, ...parsed.easy},
          medium: {...defaults.medium, ...parsed.medium},
          hard: {...defaults.hard, ...parsed.hard},
          expert: {...defaults.expert, ...parsed.expert},
      };
    }
  } catch (error) {
    console.error("Failed to load stats:", error);
  }
  return createDefaultStats();
};

const saveStats = (stats: GameStats) => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error("Failed to save stats:", error);
  }
};

export const recordGameStart = (difficulty: Difficulty): void => {
  const stats = loadStats();
  stats[difficulty].gamesPlayed += 1;
  stats.currentStreak = 0; // Starting a new game breaks the streak unless it's a win
  saveStats(stats);
};

export const recordGameWin = (difficulty: Difficulty, time: number): void => {
  const stats = loadStats();
  const diffStats = stats[difficulty];
  
  diffStats.gamesWon += 1;
  diffStats.totalTime += time;
  
  if (diffStats.bestTime === null || time < diffStats.bestTime) {
    diffStats.bestTime = time;
  }
  
  stats.currentStreak += 1;
  if (stats.currentStreak > stats.maxStreak) {
    stats.maxStreak = stats.currentStreak;
  }
  
  saveStats(stats);
};

export const recordGameLossOrQuit = (): void => {
  const stats = loadStats();
  stats.currentStreak = 0;
  saveStats(stats);
};