import React from 'react';
import type { GameStats, Difficulty } from '../types';
import { TrophyIcon, TimerIcon, StatsIcon } from './Icons';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  t: (key: string) => string;
}

const ModalWrapper: React.FC<{ children: React.ReactNode, onClose: () => void }> = ({ children, onClose }) => (
  <div 
    className="fixed inset-0 bg-brand-dark/50 backdrop-blur-xl flex justify-center items-center z-50 p-2 sm:p-4 overflow-y-auto animate-fade-in"
    onClick={onClose}
  >
    <div 
      className="bg-surface-light dark:bg-surface-dark border border-white/20 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl shadow-brand-dark/20 dark:shadow-black/30 p-4 sm:p-6 text-text-light dark:text-text-dark max-w-md w-full my-auto animate-pop-in"
      onClick={(e) => e.stopPropagation()}
      style={{'--ease-spring': 'cubic-bezier(0.4, 0, 0.2, 1)'} as React.CSSProperties}
    >
      {children}
    </div>
  </div>
);

const formatTime = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return '–';
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const StatItem: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
    <div className="text-center">
        <p className="text-[10px] sm:text-xs text-text-muted-light dark:text-text-muted-dark leading-tight mb-0.5">{label}</p>
        <p className="text-xs sm:text-sm font-bold text-accent dark:text-secondary">{value}</p>
    </div>
);

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats, t }) => {
  if (!isOpen) return null;

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
        <StatsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-accent dark:text-secondary" />
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">{t('statistics')}</h2>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-brand-dark/5 dark:bg-brand-dark/50 py-1.5 px-3 rounded-xl mb-3">
        <div className="text-center">
            <p className="text-[10px] sm:text-xs text-text-muted-light dark:text-text-muted-dark">{t('currentStreak')}</p>
            <p className="text-base sm:text-lg font-bold text-accent dark:text-secondary">{stats.currentStreak}</p>
        </div>
         <div className="text-center">
            <p className="text-[10px] sm:text-xs text-text-muted-light dark:text-text-muted-dark">{t('maxStreak')}</p>
            <p className="text-base sm:text-lg font-bold text-accent dark:text-secondary">{stats.maxStreak}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {difficulties.map(diff => {
            const diffStats = stats[diff];
            const avgTime = diffStats.gamesWon > 0 ? diffStats.totalTime / diffStats.gamesWon : null;
            return (
                <div key={diff} className="p-2 sm:p-3 rounded-xl bg-brand-dark/5 dark:bg-brand-dark/50 flex flex-col justify-between">
                    <h3 className="text-xs sm:text-sm font-bold capitalize mb-1.5 text-text-light dark:text-text-dark text-center border-b border-brand-dark/5 dark:border-white/5 pb-1">{t(diff)}</h3>
                    <div className="grid grid-cols-2 gap-1 sm:gap-2">
                        <StatItem label={t('bestTime')} value={formatTime(diffStats.bestTime)} />
                        <StatItem label={t('avgTime')} value={formatTime(avgTime ? Math.round(avgTime) : null)} />
                        <StatItem label={t('won')} value={`${diffStats.gamesWon}/${diffStats.gamesPlayed}`} />
                        <StatItem label={t('winRate')} value={diffStats.gamesPlayed > 0 ? `${Math.round((diffStats.gamesWon / diffStats.gamesPlayed) * 100)}%` : '0%'} />
                    </div>
                </div>
            );
        })}
      </div>
       <button
        onClick={onClose}
        className="w-full mt-4 py-2 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-all duration-200 ease-in-out active:scale-95 text-sm sm:text-base"
       >
        {t('close')}
      </button>
    </ModalWrapper>
  );
};