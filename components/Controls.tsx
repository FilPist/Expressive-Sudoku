import React from 'react';
import type { ErrorCheckMode } from '../types';
import { EraseIcon, HintIcon, PencilIcon, CheckCircleIcon } from './Icons';

interface ControlsProps {
    onNumberClick: (num: number) => void;
    onErase: () => void;
    onHint: () => void;
    onCheckErrors: () => void;
    hintsLeft: number;
    onToggleNotesMode: () => void;
    isNotesMode: boolean;
    completedNumbers: Set<number>;
    errorCheckMode: ErrorCheckMode;
    conflictingNumbers?: Set<number>;
    allowedNumbers?: Set<number>;
    selectedNumber: number | null;
    t: (key: string, ...args: any[]) => string;
}

const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; label: string; isActive?: boolean; isDisabled?: boolean; className?: string }> = ({ onClick, children, label, isActive = false, isDisabled = false, className = '' }) => (
    <button onClick={onClick} disabled={isDisabled} className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl transition-all duration-200 ease-in-out active:scale-95 focus:outline-none w-full aspect-square disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent ${isActive ? 'bg-accent text-white shadow-lg shadow-accent/40' : 'bg-surface-light dark:bg-surface-dark text-text-muted-light dark:text-text-muted-dark hover:bg-accent/10 dark:hover:bg-accent/20 hover:text-accent dark:hover:text-secondary'} ${className}`}>
        {children}
        <span className="text-xs font-semibold tracking-wide">{label}</span>
    </button>
);

export const Controls: React.FC<ControlsProps> = ({ onNumberClick, onErase, onHint, onCheckErrors, hintsLeft, onToggleNotesMode, isNotesMode, completedNumbers, errorCheckMode, conflictingNumbers, allowedNumbers, selectedNumber, t }) => {
    return (
        <div className="w-full flex flex-col gap-3 sm:gap-4">
            <div className="p-2 bg-surface-light dark:bg-surface-dark backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-soft dark:shadow-soft-dark">
                <div className="grid grid-cols-4 gap-2">
                     <ActionButton onClick={onHint} label={t('hintWithCount', hintsLeft)} isDisabled={hintsLeft <= 0}>
                        <HintIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </ActionButton>
                    <ActionButton onClick={onErase} label={t('erase')}>
                        <EraseIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </ActionButton>
                    <ActionButton onClick={onToggleNotesMode} label={t('notes')} isActive={isNotesMode}>
                        <PencilIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </ActionButton>
                    {errorCheckMode === 'manual' ? (
                         <ActionButton onClick={onCheckErrors} label={t('check')} className="text-secondary hover:!text-secondary">
                            <CheckCircleIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                        </ActionButton>
                    ) : <div /> /* Placeholder for grid */}
                </div>
            </div>
             <div className="p-3 bg-surface-light dark:bg-surface-dark backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-soft dark:shadow-soft-dark">
                <div className="grid grid-cols-9 gap-1">
                    {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => {
                        const isCompleted = completedNumbers.has(num);
                        const isConflicting = isNotesMode && !isCompleted && conflictingNumbers?.has(num);
                        const isTutorialDisabled = allowedNumbers && !allowedNumbers.has(num);
                        const isSelected = !isCompleted && selectedNumber === num;
                        const isDisabled = isCompleted || isTutorialDisabled;

                        return (
                            <button
                                key={num}
                                onClick={() => onNumberClick(num)}
                                disabled={isDisabled}
                                className={`flex items-center justify-center text-2xl sm:text-3xl aspect-square rounded-full transition-all duration-200 ease-in-out active:scale-90 font-bold focus:outline-none ${
                                    isCompleted
                                    ? 'bg-text-light/10 text-text-light/30 dark:bg-text-dark/10 dark:text-text-dark/30 cursor-not-allowed'
                                    : isTutorialDisabled
                                    ? 'bg-text-light/10 text-text-light/30 dark:bg-text-dark/10 dark:text-text-dark/30 cursor-not-allowed opacity-50'
                                    : isSelected
                                    ? 'bg-accent text-white shadow-lg shadow-accent/50'
                                    : isConflicting
                                    ? 'bg-transparent text-text-muted-light dark:text-text-muted-dark opacity-40'
                                    : 'bg-transparent text-accent dark:text-secondary hover:bg-accent/10 dark:hover:bg-secondary/10'
                                }`}
                            >
                                {num}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}