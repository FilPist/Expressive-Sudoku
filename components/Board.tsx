import React from 'react';
import type { Grid } from '../types';

interface BoardProps {
  puzzle: Grid;
  playerGrid: Grid;
  selectedCell: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
  errors: boolean[][];
  animatedCells: { row: number; col: number }[];
  notes: Set<number>[][];
  isNotesMode: boolean;
  lastPlayedCell: { row: number; col: number } | null;
  selectedNumber: number | null;
  t: (key: string, ...args: any[]) => string;
  isCellClickable?: (row: number, col: number) => boolean;
  highlightedCells?: { row: number; col: number }[];
}

export const Board: React.FC<BoardProps> = ({ puzzle, playerGrid, selectedCell, onCellClick, errors, animatedCells, notes, isNotesMode, lastPlayedCell, selectedNumber, t, isCellClickable, highlightedCells }) => {

  return (
    <div className="w-full max-w-lg aspect-square bg-surface-light dark:bg-surface-dark backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-soft dark:shadow-soft-dark rounded-3xl p-1.5 sm:p-2 grid grid-cols-3 gap-1.5 sm:gap-2">
      {[...Array(3)].map((_, boxRow) => 
        [...Array(3)].map((_, boxCol) => (
          <div key={`${boxRow}-${boxCol}`} className="grid grid-cols-3 gap-px sm:gap-0.5 bg-brand-dark/10 dark:bg-brand-light/10 rounded-lg overflow-hidden">
            {[...Array(3)].map((_, cellRow) =>
              [...Array(3)].map((_, cellCol) => {
                const row = boxRow * 3 + cellRow;
                const col = boxCol * 3 + cellCol;
                
                const isClue = puzzle[row][col] !== null;
                const value = playerGrid[row][col];
                const notesForCell = notes[row][col];
                const isSelected = selectedCell?.row === row && selectedCell?.col === col;
                const isHighlighted = !isSelected && selectedCell && (selectedCell.row === row || selectedCell.col === col || (Math.floor(selectedCell.row / 3) === boxRow && Math.floor(selectedCell.col / 3) === boxCol));
                const isSameNumber = !isSelected && value !== null && selectedNumber !== null && selectedNumber === value;
                const hasError = errors[row][col];
                
                const isAnimated = animatedCells.some(cell => cell.row === row && cell.col === col);
                const isJustPlayed = lastPlayedCell?.row === row && lastPlayedCell?.col === col;
                const isTutorialHighlighted = highlightedCells?.some(c => c.row === row && c.col === col);
                const isDisabled = (isCellClickable && !isCellClickable(row, col));

                let cellBg = 'bg-brand-light/80 dark:bg-brand-dark/60 hover:bg-accent/10 dark:hover:bg-accent/20';
                if (isHighlighted) cellBg = 'bg-brand-dark/5 dark:bg-brand-dark';
                if (isSameNumber) cellBg = 'bg-secondary/20 dark:bg-secondary/30';
                if (isSelected) cellBg = 'bg-accent/10 dark:bg-accent/20';
                
                const ringClasses = hasError && !isClue 
                  ? 'ring-4 ring-danger'
                  : isSelected 
                  ? 'ring-4 ring-accent'
                  : 'ring-0 ring-transparent';

                const notesText = notesForCell.size > 0 ? `, notes for ${Array.from(notesForCell).sort().join(', ')}` : '';
                const valueText = value ? `value ${value}` : 'empty';

                return (
                  <button
                    key={`${row}-${col}`}
                    onClick={() => onCellClick(row, col)}
                    disabled={isDisabled}
                    className={`aspect-square w-full h-full flex items-center justify-center text-2xl md:text-3xl transition-all duration-200 relative focus:outline-none rounded-lg ${cellBg} ${ringClasses} ${isAnimated ? 'animate-unit-complete' : ''} ${isTutorialHighlighted ? 'tutorial-highlight' : ''} ${isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                    aria-label={`Cell ${row + 1}, ${col + 1}, ${valueText}${notesText}`}
                  >
                    {value ? (
                        <span className={`${isClue ? 'text-text-light dark:text-text-dark font-semibold' : 'text-accent dark:text-secondary font-bold'} ${isJustPlayed ? 'animate-pop-in' : ''}`} style={{'--ease-spring': 'cubic-bezier(0.5, 1.5, 0.5, 1)'} as React.CSSProperties}>
                            {value}
                        </span>
                    ) : (
                        notesForCell.size > 0 && (
                            <div className="grid grid-cols-3 w-full h-full text-[10px] md:text-xs text-text-muted-light dark:text-text-muted-dark leading-none p-0.5 pointer-events-none">
                                {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
                                    <div key={num} className="flex items-center justify-center">
                                        {notesForCell.has(num) ? num : ''}
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                  </button>
                );
              })
            )}
          </div>
        ))
      )}
    </div>
  );
};