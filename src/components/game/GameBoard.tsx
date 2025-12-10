import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GridCell } from './GridCell';
import { cn } from '@/lib/utils';
import { GameShape } from '@/types/game';
import { FloatingFeedback } from './FloatingFeedback';
import { Zap } from 'lucide-react';
import { ShapeConnections } from './Shape';
import { GRID_SIZE } from '@/lib/constants';
interface GameBoardProps {
    activeShape?: GameShape | null;
    ghostAnchor?: { r: number, c: number } | null;
}
export const GameBoard: React.FC<GameBoardProps> = ({ activeShape, ghostAnchor }) => {
    const grid = useGameStore(state => state.grid);
    const isPulseMode = useGameStore(state => state.isPulseMode);
    const isStuck = useGameStore(state => state.isStuck);
    const [hoveredCell, setHoveredCell] = useState<{r: number, c: number} | null>(null);
    const handleCellEnter = (r: number, c: number) => {
        if (isPulseMode) {
            setHoveredCell({ r, c });
        }
    };
    const handleCellLeave = () => {
        setHoveredCell(null);
    };
    // Helper to check connection
    const checkConnection = (r: number, c: number, dr: number, dc: number): boolean => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) return false;
        const current = grid[r][c];
        const neighbor = grid[nr][nc];
        if (!current || !neighbor) return false;
        // Check if they share the same parentId (part of same multi-tile shape)
        return (current.parentId || current.id) === (neighbor.parentId || neighbor.id);
    };
    // Helper for ghost connections
    const getGhostConnections = (r: number, c: number, shape: GameShape, anchor: { r: number, c: number }): ShapeConnections => {
        // Calculate relative position of this cell in the ghost shape
        const relR = r - anchor.r;
        const relC = c - anchor.c;
        // Check if the shape has offsets at adjacent relative positions
        const hasOffset = (dr: number, dc: number) => {
            return shape.offsets.some(o => o.r === relR + dr && o.c === relC + dc);
        };
        return {
            top: hasOffset(-1, 0),
            bottom: hasOffset(1, 0),
            left: hasOffset(0, -1),
            right: hasOffset(0, 1)
        };
    };
    return (
        <div className={cn(
            "w-full h-full aspect-square rounded-3xl relative transition-shadow duration-300",
            // Padding adjusted for mobile optimization
            "p-2 sm:p-4",
            // Glassmorphic Container
            "glass-panel shadow-2xl shadow-indigo-500/20",
            // Pulse Mode Ring
            isPulseMode && "ring-4 ring-red-500 ring-offset-4 ring-offset-black/50 animate-pulse"
        )}>
            {/* Grid Container - gap-0 for seamless */}
            {/* Added grid-rows-6 to enforce equal row heights and prevent implicit sizing issues */}
            <div 
                className="grid grid-cols-6 grid-rows-6 gap-0 w-full h-full relative z-10"
                onMouseLeave={handleCellLeave}
            >
                {grid.map((row, rowIndex) => (
                    <React.Fragment key={`row-${rowIndex}`}>
                        {row.map((cell, colIndex) => {
                            // Pulse Highlight Logic
                            const isPulseHighlight = isPulseMode && hoveredCell && 
                                Math.abs(hoveredCell.r - rowIndex) <= 1 && 
                                Math.abs(hoveredCell.c - colIndex) <= 1;
                            // Ghost Preview Logic
                            let ghostShapeForCell: GameShape | null = null;
                            let ghostConnections: ShapeConnections | undefined;
                            if (!cell && activeShape && ghostAnchor && !isPulseMode && !isStuck) {
                                const offsetIndex = activeShape.offsets.findIndex(o => 
                                    (rowIndex === ghostAnchor.r + o.r) && (colIndex === ghostAnchor.c + o.c)
                                );
                                if (offsetIndex !== -1) {
                                    ghostShapeForCell = {
                                        ...activeShape,
                                        id: `${activeShape.id}_ghost_${rowIndex}_${colIndex}`,
                                    };
                                    ghostConnections = getGhostConnections(rowIndex, colIndex, activeShape, ghostAnchor);
                                }
                            }
                            // Calculate connections for occupied cell
                            let connections: ShapeConnections | undefined;
                            if (cell) {
                                connections = {
                                    top: checkConnection(rowIndex, colIndex, -1, 0),
                                    bottom: checkConnection(rowIndex, colIndex, 1, 0),
                                    left: checkConnection(rowIndex, colIndex, 0, -1),
                                    right: checkConnection(rowIndex, colIndex, 0, 1),
                                };
                            }
                            return (
                                <GridCell
                                    key={`cell-${rowIndex}-${colIndex}`}
                                    row={rowIndex}
                                    col={colIndex}
                                    cell={cell}
                                    ghostShape={ghostShapeForCell}
                                    isPulseHighlight={!!isPulseHighlight}
                                    onMouseEnter={() => handleCellEnter(rowIndex, colIndex)}
                                    onMouseLeave={handleCellLeave}
                                    connections={connections}
                                    ghostConnections={ghostConnections}
                                />
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
            {/* Stuck State Overlay */}
            {isStuck && !isPulseMode && (
                <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
                    <div className="bg-red-500/20 p-4 rounded-full mb-4 animate-bounce border border-red-500/50">
                        <Zap className="w-12 h-12 text-red-400 fill-current" />
                    </div>
                    <p className="text-3xl font-display font-black text-center px-4 drop-shadow-lg mb-2 text-red-100">
                        Board Full!
                    </p>
                    <p className="text-xl font-bold text-red-400 animate-pulse flex items-center gap-2">
                        Use Pulse to Survive <Zap className="w-5 h-5" />
                    </p>
                </div>
            )}
            {/* Floating Feedback Overlay */}
            <FloatingFeedback />
        </div>
    );
};