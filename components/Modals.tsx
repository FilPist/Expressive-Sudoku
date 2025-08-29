import React from 'react';
import { PlayIcon, TrophyIcon, TimerIcon, HomeIcon, PowerIcon } from './Icons';

const ModalWrapper: React.FC<{ children: React.ReactNode, isOpen: boolean }> = ({ children, isOpen }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-brand-dark/50 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-light dark:bg-surface-dark border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl shadow-brand-dark/20 dark:shadow-black/30 p-6 sm:p-8 text-center text-text-light dark:text-text-dark max-w-sm w-full animate-jelly-in" style={{'--ease-spring': 'cubic-bezier(0.5, 1.5, 0.5, 1)'} as React.CSSProperties}>
        {children}
      </div>
    </div>
  );
};

export const PauseModal: React.FC<{ onResume: () => void; onMenu: () => void; onQuit: () => void; t: (key: string) => string; }> = ({ onResume, onMenu, onQuit, t }) => (
  <ModalWrapper isOpen={true}>
    <h2 className="text-4xl font-black mb-8 tracking-tight">{t('gamePaused')}</h2>
    <div className="flex flex-col gap-4">
        <button
          onClick={onResume}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-accent text-white font-bold rounded-full hover:bg-accent-hover transition-all duration-200 ease-in-out active:scale-95 text-xl focus:outline-none"
        >
          <PlayIcon className="w-7 h-7" />
          {t('resume')}
        </button>
        <button
          onClick={onMenu}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-accent/10 text-accent dark:bg-secondary/10 dark:text-secondary font-semibold rounded-full hover:bg-accent/20 dark:hover:bg-secondary/20 transition-all duration-200 text-lg active:scale-95 focus:outline-none"
        >
          <HomeIcon className="w-6 h-6" />
          {t('backToMenu')}
        </button>
        <div className="w-40 border-t border-brand-dark/10 dark:border-brand-light/10 my-1 mx-auto"></div>
        <button
          onClick={onQuit}
          className="w-full flex items-center justify-center gap-3 px-6 py-2 bg-transparent text-danger font-semibold rounded-full hover:bg-danger/10 transition-all duration-200 text-lg active:scale-95 focus:outline-none"
        >
          <PowerIcon className="w-6 h-6" />
          {t('quitGame')}
        </button>
    </div>
  </ModalWrapper>
);

export const WinModal: React.FC<{ time: number; difficulty: string; onNewGame: () => void; t: (key: string) => string; }> = ({ time, difficulty, onNewGame, t }) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <ModalWrapper isOpen={true}>
            <TrophyIcon className="w-20 h-20 text-yellow-400 mx-auto mb-4 drop-shadow-lg" />
            <h2 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">{t('victory')}</h2>
            <p className="text-text-muted-light dark:text-text-muted-dark mb-6">{t('youSolvedThePuzzle')}</p>
            
            <div className="bg-brand-dark/5 dark:bg-brand-dark/50 p-4 rounded-2xl mb-8">
                <div className="flex justify-around items-center">
                    <div className="text-center">
                        <p className="text-sm text-text-muted-light dark:text-text-muted-dark">{t('difficulty')}</p>
                        <p className="text-lg font-bold capitalize text-accent dark:text-secondary">{t(difficulty)}</p>
                    </div>
                    <div className="border-l border-brand-dark/10 dark:border-brand-light/10 h-10"></div>
                    <div className="text-center">
                        <p className="text-sm text-text-muted-light dark:text-text-muted-dark flex items-center justify-center gap-1.5"><TimerIcon className="w-4 h-4"/> {t('time')}</p>
                        <p className="text-lg font-bold text-accent dark:text-secondary">{formatTime(time)}</p>
                    </div>
                </div>
            </div>

            <button
                onClick={onNewGame}
                className="w-full px-6 py-4 bg-accent text-white font-bold rounded-full hover:bg-accent-hover transition-all duration-200 ease-in-out active:scale-95 text-xl focus:outline-none"
            >
                {t('playAgain')}
            </button>
        </ModalWrapper>
    );
};


export const ConfirmModal: React.FC<{ 
    isOpen: boolean; 
    onConfirm: () => void; 
    onCancel: () => void; 
    title: string; 
    message: string; 
    t: (key: string) => string; 
    confirmText?: string;
    confirmClassName?: string;
}> = ({ isOpen, onConfirm, onCancel, title, message, t, confirmText, confirmClassName }) => (
  <ModalWrapper isOpen={isOpen}>
    <h2 className="text-3xl font-bold mb-4">{title}</h2>
    <p className="text-text-muted-light dark:text-text-muted-dark mb-8">{message}</p>
    <div className="flex justify-center gap-4">
      <button
        onClick={onCancel}
        className="px-8 py-3 bg-accent/10 text-accent dark:bg-secondary/10 dark:text-secondary font-bold rounded-full hover:bg-accent/20 dark:hover:bg-secondary/20 transition-all duration-200 active:scale-95 focus:outline-none"
      >
        {t('cancel')}
      </button>
      <button
        onClick={onConfirm}
        className={confirmClassName || "px-8 py-3 bg-danger text-white font-bold rounded-full hover:bg-rose-600 transition-all duration-200 active:scale-95 focus:outline-none"}
      >
        {confirmText || t('proceed')}
      </button>
    </div>
  </ModalWrapper>
);