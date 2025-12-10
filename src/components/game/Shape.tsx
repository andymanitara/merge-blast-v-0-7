import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GameShape } from '@/types/game';
import { SHAPE_TYPE_COLORS, SHAPE_SHADOW_COLORS, ShapeType } from '@/lib/constants';
import { ShapeSVG } from './ShapeSVG';
import { cn } from '@/lib/utils';
import { AlertTriangle, Zap } from 'lucide-react';
export interface ShapeConnections {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
}
interface ShapeProps {
    shape: GameShape;
    className?: string;
    isOverlay?: boolean;
    connections?: ShapeConnections;
}
export const Shape = memo<ShapeProps>(({ shape, className, isOverlay = false, connections }) => {
    const graphicsQuality = useGameStore(state => state.graphicsQuality);
    const isHighQuality = graphicsQuality === 'high';
    const isLocked = shape.type === ShapeType.Locked;
    const isFragile = shape.isFragile;
    const isCracked = shape.isCracked;
    // Default connections (none) if not provided
    const conn = connections || { top: false, right: false, bottom: false, left: false };
    // 1. Radius Classes (Inner Visual)
    const radiusClasses = cn(
        (!conn.top && !conn.left) ? "rounded-tl-lg" : "rounded-tl-none",
        (!conn.top && !conn.right) ? "rounded-tr-lg" : "rounded-tr-none",
        (!conn.bottom && !conn.right) ? "rounded-br-lg" : "rounded-br-none",
        (!conn.bottom && !conn.left) ? "rounded-bl-lg" : "rounded-bl-none"
    );
    // 2. Border Removal Classes (Inner Visual)
    const borderRemovalClasses = cn(
        conn.top && "border-t-0",
        conn.right && "border-r-0",
        conn.bottom && "border-b-0",
        conn.left && "border-l-0"
    );
    // 3. Content Padding Classes (Inner Visual)
    const contentPaddingClasses = cn(
        "p-1",
        conn.top && "pt-0",
        conn.right && "pr-0",
        conn.bottom && "pb-0",
        conn.left && "pl-0"
    );
    // --- LOCKED TILES (Metallic/Industrial Look) ---
    if (isLocked) {
        return (
            <div className={cn("w-full h-full", className)}>
                <motion.div
                    layoutId={isOverlay ? undefined : shape.id}
                    initial={{ scale: 1 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className={cn(
                        "relative flex items-center justify-center w-full h-full transition-colors transition-transform duration-200 gpu-accelerated",
                        radiusClasses,
                        "border",
                        borderRemovalClasses,
                        contentPaddingClasses,
                        "bg-gradient-to-br from-gray-700 to-gray-900 border-gray-600 text-gray-400",
                        isOverlay && "shadow-xl scale-110 z-50 cursor-grabbing"
                    )}
                >
                    <div className="relative z-10 w-3/5 h-3/5 opacity-90 text-current">
                         <ShapeSVG type={shape.type} />
                    </div>
                    <div className={cn("absolute inset-0 bg-white/10 pointer-events-none", radiusClasses)} />
                </motion.div>
            </div>
        );
    }
    // --- STANDARD SHAPES (Gem/Arcade Look) ---
    const baseGradient = SHAPE_TYPE_COLORS[shape.type] || 'bg-gray-500';
    const shadowColor = SHAPE_SHADOW_COLORS[shape.type] || 'shadow-gray-500/50';
    return (
        <div className={cn("w-full h-full", className)}>
            <motion.div
                layoutId={isOverlay ? undefined : shape.id}
                initial={{ scale: 1 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={cn(
                    "relative flex items-center justify-center w-full h-full transition-colors transition-transform duration-200 gpu-accelerated",
                    radiusClasses,
                    contentPaddingClasses,
                    baseGradient,
                    // Conditional Shadow Intensity
                    isHighQuality ? "shadow-lg" : "shadow-md",
                    shadowColor,
                    // Base Border
                    !isOverlay && "border border-white/20",
                    // Overlay specific styles
                    isOverlay && "shadow-xl scale-110 z-50 cursor-grabbing border-2 border-white/40",
                    // Fragile Visuals
                    isFragile && !isCracked && "ring-2 ring-yellow-400/80 border-yellow-400/50",
                    // Cracked Visuals
                    isCracked && "grayscale brightness-75 ring-2 ring-red-500 border-red-500 opacity-90",
                    // Border Removal
                    borderRemovalClasses
                )}
            >
                {/* Simplified Gem Reflection */}
                <div className={cn(
                    "absolute inset-0 border-t border-l border-white/30 pointer-events-none",
                    radiusClasses,
                    conn.top && "border-t-0",
                    conn.left && "border-l-0"
                )} />
                {/* Shape Icon */}
                <div className="relative z-10 w-3/5 h-3/5 opacity-90 text-white">
                    <ShapeSVG type={shape.type} />
                </div>
                {/* Fragile Indicator */}
                {isFragile && !isCracked && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <AlertTriangle className="w-1/2 h-1/2 text-yellow-300 drop-shadow-md animate-pulse" />
                    </div>
                )}
                {/* Cracked Indicator */}
                {isCracked && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <Zap className="w-2/3 h-2/3 text-red-500 drop-shadow-md opacity-80" />
                        {/* CSS Crack Overlay */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cGF0aCBkPSJNMTAgMTAgTDUwIDUwIEw5MCAxMCIgc3Ryb2tlPSJyZ2JhKDAsMCwwLDAuMykiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] bg-cover opacity-50" />
                    </div>
                )}
            </motion.div>
        </div>
    );
});
Shape.displayName = 'Shape';