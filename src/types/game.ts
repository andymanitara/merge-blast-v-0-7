import { ShapeType } from '@/lib/constants';
export type GameMode = 'endless' | 'daily';
export interface AchievementDef {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: 'score' | 'merge' | 'chain' | 'games' | 'danger';
    threshold: number;
}
export interface GameShape {
    id: string;
    type: ShapeType;
    // Tier removed
    isJunk?: boolean; // Deprecated
    isFragile?: boolean; // Shape must be merged immediately or it cracks
    isCracked?: boolean; // Shape failed to merge and will lock next turn
    // Multi-tile properties
    offsets: { r: number; c: number }[];
    parentId?: string; // To link grid cells back to the main shape ID if needed
}
export type GridCell = GameShape | null;
export type PowerBurstType = 'blast' | 'purify' | 'calm';
export interface GameEffect {
    id: string;
    type: 'place' | 'merge' | 'gameover' | 'bestScore' | 'lockSpawn' | 'pulse' | 'junkSpawn' | 'heavyMerge' | 'achievement' | 'crack' | 'lock' | 'powerBurst';
    // Tier removed
    powerBurst?: PowerBurstType;
    combo?: number; // Added for audio scaling
    location?: { r: number; c: number }; // Grid coordinates for floating feedback
    scoreValue?: number; // Score amount gained
    achievementTitle?: string;
}
export interface GameState {
    grid: GridCell[][];
    nextShapes: GameShape[];
    score: number;
    combo: number;
    isGameOver: boolean;
    bestScore: number;
    // Stats
    totalGamesPlayed: number;
    totalMerges: number;
    highestChain: number;
    // UI State
    isMenuOpen: boolean;
    isHowToPlayOpen: boolean;
    // Modes & Settings
    gameMode: GameMode;
    isSoundEnabled: boolean;
    dailyBestScore: number;
    lastDailyDate: string;
    shapesGeneratedCount: number;
    lastEffect: GameEffect | null;
    // Phase 8: Arcade Mechanics
    dangerMeter: number; // Visual meter (0-100)
    dangerLevel: number; // Internal tracking
    turnsSinceLastLock: number;
    turnsWithoutMerge: number;
    boardPulses: number;
    isPulseMode: boolean;
    // Phase 17: Fairness & Leaderboard
    leaderboard: number[];
    isStuck: boolean;
    // Phase 35: Achievements
    unlockedAchievements: string[];
    // Phase 44: User Preferences
    graphicsQuality: 'high' | 'performance';
    hapticsEnabled: boolean;
    // Actions
    initializeGame: () => void;
    placeShape: (row: number, col: number, shapeId: string) => void;
    resetGame: () => void;
    toggleMenu: () => void;
    closeMenu: () => void;
    setGameMode: (mode: GameMode) => void;
    toggleSound: () => void;
    clearEffect: () => void;
    openHowToPlay: () => void;
    closeHowToPlay: () => void;
    // Phase 6/8 Actions
    activatePulseMode: () => void;
    triggerPulse: (row: number, col: number) => void;
    resetAllStats: () => void;
    checkAchievements: () => void;
    // Phase 44 Actions
    setGraphicsQuality: (quality: 'high' | 'performance') => void;
    toggleHaptics: () => void;
}