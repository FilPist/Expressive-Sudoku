import type { Language } from '../types';

const translations = {
  en: {
    // Menu
    sudoku: 'Sudoku',
    minimalistGame: 'A Minimalist Game',
    continue: 'Continue',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    expert: 'Expert',
    learn: 'Practice',
    // In-Game
    mistakes: 'Mistakes',
    time: 'Time',
    pause: 'Pause',
    hint: 'Hint',
    hintWithCount: (count: number) => `Hint (${count})`,
    erase: 'Erase',
    notes: 'Notes',
    check: 'Check',
    // Modals
    gamePaused: 'Game Paused',
    resume: 'Resume',
    victory: 'Victory!',
    youSolvedThePuzzle: 'You solved the puzzle.',
    difficulty: 'Difficulty',
    playAgain: 'Play Again',
    backToMenu: 'Back to Menu',
    startNewGameTitle: 'Start New Game?',
    startNewGameMessage: 'This will erase your current game progress. Are you sure?',
    cancel: 'Cancel',
    proceed: 'Proceed',
    quitGame: 'Quit Game',
    quitGameTitle: 'Quit Game?',
    quitGameMessage: 'Are you sure? Your current progress will be lost and this will count as a loss in your streak.',
    quit: 'Quit',
    // Settings
    settings: 'Settings',
    theme: 'Theme',
    feedback: 'Feedback',
    sound: 'Sound',
    vibrate: 'Vibrate',
    mute: 'Mute',
    errorCheckMode: 'Error Check Mode',
    instant: 'Instant',
    manual: 'Manual',
    off: 'Off',
    instantDesc: 'Mistakes are highlighted in red as you place a number.',
    manualDesc: "Check for mistakes anytime by pressing the 'Check' button.",
    offDesc: 'The game will not show you any mistakes. Good luck!',
    language: 'Language',
    settingsSaved: 'Your settings are saved automatically.',
    // Stats
    statistics: 'Statistics',
    currentStreak: 'Current Streak',
    maxStreak: 'Max Streak',
    bestTime: 'Best Time',
    avgTime: 'Avg Time',
    won: 'Won',
    winRate: 'Win Rate',
    close: 'Close',
    // Learn Mode (Interactive)
    learnTitle: 'Practice Mode',
    stepWelcomeTitle: 'Welcome to Practice!',
    stepWelcomeText: "Let's learn the basics of Sudoku together. Press 'Next' to begin.",
    stepRowTitle: 'The Rows',
    stepRowText: 'The first rule: every row must contain all numbers from 1 to 9, without any repeats. This highlighted row is an example.',
    stepColTitle: 'The Columns',
    stepColText: 'The second rule is the same for columns. Each column must have all numbers from 1 to 9, with no duplicates.',
    stepBoxTitle: 'The Boxes',
    stepBoxText: "Finally, each 3x3 box must also contain every number from 1 to 9, just once. That's all the rules!",
    stepSolveTitle: 'Let\'s Solve!',
    stepSolveText: (num: number, row: number, col: number) => `Look at this cell (${row}, ${col}). Based on the numbers already in its row, column, and box, the only possible number is ${num}. Select ${num} below to place it.`,
    stepFreePlayTitle: 'You Got It!',
    stepFreePlayText: "Now you know the basics. Try to solve the rest of this easy puzzle yourself. If you get stuck, use the 'Guide Me' button.",
    guideMe: 'Guide Me',
    practiceSolvedTitle: 'Well Done!',
    practiceSolvedText: "You've completed the practice puzzle. You're ready for a real game!",
    next: 'Next',

  },
  it: {
    // Menu
    sudoku: 'Sudoku',
    minimalistGame: 'Un Gioco Minimalista',
    continue: 'Continua',
    easy: 'Facile',
    medium: 'Medio',
    hard: 'Difficile',
    expert: 'Esperto',
    learn: 'Pratica',
    // In-Game
    mistakes: 'Errori',
    time: 'Tempo',
    pause: 'Pausa',
    hint: 'Aiuto',
    hintWithCount: (count: number) => `Aiuto (${count})`,
    erase: 'Cancella',
    notes: 'Note',
    check: 'Verifica',
    // Modals
    gamePaused: 'Gioco in Pausa',
    resume: 'Riprendi',
    victory: 'Vittoria!',
    youSolvedThePuzzle: 'Hai risolto il puzzle.',
    difficulty: 'Difficoltà',
    playAgain: 'Gioca Ancora',
    backToMenu: 'Torna al Menu',
    startNewGameTitle: 'Iniziare una Nuova Partita?',
    startNewGameMessage: 'Questo cancellerà i tuoi progressi attuali. Sei sicuro di voler iniziare una nuova partita?',
    cancel: 'Annulla',
    proceed: 'Procedi',
    quitGame: 'Abbandona Partita',
    quitGameTitle: 'Abbandonare la Partita?',
    quitGameMessage: 'Sei sicuro? I tuoi progressi attuali verranno persi e conterà come una sconfitta per la tua serie.',
    quit: 'Abbandona',
    // Settings
    settings: 'Impostazioni',
    theme: 'Tema',
    feedback: 'Feedback',
    sound: 'Suono',
    vibrate: 'Vibrazione',
    mute: 'Silenzioso',
    errorCheckMode: 'Controllo Errori',
    instant: 'Istantaneo',
    manual: 'Manuale',
    off: 'Spento',
    instantDesc: 'Gli errori vengono evidenziati in rosso non appena inserisci un numero.',
    manualDesc: "Verifica gli errori quando vuoi premendo il pulsante 'Verifica'.",
    offDesc: 'Il gioco non mostrerà alcun errore. Buona fortuna!',
    language: 'Lingua',
    settingsSaved: 'Le tue impostazioni vengono salvate automaticamente.',
    // Stats
    statistics: 'Statistiche',
    currentStreak: 'Serie Attuale',
    maxStreak: 'Serie Massima',
    bestTime: 'Miglior Tempo',
    avgTime: 'Tempo Medio',
    won: 'Vinte',
    winRate: 'Percentuale Vittorie',
    close: 'Chiudi',
    // Learn Mode (Interactive)
    learnTitle: 'Modalità Pratica',
    stepWelcomeTitle: 'Benvenuto!',
    stepWelcomeText: "Impariamo insieme le basi del Sudoku. Premi 'Avanti' per iniziare.",
    stepRowTitle: 'Le Righe',
    stepRowText: 'La prima regola: ogni riga deve contenere tutti i numeri da 1 a 9, senza ripetizioni. Questa riga evidenziata è un esempio.',
    stepColTitle: 'Le Colonne',
    stepColText: 'La seconda regola è la stessa per le colonne. Ogni colonna deve avere tutti i numeri da 1 a 9, senza duplicati.',
    stepBoxTitle: 'I Riquadri',
    stepBoxText: "Infine, anche ogni riquadro 3x3 deve contenere tutti i numeri da 1 a 9, una sola volta. Queste sono tutte le regole!",
    stepSolveTitle: 'Risolviamo!',
    stepSolveText: (num: number, row: number, col: number) => `Guarda questa cella (${row}, ${col}). In base ai numeri già presenti nella sua riga, colonna e riquadro, l'unico numero possibile è ${num}. Seleziona ${num} qui sotto per inserirlo.`,
    stepFreePlayTitle: 'Ce l\'hai fatta!',
    stepFreePlayText: "Ora conosci le basi. Prova a risolvere il resto di questo puzzle facile da solo. Se ti blocchi, usa il pulsante 'Guidami'.",
    guideMe: 'Guidami',
    practiceSolvedTitle: 'Ben Fatto!',
    practiceSolvedText: "Hai completato il puzzle di allenamento. Sei pronto per una partita vera!",
    next: 'Avanti',
  }
};

let currentLanguage: Language = 'en';

// Function to detect browser language and set it if available
export const initializeLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'it') {
        currentLanguage = 'it';
    } else {
        currentLanguage = 'en';
    }
    return currentLanguage;
};


export const setLanguage = (lang: Language) => {
    currentLanguage = lang;
};

type TranslationKey = keyof typeof translations.en;
type TranslationParams = string | number;

export const t = (key: TranslationKey, ...args: TranslationParams[]): string => {
    const translation = translations[currentLanguage][key] || translations.en[key];

    if (typeof translation === 'function') {
        // @ts-ignore
        return translation(...args);
    }
    
    return translation as string;
};