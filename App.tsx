import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { PauseModal, WinModal, ConfirmModal } from './components/Modals';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';
import { LearnMode } from './components/LearnMode';
import { generateSudoku } from './utils/sudoku';
import { loadStats, recordGameStart, recordGameWin, recordGameLossOrQuit } from './utils/stats';
import { t, setLanguage, initializeLanguage } from './utils/localization';
import { unlockAudio, playPlaceSound, playEraseSound, playWinSound, playClickSound, playHapticFeedback } from './utils/audio';
import type { Difficulty, Grid, GameState, GameSaveState, Settings, GameStats } from './types';
import { TimerIcon, MistakeIcon, SettingsIcon, StatsIcon, PauseIcon } from './components/Icons';

const SAVE_KEY = 'expressiveSudokuSave';
const SETTINGS_KEY = 'expressiveSudokuSettings';

const createEmptyGrid = (): Grid => Array(9).fill(null).map(() => Array(9).fill(null));
const createEmptyNotes = (): Set<number>[][] => Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set()));

export const App: React.FC = () => {
    const [showSplash, setShowSplash] = useState(true);
    const [gameState, setGameState] = useState<GameState>('menu');
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [puzzle, setPuzzle] = useState<Grid>(createEmptyGrid());
    const [solution, setSolution] = useState<Grid>(createEmptyGrid());
    const [playerGrid, setPlayerGrid] = useState<Grid>(createEmptyGrid());
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [errors, setErrors] = useState<boolean[][]>(() => Array(9).fill(null).map(() => Array(9).fill(false)));
    const [mistakes, setMistakes] = useState(0);
    const [time, setTime] = useState(0);
    const [hintsLeft, setHintsLeft] = useState(3);
    const [animatedCells, setAnimatedCells] = useState<{ row: number; col: number }[]>([]);
    const [isNotesMode, setIsNotesMode] = useState(false);
    const [notes, setNotes] = useState<Set<number>[][]>(createEmptyNotes());
    const [lastPlayedCell, setLastPlayedCell] = useState<{ row: number; col: number } | null>(null);
    
    // Modals and settings state
    const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
    const [showQuitConfirm, setShowQuitConfirm] = useState(false);
    const [newGameDifficulty, setNewGameDifficulty] = useState<Difficulty | null>(null);
    const [savedGameExists, setSavedGameExists] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [stats, setStats] = useState<GameStats>(loadStats());
    const [settings, setSettings] = useState<Settings>(() => {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        const defaultSettings: Settings = { theme: 'dark', errorCheckMode: 'manual', language: initializeLanguage(), soundMode: 'sound' };
        const parsed = savedSettings ? JSON.parse(savedSettings) : {};
        const finalSettings = { ...defaultSettings, ...parsed };
        setLanguage(finalSettings.language);
        // Migration for old sound setting
        if (typeof (finalSettings as any).sound === 'boolean') {
            finalSettings.soundMode = (finalSettings as any).sound ? 'sound' : 'mute';
            delete (finalSettings as any).sound;
        }
        return finalSettings;
    });
    
    useEffect(() => {
        const unlock = () => {
            unlockAudio();
            window.removeEventListener('click', unlock);
            window.removeEventListener('keydown', unlock);
        };
        window.addEventListener('click', unlock);
        window.addEventListener('keydown', unlock);
        return () => {
            window.removeEventListener('click', unlock);
            window.removeEventListener('keydown', unlock);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (settings.theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        setLanguage(settings.language);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        setSavedGameExists(!!localStorage.getItem(SAVE_KEY));
    }, [gameState]);

    const saveGame = useCallback(() => {
        if (gameState !== 'playing') return;
        const notesToSave = notes.map(row => row.map(cellNotes => Array.from(cellNotes)));
        const stateToSave: GameSaveState = { difficulty, puzzle, solution, playerGrid, time, mistakes, hintsLeft, notes: notesToSave };
        localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
        setSavedGameExists(true);
    }, [difficulty, puzzle, solution, playerGrid, time, mistakes, hintsLeft, notes, gameState]);

    useEffect(() => {
        if (gameState === 'playing') {
            const timer = setInterval(() => setTime(t => t + 1), 1000);
            window.addEventListener('beforeunload', saveGame);
            return () => {
                clearInterval(timer);
                window.removeEventListener('beforeunload', saveGame);
                saveGame();
            };
        }
    }, [gameState, saveGame]);

    useEffect(() => {
        if (gameState === 'won') {
             if (settings.soundMode === 'sound') {
                playWinSound();
            } else if (settings.soundMode === 'vibrate') {
                playHapticFeedback([100, 30, 100, 30, 200]);
            }
        }
    }, [gameState, settings.soundMode]);
    
    const playFeedback = useCallback((soundFunc: () => void, hapticPattern?: number | number[]) => {
        if (settings.soundMode === 'sound') {
            soundFunc();
        } else if (settings.soundMode === 'vibrate') {
            playHapticFeedback(hapticPattern);
        }
    }, [settings.soundMode]);
    
    const startNewGame = useCallback((diff: Difficulty) => {
        playFeedback(playClickSound);
        const newStats = recordGameStart(diff);
        setStats(newStats); 
        setDifficulty(diff);
        const { puzzle: newPuzzle, solution: newSolution } = generateSudoku(diff);
        setPuzzle(newPuzzle);
        setSolution(newSolution);
        setPlayerGrid(newPuzzle);
        setGameState('playing');
        setTime(0);
        setMistakes(0);
        setHintsLeft(3);
        setSelectedCell(null);
        setErrors(Array(9).fill(null).map(() => Array(9).fill(false)));
        setNotes(createEmptyNotes());
        setIsNotesMode(false);
    }, [playFeedback]);

    const handleNewGameRequest = (diff: Difficulty) => {
        if (gameState === 'playing' || savedGameExists) {
            setNewGameDifficulty(diff);
            setShowNewGameConfirm(true);
        } else {
            startNewGame(diff);
        }
    };
    
    const confirmNewGame = () => {
        if (newGameDifficulty) {
            if (gameState === 'playing') recordGameLossOrQuit();
            localStorage.removeItem(SAVE_KEY);
            setSavedGameExists(false);
            startNewGame(newGameDifficulty);
        }
        setShowNewGameConfirm(false);
    };

    const handleContinue = () => {
        playFeedback(playClickSound);
        const savedData = localStorage.getItem(SAVE_KEY);
        if (savedData) {
            const saved: GameSaveState = JSON.parse(savedData);
            setDifficulty(saved.difficulty);
            setPuzzle(saved.puzzle);
            setSolution(saved.solution);
            setPlayerGrid(saved.playerGrid);
            setTime(saved.time);
            setMistakes(saved.mistakes);
            setHintsLeft(saved.hintsLeft);
            setNotes(saved.notes ? saved.notes.map(r => r.map(cell => new Set(cell))) : createEmptyNotes());
            setGameState('playing');
        }
    };

    const goToMenu = () => {
        playFeedback(playClickSound);
        if (gameState === 'playing') {
             saveGame();
        }
        setGameState('menu');
    };

    const handleQuitRequest = () => {
        setShowQuitConfirm(true);
    };

    const confirmQuit = () => {
        playFeedback(playClickSound);
        recordGameLossOrQuit();
        localStorage.removeItem(SAVE_KEY);
        setSavedGameExists(false);
        setStats(loadStats());
        setGameState('menu');
        setShowQuitConfirm(false);
    };

    const checkCompletion = useCallback((grid: Grid, row: number, col: number) => {
        const isComplete = (arr: (number | null)[]) => {
            const nums = arr.filter(n => n !== null);
            if (nums.length !== 9) return false;
            return new Set(nums).size === 9;
        };
    
        let completedUnitCells: {row: number, col: number}[] = [];

        if (isComplete(grid[row])) {
            completedUnitCells.push(...Array.from({ length: 9 }, (_, i) => ({ row, col: i })));
        }
        
        const columnArr = grid.map(r => r[col]);
        if (isComplete(columnArr)) {
            completedUnitCells.push(...Array.from({ length: 9 }, (_, i) => ({ row: i, col })));
        }
        
        const boxRowStart = Math.floor(row / 3) * 3;
        const boxColStart = Math.floor(col / 3) * 3;
        const boxArr = [];
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) boxArr.push(grid[boxRowStart + i][boxColStart + j]);
        if (isComplete(boxArr)) {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    completedUnitCells.push({ row: boxRowStart + i, col: boxColStart + j });
                }
            }
        }
    
        if (completedUnitCells.length > 0) {
            setAnimatedCells(prev => [...new Set([...prev, ...completedUnitCells])]);
            setTimeout(() => setAnimatedCells([]), 1000);
        }
    }, []);

    const handleNumberInput = useCallback((num: number) => {
        if (!selectedCell || puzzle[selectedCell.row][selectedCell.col] !== null) return;
        const { row, col } = selectedCell;

        if (isNotesMode) {
            playFeedback(playClickSound, 20);
            const newNotes = notes.map(r => r.map(s => new Set(s)));
            if (newNotes[row][col].has(num)) newNotes[row][col].delete(num);
            else newNotes[row][col].add(num);
            setNotes(newNotes);
            return;
        }

        const newGrid = playerGrid.map(r => [...r]);
        newGrid[row][col] = num;
        setPlayerGrid(newGrid);
        setLastPlayedCell({ row, col });
        setTimeout(() => setLastPlayedCell(null), 500);
        playFeedback(playPlaceSound, 50);

        if (settings.errorCheckMode === 'instant') {
            const newErrors = errors.map(r => [...r]);
            if (num !== solution[row][col]) {
                setMistakes(m => m + 1);
                newErrors[row][col] = true;
            } else {
                newErrors[row][col] = false;
            }
            setErrors(newErrors);
        }
        
        const newNotes = notes.map(r => r.map(s => new Set(s)));
        newNotes[row][col].clear();
        setNotes(newNotes);
        checkCompletion(newGrid, row, col);

        const isWin = newGrid.every((r, ri) => r.every((c, ci) => c === solution[ri][ci]));
        if (isWin) {
            setGameState('won');
            localStorage.removeItem(SAVE_KEY);
            setSavedGameExists(false);
            recordGameWin(difficulty, time);
            setStats(loadStats());
        }
    }, [selectedCell, playerGrid, puzzle, solution, errors, checkCompletion, isNotesMode, notes, settings.errorCheckMode, difficulty, time, playFeedback]);

    const handleErase = () => {
        if (!selectedCell || puzzle[selectedCell.row][selectedCell.col] !== null) return;
        const { row, col } = selectedCell;
        
        if (playerGrid[row][col] !== null || notes[row][col].size > 0) {
            playFeedback(playEraseSound, 30);
        }

        if (playerGrid[row][col] !== null) {
            const newGrid = playerGrid.map(r => [...r]);
            newGrid[row][col] = null;
            setPlayerGrid(newGrid);
            const newErrors = errors.map(r => [...r]);
            newErrors[row][col] = false;
            setErrors(newErrors);
        } else if (notes[row][col].size > 0) {
            const newNotes = notes.map(r => r.map(s => new Set(s)));
            newNotes[row][col].clear();
            setNotes(newNotes);
        }
    };
    
    const handleHint = () => {
        if (hintsLeft <= 0 || !selectedCell) return;
        const {row, col} = selectedCell;
        if(playerGrid[row][col] !== null) return;
        
        playFeedback(playPlaceSound, 50);

        const newGrid = playerGrid.map(r => [...r]);
        newGrid[row][col] = solution[row][col];
        setPlayerGrid(newGrid);
        setHintsLeft(h => h - 1);
        setIsNotesMode(false);
        const newNotes = notes.map(r => r.map(s => new Set(s)));
        newNotes[row][col].clear();
        setNotes(newNotes);
        setLastPlayedCell({ row, col });
        setTimeout(() => setLastPlayedCell(null), 500);
        checkCompletion(newGrid, row, col);
    };

    const handleCheckErrors = () => {
        playFeedback(playClickSound);
        let mistakesCount = 0;
        const newErrors = Array(9).fill(null).map(() => Array(9).fill(false));
        for(let r=0; r<9; r++){
            for(let c=0; c<9; c++){
                const isPlayerInput = playerGrid[r][c] !== null && puzzle[r][c] === null;
                if(isPlayerInput && playerGrid[r][c] !== solution[r][c]){
                    newErrors[r][c] = true;
                    mistakesCount++;
                }
            }
        }
        setErrors(newErrors);
        setMistakes(mistakesCount);
    };


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== 'playing' || showNewGameConfirm || showSettingsModal || showStatsModal || showQuitConfirm) return;
            
            if (e.key >= '1' && e.key <= '9') handleNumberInput(parseInt(e.key, 10));
            else if (e.key === 'Backspace' || e.key === 'Delete') handleErase();
            else if (e.key.toLowerCase() === 'n') setIsNotesMode(prev => !prev);
            else if (e.key.toLowerCase() === 'h' && hintsLeft > 0) handleHint();
            else if (e.key.startsWith('Arrow')) {
                e.preventDefault();
                let { row, col } = selectedCell || { row: -1, col: 0 };
                if (row === -1) { setSelectedCell({row: 0, col: 0}); return; }
                if (e.key === 'ArrowUp') row = Math.max(0, row - 1);
                if (e.key === 'ArrowDown') row = Math.min(8, row + 1);
                if (e.key === 'ArrowLeft') col = Math.max(0, col - 1);
                if (e.key === 'ArrowRight') col = Math.min(8, col + 1);
                setSelectedCell({ row, col });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, selectedCell, handleNumberInput, handleErase, showNewGameConfirm, showSettingsModal, showStatsModal, showQuitConfirm, handleHint, hintsLeft]);

    const completedNumbers = useMemo(() => {
        const counts: { [key: number]: number } = {};
        for(let i=1; i<=9; i++) counts[i] = 0;

        const completed = new Set<number>();
        playerGrid.forEach(row => row.forEach(cell => {
            if (cell !== null) counts[cell]++;
        }));

        for (let num = 1; num <= 9; num++) {
            if (counts[num] === 9) {
                 completed.add(num);
            }
        }
        return completed;
    }, [playerGrid]);

    const conflictingNumbers = useMemo(() => {
        if (!isNotesMode || !selectedCell) {
            return new Set<number>();
        }

        const conflicts = new Set<number>();
        const { row, col } = selectedCell;

        for (let i = 0; i < 9; i++) {
            const val = playerGrid[row][i];
            if (val) conflicts.add(val);
        }

        for (let i = 0; i < 9; i++) {
            const val = playerGrid[i][col];
            if (val) conflicts.add(val);
        }

        const boxRowStart = Math.floor(row / 3) * 3;
        const boxColStart = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const val = playerGrid[boxRowStart + i][boxColStart + j];
                if (val) conflicts.add(val);
            }
        }

        return conflicts;
    }, [isNotesMode, selectedCell, playerGrid]);
    
    const selectedCellValue = selectedCell ? playerGrid[selectedCell.row][selectedCell.col] : null;

    const DifficultyButton: React.FC<{ diff: Difficulty, label: string }> = ({ diff, label }) => (
        <button onClick={() => handleNewGameRequest(diff)} className="w-full max-w-xs px-6 py-4 text-xl font-bold rounded-full transition-all duration-300 capitalize bg-surface-light dark:bg-surface-dark backdrop-blur-md border border-white/20 dark:border-white/10 text-text-light dark:text-text-dark hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white hover:scale-105 active:scale-[0.98] focus:outline-none shadow-soft dark:shadow-soft-dark">
            {label}
        </button>
    );
    
    const Logo = ({ showSubtitle = false }: { showSubtitle?: boolean }) => (
        <div className="flex flex-col items-center text-center">
            <svg width="80" height="80" viewBox="0 0 100 100" className="mb-4 text-accent drop-shadow-[0_2px_8px_var(--tw-shadow-color)] shadow-accent">
                <defs>
                    <rect id="cell" width="24" height="24" rx="4" className="transition-colors" />
                </defs>
                <g className="animate-logo-spin" style={{ transformOrigin: '50% 50%' }}>
                    {/* Grid cells */}
                    {[...Array(3)].map((_, i) =>
                        [...Array(3)].map((_, j) => (
                            <use
                                key={`${i}-${j}`}
                                href="#cell"
                                x={14 + j * 26}
                                y={14 + i * 26}
                                fill="currentColor"
                                className="animate-logo-rect"
                                style={{
                                    animationDelay: `${(i * 3 + j) * 60}ms`,
                                    '--ease-spring': 'cubic-bezier(0.5, 1.5, 0.5, 1)',
                                    opacity: [0, 4, 8].includes(i * 3 + j) ? 0.6 : 1
                                } as React.CSSProperties}
                            />
                        ))
                    )}
                    {/* Numbers are now inside the rotating group */}
                    <g style={{ pointerEvents: 'none' }}>
                        <text x="26" y="26" alignmentBaseline="middle" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="bold" fill="white">5</text>
                        <text x="52" y="52" alignmentBaseline="middle" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="bold" fill="white">3</text>
                        <text x="78" y="78" alignmentBaseline="middle" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="bold" fill="white">9</text>
                    </g>
                </g>
            </svg>
            <h1 className="text-5xl md:text-6xl font-black text-text-light dark:text-text-dark tracking-tighter">Expressive Sudoku</h1>
            {showSubtitle && <p className="text-text-muted-light dark:text-text-muted-dark mt-2 tracking-wide font-medium">Made by Filippo Pistaffa</p>}
        </div>
    );
    
    if (showSplash) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-brand-light dark:bg-brand-dark animate-fade-out" style={{ animationDelay: '1.7s' }}>
                <div className="animate-pop-in" style={{'--ease-spring': 'cubic-bezier(0.5, 1.5, 0.5, 1)'} as React.CSSProperties}>
                    <Logo showSubtitle={true} />
                </div>
            </div>
        );
    }

    if (gameState === 'learn') {
        return <LearnMode onBackToMenu={() => setGameState('menu')} t={t} />;
    }

    if (gameState === 'menu') {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-brand-light dark:bg-brand-dark transition-colors">
                <ConfirmModal isOpen={showNewGameConfirm} onConfirm={confirmNewGame} onCancel={() => setShowNewGameConfirm(false)} title={t('startNewGameTitle')} message={t('startNewGameMessage')} t={t} />
                <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} settings={settings} onSettingsChange={(s) => setSettings(prev => ({...prev, ...s}))} t={t} />
                <StatsModal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} stats={stats} t={t} />
                <div className="absolute top-4 right-4 flex gap-2">
                     <button onClick={() => setShowStatsModal(true)} className="p-3 rounded-full bg-surface-light/50 dark:bg-surface-dark/50 backdrop-blur-sm hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors" aria-label="View Statistics">
                        <StatsIcon className="w-6 h-6 text-text-muted-light dark:text-text-muted-dark" />
                    </button>
                    <button onClick={() => setShowSettingsModal(true)} className="p-3 rounded-full bg-surface-light/50 dark:bg-surface-dark/50 backdrop-blur-sm hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors" aria-label="Open Settings">
                        <SettingsIcon className="w-6 h-6 text-text-muted-light dark:text-text-muted-dark" />
                    </button>
                </div>

                <div className="mb-12 animate-stagger-in" style={{ animationDelay: '100ms', '--ease-spring': 'cubic-bezier(0.5, 1.5, 0.5, 1)'} as React.CSSProperties}>
                    <Logo />
                </div>
                
                <div className="flex flex-col gap-4 w-full items-center">
                    {savedGameExists && (
                        <div style={{ animationDelay: '200ms', '--ease-spring': 'cubic-bezier(0.5, 1.5, 0.5, 1)'} as React.CSSProperties} className="w-full max-w-xs animate-stagger-in">
                            <button onClick={handleContinue} className="w-full px-6 py-4 text-xl font-bold rounded-full transition-all duration-300 shadow-soft dark:shadow-soft-dark bg-secondary text-white hover:scale-105 active:scale-[0.98] focus:outline-none">
                                {t('continue')}
                            </button>
                        </div>
                    )}
                    <div style={{ animationDelay: '300ms', '--ease-spring': 'cubic-bezier(0.5, 1.5, 0.5, 1)'} as React.CSSProperties} className="w-full max-w-xs animate-stagger-in"><DifficultyButton diff="easy" label={t('easy')} /></div>
                    <div style={{ animationDelay: '400ms', '--ease-spring': 'cubic-bezier(0.5, 1.5, 0.5, 1)'} as React.CSSProperties} className="w-full max-w-xs animate-stagger-in"><DifficultyButton diff="medium" label={t('medium')} /></div>
                    <div style={{ animationDelay: '500ms', '--ease-spring': 'cubic-bezier(0.5, 1.5, 0.5, 1)'} as React.CSSProperties} className="w-full max-w-xs animate-stagger-in"><DifficultyButton diff="hard" label={t('hard')} /></div>
                    <div style={{ animationDelay: '600ms', '--ease-spring': 'cubic-bezier(0.5, 1.5, 0.5, 1)'} as React.CSSProperties} className="w-full max-w-xs animate-stagger-in"><DifficultyButton diff="expert" label={t('expert')} /></div>

                     <div className="w-40 border-t border-brand-dark/10 dark:border-brand-light/10 my-4"></div>
                     <div style={{ animationDelay: '700ms', '--ease-spring': 'cubic-bezier(0.5, 1.5, 0.5, 1)'} as React.CSSProperties} className="w-full max-w-xs animate-stagger-in">
                        <button onClick={() => setGameState('learn')} className="w-full px-6 py-3 text-xl font-semibold rounded-full transition-all duration-300 shadow-soft dark:shadow-soft-dark bg-accent/20 text-accent dark:bg-secondary/20 dark:text-secondary hover:bg-accent/30 dark:hover:bg-secondary/30 hover:scale-105 active:scale-[0.98] focus:outline-none">
                            {t('learn')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const GameInfo: React.FC = () => (
        <div className="flex justify-between items-center bg-surface-light dark:bg-surface-dark backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-soft dark:shadow-soft-dark rounded-full p-2 px-6 text-text-light dark:text-text-dark">
            <div><span className="capitalize font-bold text-lg text-accent dark:text-secondary">{t(difficulty)}</span></div>
            <div className="flex gap-4">
                 {settings.errorCheckMode !== 'off' &&
                    <div className="flex items-center gap-1.5" title={t('mistakes')}>
                        <MistakeIcon className="w-5 h-5 text-danger" />
                        <span className="font-bold text-lg">{mistakes}</span>
                    </div>
                 }
                 <div className="flex items-center gap-1.5" title={t('time')}>
                    <TimerIcon className="w-5 h-5 text-accent dark:text-secondary" />
                    <span className="font-bold text-lg tabular-nums">{`${Math.floor(time / 60).toString().padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`}</span>
                 </div>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen w-full flex flex-col items-center p-2 sm:p-4 bg-brand-light dark:bg-brand-dark transition-colors animate-fade-in">
            {gameState === 'paused' && <PauseModal onResume={() => setGameState('playing')} onMenu={goToMenu} onQuit={handleQuitRequest} t={t} />}
            {gameState === 'won' && <WinModal time={time} difficulty={difficulty} onNewGame={goToMenu} t={t} />}
            <ConfirmModal 
                isOpen={showQuitConfirm}
                onConfirm={confirmQuit}
                onCancel={() => setShowQuitConfirm(false)}
                title={t('quitGameTitle')}
                message={t('quitGameMessage')}
                t={t}
                confirmText={t('quit')}
            />
            <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} settings={settings} onSettingsChange={(s) => setSettings(prev => ({...prev, ...s}))} t={t} />
            
            <header className="w-full max-w-5xl flex justify-between items-center p-2 mb-2 sm:mb-4">
                <h1 className="text-2xl sm:text-3xl font-black text-text-light dark:text-text-dark tracking-tight">Expressive Sudoku</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowSettingsModal(true)} className="p-3 rounded-full transition-colors hover:bg-accent/10 dark:hover:bg-accent/20" aria-label="Open Settings">
                        <SettingsIcon className="w-7 h-7 text-text-muted-light dark:text-text-muted-dark" />
                    </button>
                    <button onClick={() => setGameState('paused')} className="p-3 rounded-full transition-colors hover:bg-accent/10 dark:hover:bg-accent/20" aria-label="Pause game">
                        <PauseIcon className="w-7 h-7 text-text-muted-light dark:text-text-muted-dark" />
                    </button>
                </div>
            </header>

            <div className="w-full max-w-5xl flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
                <div className="w-full lg:flex-1">
                    <Board 
                        puzzle={puzzle}
                        playerGrid={playerGrid}
                        selectedCell={selectedCell}
                        onCellClick={(row, col) => setSelectedCell({ row, col })}
                        errors={errors}
                        animatedCells={animatedCells}
                        notes={notes}
                        isNotesMode={isNotesMode}
                        lastPlayedCell={lastPlayedCell}
                        selectedNumber={selectedCellValue}
                        t={t}
                    />
                </div>
                <div className="w-full lg:w-80 lg:mt-0 flex flex-col gap-4">
                    <GameInfo />
                    <Controls 
                        onNumberClick={handleNumberInput}
                        onErase={handleErase}
                        onHint={handleHint}
                        onCheckErrors={handleCheckErrors}
                        hintsLeft={hintsLeft}
                        onToggleNotesMode={() => setIsNotesMode(prev => !prev)}
                        isNotesMode={isNotesMode}
                        completedNumbers={completedNumbers}
                        errorCheckMode={settings.errorCheckMode}
                        conflictingNumbers={conflictingNumbers}
                        selectedNumber={selectedCellValue}
                        t={t}
                    />
                </div>
            </div>
        </main>
    );
};