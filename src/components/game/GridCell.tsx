import React, { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useGameStore } from '@/store/gameStore';
import { GridCell as GridCellType, GameShape } from '@/types/game';
import { Shape, ShapeConnections } from './Shape';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ShapeType } from '@/lib/constants';
import { Lock } from 'lucide-react';
interface GridCellProps {
    row: number;
    col: number;
    cell: GridCellType;
    ghostShape?: GameShape | null;
    isPulseHighlight?: boolean;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    connections?: ShapeConnections;
    ghostConnections?: ShapeConnections;
}
const GridCellComponent: React.FC<GridCellProps> = ({
    row,
    col,
    cell,
    ghostShape,
    isPulseHighlight,
    onMouseEnter,
    onMouseLeave,
    connections,
    ghostConnections
}) => {
    const isPulseMode = useGameStore(state => state.isPulseMode);
    const triggerPulse = useGameStore(state => state.triggerPulse);
    const graphicsQuality = useGameStore(state => state.graphicsQuality);
    const { isOver, setNodeRef } = useDroppable({
        id: `cell-${row}-${col}`,
        data: { row, col },
        disabled: cell !== null || isPulseMode // Disable drop if occupied or in pulse mode
    });
    const handlePulseClick = () => {
        if (isPulseMode) {
            triggerPulse(row, col);
        }
    };
    const isLocked = cell?.type === ShapeType.Locked;
    const isHighQuality = graphicsQuality === 'high';
    return (
        <div
            ref={setNodeRef}
            onClick={handlePulseClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={cn(
                "w-full h-full relative transition-colors duration-200 gpu-accelerated",
                // Added aspect-square and overflow-hidden to enforce strict cell sizing
                "aspect-square overflow-hidden flex items-center justify-center",
                // Pulse Mode Active (Cursor)
                isPulseMode && "cursor-crosshair"
            )}
        >
            {/* 1. Empty Slot Visual (Simulates Grid Lines) */}
            {!cell && (
                <div className={cn(
                    "absolute inset-0 transition-colors duration-200 pointer-events-none",
                    // Visual styles - Seamless grid lines
                    "border border-white/5",
                    // Drag over state
                    isOver && !isPulseMode && !ghostShape && "bg-indigo-500/30 border-indigo-400",
                    // Pulse Highlight (3x3 area)
                    isPulseHighlight && "bg-red-500/30 border-red-500"
                )} />
            )}
            {/* 2. Occupied Shape */}
            <AnimatePresence mode="popLayout">
                {cell && !isLocked && (
                    <motion.div
                        key={cell.id}
                        className="w-full h-full z-10 gpu-accelerated"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Shape shape={cell} connections={connections} />
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Locked Icon Layer (Needs background since it's not a Shape component) */}
            <AnimatePresence>
                {isLocked && (
                    <motion.div
                        key="locked-icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className={cn(
                            "z-10 absolute inset-0 flex items-center justify-center drop-shadow-md gpu-accelerated",
                            "bg-gray-800/80 border border-gray-600"
                        )}
                    >
                        <Lock className="w-8 h-8 text-gray-400" />
                    </motion.div>
                )}
            </AnimatePresence>
            {/* 3. Ghost Preview Layer */}
            <AnimatePresence>
                {!cell && ghostShape && !isPulseMode && (
                    <motion.div
                        key="ghost-shape"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.4, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-0 gpu-accelerated"
                    >
                        <Shape
                            shape={ghostShape}
                            className="grayscale brightness-125"
                            connections={ghostConnections}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
export const GridCell = memo(GridCellComponent);
GridCell.displayName = 'GridCell';