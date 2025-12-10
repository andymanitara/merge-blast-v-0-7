import React, { useEffect, useState, useCallback } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    DragEndEvent,
    DragStartEvent,
    DragOverEvent,
    closestCenter,
    CollisionDetection,
    Modifier
} from '@dnd-kit/core';
import { useGameStore } from '@/store/gameStore';
import { GameBoard } from '@/components/game/GameBoard';
import { GameControls } from '@/components/game/GameControls';
import { Shape, ShapeConnections } from '@/components/game/Shape';
import { GameOverModal } from '@/components/game/GameOverModal';
import { MenuOverlay } from '@/components/game/MenuOverlay';
import { GameEffects } from '@/components/game/GameEffects';
import { HowToPlayModal } from '@/components/game/HowToPlayModal';
import { GameShape } from '@/types/game';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Trophy, Menu, Calendar, Flame, AlertTriangle } from 'lucide-react';
import { MAX_DANGER } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { playGameSound } from '@/lib/audioSynth';
import { MobileOptimizer } from '@/components/game/MobileOptimizer';
import { useIsMobile } from '@/hooks/use-mobile';
const MOBILE_DRAG_OFFSET = 80;
export function GamePage() {
    const initializeGame = useGameStore(state => state.initializeGame);
    const placeShape = useGameStore(state => state.placeShape);
    const score = useGameStore(state => state.score);
    const bestScore = useGameStore(state => state.bestScore);
    const dailyBestScore = useGameStore(state => state.dailyBestScore);
    const gameMode = useGameStore(state => state.gameMode);
    const toggleMenu = useGameStore(state => state.toggleMenu);
    const nextShapes = useGameStore(state => state.nextShapes);
    const dangerMeter = useGameStore(state => state.dangerMeter);
    const highestChain = useGameStore(state => state.highestChain);
    const graphicsQuality = useGameStore(state => state.graphicsQuality);
    const combo = useGameStore(state => state.combo);
    const lastEffect = useGameStore(state => state.lastEffect);
    const [activeShape, setActiveShape] = useState<GameShape | null>(null);
    const [ghostAnchor, setGhostAnchor] = useState<{r: number, c: number} | null>(null);
    const [isShaking, setIsShaking] = useState(false);
    const isMobile = useIsMobile();
    useEffect(() => {
        if (nextShapes.length === 0) {
            initializeGame();
        }
    }, [nextShapes.length, initializeGame]);
    // Screen shake effect for Power Bursts
    useEffect(() => {
        if (lastEffect?.type === 'powerBurst') {
            setIsShaking(true);
            const timer = setTimeout(() => setIsShaking(false), 500);
            return () => clearTimeout(timer);
        }
    }, [lastEffect]);
    // Optimized PointerSensor for instant mobile response
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        })
    );
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const shape = active.data.current?.shape as GameShape;
        if (shape) {
            setActiveShape(shape);
            playGameSound('click');
        }
    };
    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event;
        if (!over) {
            setGhostAnchor(null);
            return;
        }
        if (over.id.toString().startsWith('cell-')) {
            const { row, col } = over.data.current as { row: number, col: number };
            setGhostAnchor({ r: row, c: col });
        } else {
            setGhostAnchor(null);
        }
    };
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveShape(null);
        setGhostAnchor(null);
        if (!over) return;
        // Cancel drag if dropped in queue zone
        if (over.id === 'queue-zone') {
            return;
        }
        if (over.id.toString().startsWith('cell-')) {
            const { row, col } = over.data.current as { row: number, col: number };
            const shapeId = active.id as string;
            placeShape(row, col, shapeId);
        }
    };
    const handleToggleMenu = () => {
        playGameSound('click');
        toggleMenu();
    };
    // Custom Modifier to lift the shape on mobile
    const snapToOffset: Modifier = ({ transform }) => {
        if (isMobile) {
            return {
                ...transform,
                y: transform.y - MOBILE_DRAG_OFFSET,
            };
        }
        return transform;
    };
    // Custom Collision Strategy to compensate for the visual offset
    const customCollisionStrategy: CollisionDetection = useCallback((args) => {
        // On mobile, we want the collision to happen exactly where the visual shape is.
        // The visual shape is offset by MOBILE_DRAG_OFFSET upwards from the finger.
        // So we calculate the target point based on the pointer coordinates minus the offset.
        if (isMobile && args.pointerCoordinates) {
            const { x, y } = args.pointerCoordinates;
            const offsetY = y - MOBILE_DRAG_OFFSET;
            // Create a small rect centered at the offset position
            // We use a small size (e.g., 1px) to act as a point cursor
            const offsetRect = {
                top: offsetY,
                bottom: offsetY + 1,
                left: x,
                right: x + 1,
                width: 1,
                height: 1,
            };
            return closestCenter({
                ...args,
                collisionRect: offsetRect as any, // Cast to satisfy type if needed
            });
        }
        return closestCenter(args);
    }, [isMobile]);
    const dangerPercent = Math.min(100, (dangerMeter / MAX_DANGER) * 100);
    const isCritical = dangerPercent > 70;
    const isWarning = dangerPercent > 40;
    const isHighQuality = graphicsQuality === 'high';
    const renderDragOverlay = (shape: GameShape) => {
        const minR = Math.min(...shape.offsets.map(o => o.r));
        const minC = Math.min(...shape.offsets.map(o => o.c));
        const maxR = Math.max(...shape.offsets.map(o => o.r));
        const maxC = Math.max(...shape.offsets.map(o => o.c));
        const width = maxC - minC + 1;
        const height = maxR - minR + 1;
        // Dynamic unit size to match GameControls queue
        const UNIT_SIZE = isMobile ? 48 : 64;
        const GAP = 0; // Seamless grid means 0 gap
        const containerStyle = {
            width: width * UNIT_SIZE + (width - 1) * GAP,
            height: height * UNIT_SIZE + (height - 1) * GAP,
            position: 'relative' as const,
        };
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
        return (
            <div style={containerStyle}>
                {shape.offsets.map((offset, index) => {
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
                                shape={{...shape}}
                                className="w-full h-full"
                                isOverlay
                                connections={connections}
                            />
                        </div>
                    );
                })}
            </div>
        );
    };
    return (
        <AppLayout container className="bg-transparent h-[100dvh] font-sans overflow-hidden relative p-0 sm:p-4">
            <MobileOptimizer />
            {/* Danger Vignette - Only show in High Quality mode */}
            {isHighQuality && isCritical && (
                <div 
                    className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-500 gpu-accelerated"
                    style={{ 
                        background: `radial-gradient(circle at center, transparent 50%, rgba(220, 38, 38, ${dangerPercent / 150}))`,
                        opacity: 1
                    }}
                />
            )}
            <DndContext
                sensors={sensors}
                collisionDetection={customCollisionStrategy}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <GameEffects />
                {/* Main Container - Flex Column with Constraints */}
                <div className={cn(
                    "relative z-10 flex flex-col items-center max-w-lg mx-auto w-full h-full py-2 sm:py-4 gap-2",
                    isShaking && "animate-shake"
                )}>
                    {/* Header / HUD - Shrink 0 to preserve size */}
                    <header className="w-full flex items-center justify-between px-4 shrink-0">
                        <div className="flex flex-col">
                            <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight drop-shadow-lg">
                                Merge<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Burst</span>
                            </h1>
                            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400">
                                {gameMode === 'daily' ? (
                                    <>
                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span>Daily Best: {dailyBestScore}</span>
                                    </>
                                ) : (
                                    <>
                                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span>Best: {bestScore}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="glass-panel px-3 py-1 sm:px-4 sm:py-2 rounded-2xl shadow-lg">
                                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase block">Score</span>
                                <span className="text-xl sm:text-2xl font-black text-white tabular-nums leading-none text-glow">
                                    {score}
                                </span>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleToggleMenu}
                                className="rounded-xl hover:bg-white/10 text-white transition-colors h-10 w-10"
                            >
                                <Menu className="w-6 h-6" />
                            </Button>
                        </div>
                    </header>
                    {/* Stats Bar - Shrink 0 */}
                    <div className="w-full px-4 flex items-center justify-between gap-2 shrink-0">
                        <div className="flex items-center gap-1 glass-panel px-3 py-1 rounded-full">
                            <Flame className={cn("w-3 h-3 sm:w-4 sm:h-4", combo > 1 ? "text-yellow-400 animate-pulse" : "text-orange-500")} />
                            {combo > 1 ? (
                                <span className="text-[10px] sm:text-xs font-black text-yellow-400 animate-pulse">COMBO x{combo}</span>
                            ) : (
                                <span className="text-[10px] sm:text-xs font-bold text-slate-200">Max Chain: {highestChain}</span>
                            )}
                        </div>
                        {/* Danger Meter Bar */}
                        <div className={cn(
                            "flex-1 h-3 sm:h-4 bg-slate-800 rounded-full overflow-hidden border border-white/10 relative transition-all duration-300",
                            isCritical && "animate-shake ring-1 ring-red-500/50"
                        )}>
                            <div 
                                className={cn(
                                    "h-full transition-all duration-500 gpu-accelerated",
                                    isCritical ? "bg-gradient-to-r from-red-600 to-red-500" : 
                                    isWarning ? "bg-gradient-to-r from-orange-500 to-orange-400" : 
                                    "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                )}
                                style={{ width: `${dangerPercent}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center gap-1">
                                {isCritical && <AlertTriangle className="w-3 h-3 text-white fill-current animate-pulse" />}
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest shadow-black drop-shadow-md",
                                    isCritical ? "text-white animate-pulse" : "text-white/70"
                                )}>
                                    {isCritical ? "CRITICAL" : "Danger"}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Main Game Area - Flex 1 to take available space */}
                    <main className="w-full flex-1 flex flex-col min-h-0 relative">
                        {/* Board Wrapper - Centers board and constrains it to available space */}
                        <div className="flex-1 min-h-0 flex items-center justify-center w-full py-2">
                            {/* The board itself will be aspect-square and constrained by parent dimensions */}
                            <div className="aspect-square h-full max-h-full w-full max-w-full flex items-center justify-center">
                                <GameBoard activeShape={activeShape} ghostAnchor={ghostAnchor} />
                            </div>
                        </div>
                        {/* Controls - Fixed at bottom */}
                        <div className="shrink-0 w-full relative z-20">
                            <GameControls />
                        </div>
                    </main>
                    {/* Modals */}
                    <GameOverModal />
                    <MenuOverlay />
                    <HowToPlayModal />
                </div>
                <DragOverlay 
                    modifiers={isMobile ? [snapToOffset] : []}
                    dropAnimation={{
                        duration: 200,
                        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                    }}
                >
                    {activeShape ? renderDragOverlay(activeShape) : null}
                </DragOverlay>
            </DndContext>
        </AppLayout>
    );
}