import { v4 as uuidv4 } from 'uuid';
import {
    GRID_SIZE,
    MULTI_TILE_SHAPES,
    ShapeType,
    SHAPE_TYPE_COLORS,
    FRAGILE_CHANCE
} from '@/lib/constants';
import { GameShape, GridCell } from '@/types/game';
// Generate a random shape with weighted probabilities
export const generateRandomShape = (randomFn: () => number = Math.random, dangerLevel: number = 0): GameShape => {
    const rand = randomFn();
    // Weights: 1-tile (65%), Multi-tile (35%)
    const oneTileShapes = MULTI_TILE_SHAPES.filter(s => s.offsets.length === 1);
    const multiTileShapes = MULTI_TILE_SHAPES.filter(s => s.offsets.length >= 2);
    let selectedDef;
    if (rand < 0.65) {
        // 65% Chance: 1-Tile
        const idx = Math.floor(randomFn() * oneTileShapes.length);
        selectedDef = oneTileShapes[idx];
    } else {
        // 35% Chance: Multi-Tile (2+ tiles)
        const idx = Math.floor(randomFn() * multiTileShapes.length);
        selectedDef = multiTileShapes[idx];
    }
    // Determine Fragile Status based on Danger Level
    let isFragile = false;
    let fragileThreshold = FRAGILE_CHANCE.EARLY;
    if (dangerLevel > 70) {
        fragileThreshold = FRAGILE_CHANCE.LATE;
    } else if (dangerLevel > 30) {
        fragileThreshold = FRAGILE_CHANCE.MID;
    }
    if (randomFn() < fragileThreshold) {
        isFragile = true;
    }
    return {
        id: uuidv4(),
        type: selectedDef.type,
        // Tier removed
        isJunk: false,
        isFragile: isFragile,
        offsets: selectedDef.offsets,
    };
};
export const createEmptyGrid = (): GridCell[][] => {
    return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
};
export const isValidCell = (row: number, col: number): boolean => {
    return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
};
export const getNeighbors = (row: number, col: number): [number, number][] => {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    return directions
        .map(([dr, dc]) => [row + dr, col + dc] as [number, number])
        .filter(([r, c]) => isValidCell(r, c));
};
// New: Find connected component (Flood Fill)
// Returns a Set of IDs that form a connected group of the same type
export const findConnectedComponent = (
    grid: GridCell[][],
    placedCells: { r: number; c: number }[],
    type: ShapeType,
    placedShapeId: string
): Set<string> => {
    if (type === ShapeType.Locked) return new Set();
    const matchedIds = new Set<string>();
    const visited = new Set<string>();
    const queue: { r: number; c: number }[] = [...placedCells];
    const placedColor = SHAPE_TYPE_COLORS[type];
    // Initialize with placed cells
    placedCells.forEach(cell => {
        const key = `${cell.r},${cell.c}`;
        visited.add(key);
        // Note: The placed cells might not be in the grid yet if we are checking hypothetically,
        // but in our game loop we place first then check.
        // However, the placed shape ID is passed explicitly.
        matchedIds.add(placedShapeId);
    });
    while (queue.length > 0) {
        const { r, c } = queue.shift()!;
        const neighbors = getNeighbors(r, c);
        for (const [nr, nc] of neighbors) {
            const key = `${nr},${nc}`;
            if (visited.has(key)) continue;
            const cell = grid[nr][nc];
            if (cell) {
                // Check color compatibility
                if (SHAPE_TYPE_COLORS[cell.type] === placedColor) {
                    const cellId = cell.parentId || cell.id;
                    matchedIds.add(cellId);
                    visited.add(key);
                    queue.push({ r: nr, c: nc });
                }
            }
        }
    }
    return matchedIds;
};
// Check if a shape can be placed at targetRow, targetCol (anchor position)
export const canPlaceShape = (
    grid: GridCell[][],
    shape: GameShape,
    targetRow: number,
    targetCol: number
): boolean => {
    for (const offset of shape.offsets) {
        const r = targetRow + offset.r;
        const c = targetCol + offset.c;
        // Check bounds
        if (!isValidCell(r, c)) return false;
        // Check collision
        if (grid[r][c] !== null) return false;
    }
    return true;
};
// Check game over: Can ANY shape in the queue be placed ANYWHERE?
export const checkGameOver = (
    grid: GridCell[][],
    nextShapes: GameShape[]
): boolean => {
    const shapesToCheck = [...nextShapes];
    if (shapesToCheck.length === 0) return false;
    for (const shape of shapesToCheck) {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (canPlaceShape(grid, shape, r, c)) {
                    return false; // Found a valid move
                }
            }
        }
    }
    return true; // No valid moves found
};
// Spawn locked tile using "Largest Open Area" heuristic
export const spawnLockedTile = (grid: GridCell[][], randomFn: () => number = Math.random): boolean => {
    const emptyCells: {r: number, c: number, dist: number}[] = [];
    // 1. Identify all empty cells
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === null) {
                emptyCells.push({r, c, dist: 0});
            }
        }
    }
    if (emptyCells.length === 0) return false;
    // 2. Calculate distance to nearest non-empty cell or edge for each empty cell
    for (const cell of emptyCells) {
        let minDist = Infinity;
        // Check distance to edges
        minDist = Math.min(minDist, cell.r + 1); // Top edge (row - -1)
        minDist = Math.min(minDist, GRID_SIZE - cell.r); // Bottom edge
        minDist = Math.min(minDist, cell.c + 1); // Left edge
        minDist = Math.min(minDist, GRID_SIZE - cell.c); // Right edge
        // Check distance to occupied cells
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] !== null) {
                    const dist = Math.abs(cell.r - r) + Math.abs(cell.c - c);
                    minDist = Math.min(minDist, dist);
                }
            }
        }
        cell.dist = minDist;
    }
    // 3. Sort by distance descending (largest open area)
    emptyCells.sort((a, b) => b.dist - a.dist);
    // 4. Pick the best one
    const target = emptyCells[0];
    grid[target.r][target.c] = {
        id: uuidv4(),
        type: ShapeType.Locked,
        // Tier removed
        offsets: [{r:0, c:0}],
    };
    return true;
};
export const clearArea = (grid: GridCell[][], centerRow: number, centerCol: number): void => {
    for (let r = centerRow - 1; r <= centerRow + 1; r++) {
        for (let c = centerCol - 1; c <= centerCol + 1; c++) {
            if (isValidCell(r, c)) {
                grid[r][c] = null;
            }
        }
    }
};