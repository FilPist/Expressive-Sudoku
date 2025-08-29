import React, { useState, useEffect, useMemo } from 'react';
import type { Grid } from '../types';
import { Board } from './Board';
import { generateSudoku, isValid } from '../utils/sudoku';
import { HomeIcon, HintIcon, EraseIcon } from './Icons';

const createEmptyNotes = (): Set<number>[][] => Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set()));

type TutorialMove = { row: number, col: number, num: number } | null;

const findEasiestCell = (puzzle: Grid, solution: Grid): TutorialMove => {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (puzzle[r][c] === null) {
                let possibilities = 0;
                let validNums = new Set<number>();
                const tempGrid = puzzle.map(row => [...row]);

                for (let num = 1; num <= 9; num++) {
                    tempGrid[r][c] = num;
                    if (isValid(tempGrid, r, c, num)) {
                        possibilities++;
                        validNums.add(num);
                    }
                    tempGrid[r][c] = null; // backtrack
                }
                
                if (possibilities === 1 && validNums.has(solution[r][c])) {
                    return { row: r, col: c, num: solution[r][c] };
                }
            }
        }
    }
    // Fallback if no naked single is found
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (puzzle[r][c] === null) {
                return { row: r, col: c, num: solution[r][c] };
            }
        }
    }
    return null;
}

const TUTORIAL_STEPS_COUNT = 5;

export const LearnMode: React.FC<{
  onBackToMenu: () => void;
  t: (key: any, ...args: any[]) => string;
}> = ({ onBackToMenu, t }) => {
  const [puzzle, setPuzzle] = useState<Grid | null>(null);
  const [solution, setSolution] = useState<Grid | null>(null);
  const [playerGrid, setPlayerGrid] = useState<Grid | null>(null);
  const [firstMove, setFirstMove] = useState<TutorialMove>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    const { puzzle: newPuzzle, solution: newSolution } = generateSudoku('easy');
    const move1 = findEasiestCell(newPuzzle, newSolution);
    
    setPuzzle(newPuzzle);
    setSolution(newSolution);
    setPlayerGrid(newPuzzle);
    setFirstMove(move1);
  }, []);


  const stepConfig = useMemo(() => {
    if (!firstMove) return null;
    const configs = [
        {
            title: t('stepWelcomeTitle'),
            text: t('stepWelcomeText'),
            highlighted: [],
            clickable: () => false,
            allowedNums: new Set(),
            showNext: true,
        },
        {
            title: t('stepRowTitle'),
            text: t('stepRowText'),
            highlighted: Array.from({length: 9}, (_, i) => ({row: 2, col: i})),
            clickable: () => false,
            allowedNums: new Set(),
            showNext: true,
        },
        {
            title: t('stepColTitle'),
            text: t('stepColText'),
            highlighted: Array.from({length: 9}, (_, i) => ({row: i, col: 5})),
            clickable: () => false,
            allowedNums: new Set(),
            showNext: true,
        },
        {
            title: t('stepBoxTitle'),
            text: t('stepBoxText'),
            highlighted: [{r:0,c:0},{r:0,c:1},{r:0,c:2},{r:1,c:0},{r:1,c:1},{r:1,c:2},{r:2,c:0},{r:2,c:1},{r:2,c:2}].map(({r,c})=>({row:r+3, col:c+3})),
            clickable: () => false,
            allowedNums: new Set(),
            showNext: true,
        },
        {
            title: t('stepSolveTitle'),
            text: t('stepSolveText', firstMove.num, firstMove.row + 1, firstMove.col + 1),
            highlighted: [{row: firstMove.row, col: firstMove.col}],
            clickable: (r: number, c: number) => r === firstMove.row && c === firstMove.col,
            allowedNums: new Set([firstMove.num]),
            showNext: false,
        },
        {
            title: t('stepFreePlayTitle'),
            text: t('stepFreePlayText'),
            highlighted: [],
            clickable: () => true,
            allowedNums: null, // all allowed
            showNext: false,
        }
    ];
    return configs[tutorialStep];
  }, [tutorialStep, firstMove, t]);

  const handleNumberInput = (num: number) => {
    if (isComplete || !selectedCell || !playerGrid || !solution || !firstMove) return;
    if (puzzle && puzzle[selectedCell.row][selectedCell.col] !== null) return;
    
    if (tutorialStep < TUTORIAL_STEPS_COUNT && stepConfig?.allowedNums && !stepConfig.allowedNums.has(num)) {
        return;
    }

    const newGrid = playerGrid.map(r => [...r]);
    newGrid[selectedCell.row][selectedCell.col] = num;
    setPlayerGrid(newGrid);
    
    if(tutorialStep < TUTORIAL_STEPS_COUNT && selectedCell.row === firstMove.row && selectedCell.col === firstMove.col && num === firstMove.num){
        setTutorialStep(TUTORIAL_STEPS_COUNT);
    }

    const isWin = newGrid.every((r, ri) => r.every((c, ci) => c === solution[ri][ci]));
    if (isWin) {
      setIsComplete(true);
    }
  };

  const handleGuideMe = () => {
    if (isComplete || !playerGrid || !solution) return;
    const easiest = findEasiestCell(playerGrid, solution);
    if (easiest) {
        const { row, col, num } = easiest;
        const newGrid = playerGrid.map(r => [...r]);
        newGrid[row][col] = num;
        setPlayerGrid(newGrid);
        setSelectedCell({row, col});
        const isWin = newGrid.every((r, ri) => r.every((c, ci) => c === solution[ri][ci]));
        if (isWin) setIsComplete(true);
    }
  };
  
  const handleErase = () => {
    if (isComplete || !selectedCell || !playerGrid || tutorialStep < TUTORIAL_STEPS_COUNT) return;
    if (puzzle && puzzle[selectedCell.row][selectedCell.col] !== null) return;
    
    const newGrid = playerGrid.map(r => [...r]);
    newGrid[selectedCell.row][selectedCell.col] = null;
    setPlayerGrid(newGrid);
  };
  
  if (!playerGrid || !puzzle || !stepConfig) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-brand-light dark:bg-brand-dark">
            <div className="w-16 h-16 border-4 border-dashed border-accent rounded-full animate-spin"></div>
        </div>
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center p-2 sm:p-4 bg-brand-light dark:bg-brand-dark transition-colors animate-fade-in">
        <header className="w-full max-w-5xl flex justify-between items-center p-2 mb-2 sm:mb-4">
             <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text-light dark:text-text-dark">{t('learnTitle')}</h1>
             <button onClick={onBackToMenu} className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold bg-surface-light dark:bg-surface-dark backdrop-blur-xl border border-white/20 dark:border-white/10 text-text-muted-light dark:text-text-muted-dark hover:text-accent dark:hover:text-secondary hover:bg-accent/10 dark:hover:bg-secondary/10 transition-colors">
                <HomeIcon className="w-5 h-5" />
                {t('backToMenu')}
            </button>
        </header>

        <div className="w-full max-w-5xl flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
            <div className="w-full lg:flex-1">
                <Board 
                    puzzle={puzzle}
                    playerGrid={playerGrid}
                    selectedCell={selectedCell}
                    onCellClick={(row, col) => setSelectedCell({ row, col })}
                    errors={Array(9).fill(null).map(() => Array(9).fill(false))}
                    animatedCells={[]}
                    notes={createEmptyNotes()}
                    isNotesMode={false}
                    lastPlayedCell={null}
                    selectedNumber={null}
                    highlightedCells={stepConfig.highlighted}
                    isCellClickable={(row, col) => stepConfig.clickable(row, col)}
                    t={t}
                />
            </div>
            <div className="w-full lg:w-80 lg:mt-0 flex flex-col gap-4">
                <div className="p-4 bg-surface-light dark:bg-surface-dark backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-soft dark:shadow-soft-dark min-h-[150px]">
                    {isComplete ? (
                        <>
                            <h2 className="text-2xl font-bold text-green-500 mb-2">{t('practiceSolvedTitle')}</h2>
                            <p className="text-text-muted-light dark:text-text-muted-dark">{t('practiceSolvedText')}</p>
                        </>
                    ) : (
                       <>
                            <h2 className="text-2xl font-bold text-accent dark:text-secondary mb-2">{stepConfig.title}</h2>
                            <p className="text-text-muted-light dark:text-text-muted-dark whitespace-pre-line">{stepConfig.text}</p>
                       </>
                    )}
                </div>

                 <div className="p-2 bg-surface-light dark:bg-surface-dark backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-soft dark:shadow-soft-dark">
                     {stepConfig.showNext ? (
                         <button onClick={() => setTutorialStep(s => s + 1)} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full font-semibold bg-accent text-white hover:bg-accent-hover transition-colors active:scale-95">
                            <span>{t('next')}</span>
                        </button>
                     ) : (
                         <button onClick={handleGuideMe} disabled={isComplete} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full font-semibold bg-accent/10 text-accent dark:bg-secondary/10 dark:text-secondary hover:bg-accent/20 dark:hover:bg-secondary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                            <HintIcon className="w-6 h-6" />
                            <span>{t('guideMe')}</span>
                        </button>
                     )}
                </div>

                <div className="p-3 bg-surface-light dark:bg-surface-dark backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-soft dark:shadow-soft-dark">
                    <div className="grid grid-cols-9 gap-1">
                        {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
                             <button
                                key={num}
                                onClick={() => handleNumberInput(num)}
                                disabled={isComplete || (stepConfig.allowedNums !== null && !stepConfig.allowedNums.has(num))}
                                className={`flex items-center justify-center text-2xl sm:text-3xl aspect-square rounded-full transition-all duration-200 ease-in-out active:scale-90 font-bold focus:outline-none bg-transparent text-accent dark:text-secondary hover:bg-accent/10 dark:hover:bg-secondary/10 disabled:opacity-30 disabled:cursor-not-allowed`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                     <button onClick={handleErase} disabled={isComplete || tutorialStep < TUTORIAL_STEPS_COUNT} className={`w-full mt-2 flex items-center justify-center gap-2 p-2 rounded-lg transition-colors text-text-muted-light dark:text-text-muted-dark hover:bg-accent/10 dark:hover:bg-secondary/10 hover:text-accent dark:hover:text-secondary disabled:opacity-50 disabled:cursor-not-allowed active:scale-95`}>
                        <EraseIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                        <span className="text-sm font-medium">{t('erase')}</span>
                    </button>
                </div>
            </div>
        </div>
    </main>
  );
};