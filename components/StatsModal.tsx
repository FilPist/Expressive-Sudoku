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
    className="fixed inset-0 bg-brand-dark/50 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in"
    onClick={onClose}
  >
    <div 
      className="bg-surface-light dark:bg-surface-dark border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl shadow-brand-dark/20 dark:shadow-black/30 p-6 sm:p-8 text-text-light dark:text-text-dark max-w-lg w-full animate-jelly-in"
      onClick={(e) => e.stopPropagation()}
      style={{'--ease-spring': 'cubic-bezier(0.5, 1.5, 0.5, 1)'} as React.CSSProperties}
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
        <p className="text-xs sm:text-sm text-text-muted-light dark:text-text-muted-dark mb-1">{label}</p>
        <p className="text-base sm:text-lg font-bold text-accent dark:text-secondary">{value}</p>
    </div>
);

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats, t }) => {
  if (!isOpen) return null;

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center gap-4 mb-6">
        <StatsIcon className="w-10 h-10 text-accent dark:text-secondary" />
        <h2 className="text-4xl font-black tracking-tight">{t('statistics')}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-brand-dark/5 dark:bg-brand-dark/50 p-4 rounded-2xl mb-6">
        <div className="text-center">
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark mb-1">{t('currentStreak')}</p>
            <p className="text-2xl font-bold text-accent dark:text-secondary">{stats.currentStreak}</p>
        </div>
         <div className="text-center">
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark mb-1">{t('maxStreak')}</p>
            <p className="text-2xl font-bold text-accent dark:text-secondary">{stats.maxStreak}</p>
        </div>
      </div>

      <div className="space-y-4">
        {difficulties.map(diff => {
            const diffStats = stats[diff];
            const avgTime = diffStats.gamesWon > 0 ? diffStats.totalTime / diffStats.gamesWon : null;
            return (
                <div key={diff} className="p-4 rounded-2xl bg-brand-dark/5 dark:bg-brand-dark/50">
                    <h3 className="text-xl sm:text-2xl font-bold capitalize mb-3 text-text-light dark:text-text-dark">{t(diff)}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <StatItem label={t('bestTime')} value={formatTime(diffStats.bestTime)} />
                        <StatItem label={t('avgTime')} value={formatTime(avgTime ? Math.round(avgTime) : null)} />
                        <StatItem label={t('won')} value={`${diffStats.gamesWon} / ${diffStats.gamesPlayed}`} />
                        <StatItem label={t('winRate')} value={diffStats.gamesPlayed > 0 ? `${Math.round((diffStats.gamesWon / diffStats.gamesPlayed) * 100)}%` : '0%'} />
                    </div>
                </div>
            );
        })}
      </div>
       <button
        onClick={onClose}
        className="w-full mt-8 px-6 py-3 bg-accent text-white font-bold rounded-full hover:bg-accent-hover transition-all duration-200 ease-in-out active:scale-95 text-lg"
       >
        {t('close')}
      </button>
    </ModalWrapper>
  );
};