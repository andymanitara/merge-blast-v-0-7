import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { DraggableShape } from './DraggableShape';
import { cn } from '@/lib/utils';
import { Zap, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDroppable } from '@dnd-kit/core';
export const GameControls: React.FC = () => {
    const nextShapes = useGameStore(state => state.nextShapes);
    const boardPulses = useGameStore(state => state.boardPulses);
    const isPulseMode = useGameStore(state => state.isPulseMode);
    const activatePulseMode = useGameStore(state => state.activatePulseMode);
    const isStuck = useGameStore(state => state.isStuck);
    const isMobile = useIsMobile();
    // Make the controls area a drop zone for cancelling drags
    const { setNodeRef, isOver } = useDroppable({
        id: 'queue-zone',
    });
    // Optimized unit size for mobile to fit 2x2 shapes (96px) within container
    // Mobile: 48px, Desktop: 64px
    const unitSize = isMobile ? 48 : 64;
    return (
        <div
            ref={setNodeRef}
            className={cn(
                "w-full max-w-lg mx-auto px-4 relative z-20 transition-all duration-300 rounded-3xl",
                isOver && "bg-red-500/20 scale-105 ring-4 ring-red-500/50"
            )}
        >
            {/* Cancel Drag Overlay */}
            <AnimatePresence>
                {isOver && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none z-30"
                    >
                        <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce">
                            <Undo2 className="w-4 h-4" />
                            Drop to Cancel
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="flex flex-col items-center gap-1 sm:gap-2 w-full">
                <div className="flex items-center justify-between w-full px-2 h-6 sm:h-8">
                    <span className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-wider">Next</span>
                    {/* Pulse Button */}
                    <div className={cn("transition-all duration-300", boardPulses > 0 ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none")}>
                        <Button
                            size="sm"
                            onClick={activatePulseMode}
                            className={cn(
                                "transition-all font-bold rounded-full border border-white/20 relative overflow-visible",
                                boardPulses > 0 ? "h-6 sm:h-8 px-3 sm:px-4 text-xs sm:text-sm shadow-lg ring-4 ring-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.5)]" : "h-6 text-xs",
                                isPulseMode
                                    ? "bg-red-600 text-white ring-2 ring-red-500/30 border-red-400"
                                    : "bg-gradient-to-r from-red-600 to-orange-600 text-white",
                                // Only bounce if stuck to save CPU
                                isStuck && !isPulseMode && "animate-bounce bg-red-600"
                            )}
                        >
                            <Zap className={cn("w-3 h-3 sm:w-4 sm:h-4 mr-1 fill-current", (isPulseMode || boardPulses > 0) && "animate-pulse")} />
                            Pulse ({boardPulses})
                            {/* Stuck Indicator Tooltip */}
                            {isStuck && !isPulseMode && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-lg border border-red-400">
                                    Use to Survive!
                                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45 border-b border-r border-red-400" />
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
                {/* Shapes Queue - Optimized Layout */}
                <div className={cn(
                    "flex items-center glass-panel rounded-2xl sm:rounded-3xl shadow-lg w-full transition-colors duration-300",
                    "overflow-x-auto no-scrollbar", // Enable horizontal scroll, hide scrollbar
                    "justify-evenly", // Equal spacing
                    // Mobile: h-40 (160px) & p-2 to fit 96px shapes + 40px padding comfortably
                    // Desktop: h-48 (192px) & p-4
                    isMobile ? "h-40 p-2" : "h-48 p-4",
                    isOver && "bg-red-500/10 border-red-500/30"
                )}>
                    <LayoutGroup>
                        <AnimatePresence mode="popLayout">
                            {nextShapes.map((shape) => (
                                <motion.div
                                    key={shape.id}
                                    initial={{ scale: 1, opacity: 1 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    className="flex-shrink-0" // Prevent shrinking in flex container
                                >
                                    <DraggableShape shape={shape} unitSize={unitSize} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </LayoutGroup>
                </div>
            </div>
        </div>
    );
};