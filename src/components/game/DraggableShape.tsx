import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useGameStore } from '@/store/gameStore';
import { GameShape } from '@/types/game';
import { Shape, ShapeConnections } from './Shape';
import { cn } from '@/lib/utils';
interface DraggableShapeProps {
    shape: GameShape;
    disabled?: boolean;
    unitSize?: number;
}
export const DraggableShape: React.FC<DraggableShapeProps> = ({ shape, disabled, unitSize = 40 }) => {
    const isStuck = useGameStore(state => state.isStuck);
    const isDragDisabled = disabled || isStuck;
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: shape.id,
        data: { shape },
        disabled: isDragDisabled
    });
    // Calculate bounds to size the container
    const minR = Math.min(...shape.offsets.map(o => o.r));
    const maxR = Math.max(...shape.offsets.map(o => o.r));
    const minC = Math.min(...shape.offsets.map(o => o.c));
    const maxC = Math.max(...shape.offsets.map(o => o.c));
    const width = maxC - minC + 1;
    const height = maxR - minR + 1;
    // Use prop for unit size
    const UNIT_SIZE = unitSize;
    // Adjust gap based on unit size. For seamless look, we use 0 gap.
    const GAP = 0;
    const containerStyle = {
        width: width * UNIT_SIZE + (width - 1) * GAP,
        height: height * UNIT_SIZE + (height - 1) * GAP,
        position: 'relative' as const,
    };
    // Helper to calculate connections for a specific offset
    const getConnections = (r: number, c: number): ShapeConnections => {
        const hasOffset = (dr: number, dc: number) => {
            return shape.offsets.some(o => o.r === r + dr && o.c === c + dc);
        };
        return {
            top: hasOffset(-1, 0),
            bottom: hasOffset(1, 0),
            left: hasOffset(0, -1),
            right: hasOffset(0, 1)
        };
    };
    const renderShapeStructure = () => (
        <div style={containerStyle}>
            {shape.offsets.map((offset, index) => {
                // Adjust position relative to minR/minC so the shape is top-left aligned in container
                const top = (offset.r - minR) * (UNIT_SIZE + GAP);
                const left = (offset.c - minC) * (UNIT_SIZE + GAP);
                const connections = getConnections(offset.r, offset.c);
                return (
                    <div
                        key={`${index}`}
                        style={{
                            position: 'absolute',
                            top,
                            left,
                            width: UNIT_SIZE,
                            height: UNIT_SIZE,
                        }}
                    >
                        <Shape
                            // CRITICAL FIX: Pass unique ID for each tile in the preview
                            // This prevents duplicate layoutId issues in Framer Motion
                            shape={{
                                ...shape,
                                id: `${shape.id}_preview_${index}`,
                            }}
                            className="w-full h-full"
                            connections={connections}
                        />
                    </div>
                );
            })}
        </div>
    );
    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                className="opacity-30 grayscale p-5" // Added p-5 (20px) padding to maintain size consistency
            >
                {renderShapeStructure()}
            </div>
        );
    }
    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(
                "touch-none transition-transform p-5", // Added p-5 (20px) padding to increase hit area
                !isDragDisabled && "cursor-grab active:cursor-grabbing hover:scale-105",
                isDragDisabled && "opacity-50 grayscale cursor-not-allowed"
            )}
        >
            {renderShapeStructure()}
        </div>
    );
};