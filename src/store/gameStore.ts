import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import seedrandom from 'seedrandom';
import { v4 as uuidv4 } from 'uuid';
import { GameState, GameShape, GameMode, PowerBurstType } from '@/types/game';
import { ShapeType, DANGER_RAMP, PULSE_REQUIREMENTS, MAX_DANGER, INITIAL_NEXT_SHAPES_COUNT, LOCK_SPAWN_RATE_BASE, ACHIEVEMENTS, COMBO_SCORING, POWER_BURSTS } from '@/lib/constants';
import {
    createEmptyGrid,
    generateRandomShape,
    findConnectedComponent,
    checkGameOver,
    spawnLockedTile,
    clearArea,
    canPlaceShape
} from '@/lib/gameLogic';
import { toast } from 'sonner';
import { api } from '@/lib/api';
const calculateScore = (matchSize: number, combo: number) => {
    return Math.floor(COMBO_SCORING.BASE * (combo + 1) * matchSize * COMBO_SCORING.MULTIPLIER);
};
const getRng = (mode: GameMode, count: number) => {
    if (mode === 'daily') {
        const today = new Date().toISOString().split('T')[0];
        const rng = seedrandom(today);
        for (let i = 0; i < count; i++) {
            rng();
        }
        return rng;
    }
    return Math.random;
};
const generateShapeForMode = (state: any) => {
    const rng = getRng(state.gameMode, state.shapesGeneratedCount);
    const shape = generateRandomShape(rng, state.dangerLevel);
    if (state.gameMode === 'daily') {
        state.shapesGeneratedCount++;
    }
    return shape;
};
// Extend GameState to include resetAllStats
interface ExtendedGameState extends GameState {
    resetAllStats: () => void;
}
export const useGameStore = create<ExtendedGameState>()(
    persist(
        immer((set, get) => ({
            grid: createEmptyGrid(),
            nextShapes: [],
            score: 0,
            combo: 0,
            isGameOver: false,
            bestScore: 0,
            totalGamesPlayed: 0,
            totalMerges: 0,
            highestChain: 0,
            isMenuOpen: false,
            gameMode: 'endless',
            isSoundEnabled: true,
            dailyBestScore: 0,
            lastDailyDate: '',
            shapesGeneratedCount: 0,
            lastEffect: null,
            isHowToPlayOpen: false,
            // Phase 8
            dangerMeter: 0,
            dangerLevel: 0,
            turnsSinceLastLock: 0,
            turnsWithoutMerge: 0,
            boardPulses: 0,
            isPulseMode: false,
            // Phase 17
            leaderboard: [],
            isStuck: false,
            // Phase 35
            unlockedAchievements: [],
            // Phase 44
            graphicsQuality: 'high',
            hapticsEnabled: true,
            initializeGame: () => {
                set((state) => {
                    const today = new Date().toISOString().split('T')[0];
                    if (state.gameMode === 'daily') {
                        if (state.lastDailyDate !== today) {
                            state.dailyBestScore = 0;
                            state.lastDailyDate = today;
                            state.shapesGeneratedCount = 0;
                        }
                        state.shapesGeneratedCount = 0;
                    }
                    state.grid = createEmptyGrid();
                    state.nextShapes = [];
                    state.dangerMeter = 0;
                    state.dangerLevel = 0;
                    state.turnsSinceLastLock = 0;
                    state.turnsWithoutMerge = 0;
                    state.boardPulses = 0;
                    state.isPulseMode = false;
                    state.isStuck = false;
                    for (let i = 0; i < INITIAL_NEXT_SHAPES_COUNT; i++) {
                        state.nextShapes.push(generateShapeForMode(state));
                    }
                    state.score = 0;
                    state.combo = 0;
                    state.isGameOver = false;
                    state.isMenuOpen = false;
                    state.totalGamesPlayed += 1;
                    state.lastEffect = null;
                });
                get().checkAchievements();
            },
            placeShape: (row, col, shapeId) => {
                set((state) => {
                    // 1. Process Cracked Tiles from Previous Turn
                    let lockedCount = 0;
                    for (let r = 0; r < state.grid.length; r++) {
                        for (let c = 0; c < state.grid[0].length; c++) {
                            const cell = state.grid[r][c];
                            if (cell && cell.isCracked) {
                                state.grid[r][c] = {
                                    ...cell,
                                    type: ShapeType.Locked,
                                    isCracked: false,
                                    isFragile: false,
                                };
                                lockedCount++;
                            }
                        }
                    }
                    if (lockedCount > 0) {
                        state.lastEffect = { id: uuidv4(), type: 'lock' };
                    }
                    // 2. Identify Shape to Place
                    const queueIndex = state.nextShapes.findIndex(s => s.id === shapeId);
                    let shapeToPlace: GameShape | null = null;
                    if (queueIndex !== -1) {
                        shapeToPlace = state.nextShapes[queueIndex];
                    }
                    if (!shapeToPlace) return;
                    // 3. Validate Placement
                    if (!canPlaceShape(state.grid, shapeToPlace, row, col)) return;
                    // 4. Place Shape on Grid
                    let placedCells: { r: number; c: number }[] = [];
                    shapeToPlace.offsets.forEach((offset, index) => {
                        const r = row + offset.r;
                        const c = col + offset.c;
                        state.grid[r][c] = {
                            ...shapeToPlace!,
                            id: `${shapeToPlace!.id}_placed_${index}`,
                            parentId: shapeToPlace!.id
                        };
                        placedCells.push({ r, c });
                    });
                    state.lastEffect = {
                        id: uuidv4(),
                        type: 'place'
                    };
                    // Remove from source
                    state.nextShapes.splice(queueIndex, 1);
                    state.nextShapes.push(generateShapeForMode(state));
                    // 5. Arcade Match Logic (Clear on Match)
                    const currentType = shapeToPlace.type;
                    const currentShapeId = shapeToPlace.id;
                    // Find all connected components of same type
                    const matchedIds = findConnectedComponent(state.grid, placedCells, currentType, currentShapeId);
                    // We need at least 2 distinct shapes to form a match.
                    // Since findConnectedComponent returns ALL cell IDs, we need to count unique parent IDs.
                    const uniqueShapes = new Set<string>();
                    matchedIds.forEach(id => {
                        // Find the cell to get parentId
                        for(let r=0; r<state.grid.length; r++) {
                            for(let c=0; c<state.grid[0].length; c++) {
                                const cell = state.grid[r][c];
                                if(cell && (cell.id === id || cell.parentId === id)) {
                                    uniqueShapes.add(cell.parentId || cell.id);
                                }
                            }
                        }
                    });
                    // If we placed a shape, it counts as 1. We need > 1 unique shape to merge.
                    // Actually, the requirement is "two or more identical shapes touch".
                    // If I place a 2-tile shape, it's 1 shape. If it touches another, it's 2 shapes.
                    // uniqueShapes will contain the placed shape ID + any neighbors.
                    const matchOccurred = uniqueShapes.size >= 2;
                    if (matchOccurred) {
                        // Successful Match
                        state.combo += 1;
                        state.totalMerges += 1;
                        state.turnsWithoutMerge = 0;
                        // Calculate Score
                        const scoreIncrement = calculateScore(matchedIds.size, state.combo);
                        state.score += scoreIncrement;
                        // Clear Matched Cells
                        for (let r = 0; r < state.grid.length; r++) {
                            for (let c = 0; c < state.grid[0].length; c++) {
                                const cell = state.grid[r][c];
                                if (cell) {
                                    const cellId = cell.parentId || cell.id;
                                    if (uniqueShapes.has(cellId)) {
                                        state.grid[r][c] = null;
                                    }
                                }
                            }
                        }
                        // Reduce Danger
                        state.dangerLevel = Math.max(0, state.dangerLevel - (DANGER_RAMP.CHAIN_REDUCTION * state.combo));
                        state.dangerMeter = Math.min(MAX_DANGER, state.dangerLevel);
                        // Check for Power Burst (High Combo or Large Match)
                        if (state.combo >= 5 || matchedIds.size >= 6) {
                            const burstType = POWER_BURSTS[Math.floor(Math.random() * POWER_BURSTS.length)];
                            if (burstType === 'blast') {
                                clearArea(state.grid, row, col);
                            } else if (burstType === 'purify') {
                                for (let r = 0; r < state.grid.length; r++) {
                                    for (let c = 0; c < state.grid[0].length; c++) {
                                        if (state.grid[r][c]?.type === ShapeType.Locked) {
                                            state.grid[r][c] = null;
                                        }
                                    }
                                }
                            } else if (burstType === 'calm') {
                                state.dangerLevel = Math.max(0, state.dangerLevel - 50);
                                state.dangerMeter = Math.min(MAX_DANGER, state.dangerLevel);
                            }
                            state.lastEffect = {
                                id: uuidv4(),
                                type: 'powerBurst',
                                powerBurst: burstType,
                                location: { r: row, c: col },
                                scoreValue: scoreIncrement,
                                combo: state.combo
                            };
                        } else {
                            state.lastEffect = {
                                id: uuidv4(),
                                type: 'merge',
                                location: { r: row, c: col },
                                scoreValue: scoreIncrement,
                                combo: state.combo
                            };
                        }
                        if (state.combo > state.highestChain) {
                            state.highestChain = state.combo;
                        }
                        // Board Pulse Earning (Chain based)
                        if (state.boardPulses < 1 && state.combo >= PULSE_REQUIREMENTS.CHAIN) {
                            state.boardPulses = 1;
                        }
                    } else {
                        // No Match
                        state.combo = 0; // Reset combo
                        state.turnsWithoutMerge++;
                        // Increase Danger
                        state.dangerLevel += DANGER_RAMP.NO_MERGE;
                        // Fragile Failure Logic
                        if (shapeToPlace.isFragile) {
                            // Mark all cells of this shape as cracked
                            placedCells.forEach(({ r, c }) => {
                                if (state.grid[r][c]) {
                                    state.grid[r][c]!.isCracked = true;
                                }
                            });
                            state.lastEffect = { id: uuidv4(), type: 'crack' };
                            state.dangerLevel += DANGER_RAMP.FRAGILE_FAIL;
                        }
                        state.dangerMeter = Math.min(MAX_DANGER, state.dangerLevel);
                    }
                    // Locked Tile Spawning
                    state.turnsSinceLastLock++;
                    const currentLockThreshold = Math.max(3, LOCK_SPAWN_RATE_BASE - Math.floor(state.dangerMeter / 10));
                    if (state.turnsSinceLastLock >= currentLockThreshold) {
                        const rng = getRng(state.gameMode, state.shapesGeneratedCount + 999);
                        const spawned = spawnLockedTile(state.grid, rng);
                        if (spawned) {
                            state.lastEffect = { id: uuidv4(), type: 'lockSpawn' };
                            state.turnsSinceLastLock = 0;
                        }
                    }
                    // Check Game Over / Stuck
                    const noMoves = checkGameOver(state.grid, state.nextShapes);
                    if (noMoves) {
                        if (state.boardPulses > 0) {
                            state.isStuck = true;
                        } else {
                            state.isGameOver = true;
                            state.isStuck = false;
                            state.lastEffect = { id: uuidv4(), type: 'gameover' };
                            if (state.gameMode === 'daily') {
                                if (state.score > state.dailyBestScore) {
                                    state.dailyBestScore = state.score;
                                    state.lastEffect = { id: uuidv4(), type: 'bestScore' };
                                }
                            } else {
                                if (state.score > state.bestScore) {
                                    state.bestScore = state.score;
                                    state.lastEffect = { id: uuidv4(), type: 'bestScore' };
                                }
                                // Update Leaderboard (Endless only)
                                state.leaderboard.push(state.score);
                                state.leaderboard.sort((a, b) => b - a);
                                if (state.leaderboard.length > 5) {
                                    state.leaderboard = state.leaderboard.slice(0, 5);
                                }
                            }
                        }
                    } else {
                        state.isStuck = false;
                    }
                });
                get().checkAchievements();
            },
            resetGame: () => {
                get().initializeGame();
            },
            toggleMenu: () => {
                set((state) => { state.isMenuOpen = !state.isMenuOpen; });
            },
            closeMenu: () => {
                set((state) => { state.isMenuOpen = false; });
            },
            setGameMode: (mode) => {
                const currentMode = get().gameMode;
                if (currentMode !== mode) {
                    set((state) => { state.gameMode = mode; });
                    get().initializeGame();
                }
            },
            toggleSound: () => {
                set((state) => { state.isSoundEnabled = !state.isSoundEnabled; });
            },
            clearEffect: () => {
                set((state) => { state.lastEffect = null; });
            },
            openHowToPlay: () => {
                set((state) => { state.isHowToPlayOpen = true; });
            },
            closeHowToPlay: () => {
                set((state) => { state.isHowToPlayOpen = false; });
            },
            activatePulseMode: () => {
                set((state) => {
                    if (state.boardPulses > 0) {
                        state.isPulseMode = !state.isPulseMode;
                    }
                });
            },
            triggerPulse: (row, col) => {
                set((state) => {
                    if (state.boardPulses > 0 && state.isPulseMode) {
                        clearArea(state.grid, row, col);
                        state.boardPulses--;
                        state.isPulseMode = false;
                        state.isStuck = false;
                        state.dangerLevel = Math.max(0, state.dangerLevel - 10);
                        state.dangerMeter = Math.min(MAX_DANGER, state.dangerLevel);
                        state.lastEffect = {
                            id: uuidv4(),
                            type: 'pulse',
                            location: { r: row, c: col }
                        };
                    }
                });
                get().checkAchievements();
            },
            resetAllStats: () => {
                set((state) => {
                    // Reset everything to initial state
                    state.grid = createEmptyGrid();
                    state.nextShapes = [];
                    state.score = 0;
                    state.combo = 0;
                    state.isGameOver = false;
                    state.bestScore = 0;
                    state.totalGamesPlayed = 0;
                    state.totalMerges = 0;
                    state.highestChain = 0;
                    state.isMenuOpen = false;
                    state.gameMode = 'endless';
                    state.dailyBestScore = 0;
                    state.lastDailyDate = '';
                    state.shapesGeneratedCount = 0;
                    state.lastEffect = null;
                    state.isHowToPlayOpen = false;
                    state.dangerMeter = 0;
                    state.dangerLevel = 0;
                    state.turnsSinceLastLock = 0;
                    state.turnsWithoutMerge = 0;
                    state.boardPulses = 0;
                    state.isPulseMode = false;
                    state.leaderboard = [];
                    state.isStuck = false;
                    state.unlockedAchievements = [];
                    state.graphicsQuality = 'high';
                    state.hapticsEnabled = true;
                    // Re-init next shapes
                    for (let i = 0; i < INITIAL_NEXT_SHAPES_COUNT; i++) {
                        state.nextShapes.push(generateShapeForMode(state));
                    }
                });
            },
            checkAchievements: () => {
                set((state) => {
                    let newUnlock = false;
                    ACHIEVEMENTS.forEach(ach => {
                        if (state.unlockedAchievements.includes(ach.id)) return;
                        let unlocked = false;
                        switch (ach.type) {
                            case 'score':
                                if (state.score >= ach.threshold) unlocked = true;
                                break;
                            case 'merge':
                                if (state.totalMerges >= ach.threshold) unlocked = true;
                                break;
                            case 'chain':
                                if (state.highestChain >= ach.threshold) unlocked = true;
                                break;
                            case 'games':
                                if (state.totalGamesPlayed >= ach.threshold) unlocked = true;
                                break;
                            case 'danger':
                                if (state.dangerMeter >= ach.threshold) unlocked = true;
                                break;
                        }
                        if (unlocked) {
                            state.unlockedAchievements.push(ach.id);
                            newUnlock = true;
                            // Trigger toast outside of render cycle
                            setTimeout(() => {
                                toast.success(`Achievement Unlocked: ${ach.title}!`, {
                                    description: ach.description,
                                    duration: 4000,
                                    position: 'top-center',
                                    className: 'bg-indigo-900 border-indigo-500 text-white',
                                });
                            }, 0);
                        }
                    });
                    if (newUnlock) {
                        state.lastEffect = { id: uuidv4(), type: 'achievement' };
                    }
                });
            },
            setGraphicsQuality: (quality) => {
                set((state) => { state.graphicsQuality = quality; });
            },
            toggleHaptics: () => {
                set((state) => { state.hapticsEnabled = !state.hapticsEnabled; });
            }
        })),
        {
            name: 'shape-merge-storage',
            partialize: (state) => ({
                grid: state.grid,
                nextShapes: state.nextShapes,
                score: state.score,
                combo: state.combo,
                isGameOver: state.isGameOver,
                bestScore: state.bestScore,
                totalGamesPlayed: state.totalGamesPlayed,
                totalMerges: state.totalMerges,
                highestChain: state.highestChain,
                gameMode: state.gameMode,
                isSoundEnabled: state.isSoundEnabled,
                dailyBestScore: state.dailyBestScore,
                lastDailyDate: state.lastDailyDate,
                shapesGeneratedCount: state.shapesGeneratedCount,
                dangerMeter: state.dangerMeter,
                dangerLevel: state.dangerLevel,
                turnsSinceLastLock: state.turnsSinceLastLock,
                turnsWithoutMerge: state.turnsWithoutMerge,
                boardPulses: state.boardPulses,
                leaderboard: state.leaderboard,
                unlockedAchievements: state.unlockedAchievements,
                graphicsQuality: state.graphicsQuality,
                hapticsEnabled: state.hapticsEnabled,
            }),
        }
    )
);