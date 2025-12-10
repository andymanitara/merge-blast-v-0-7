import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GameEffect } from '@/types/game';
import { GRID_SIZE } from '@/lib/constants';
import { AlertTriangle, Lock } from 'lucide-react';
export const FloatingFeedback: React.FC = () => {
    const lastEffect = useGameStore(state => state.lastEffect);
    const [effects, setEffects] = useState<GameEffect[]>([]);
    useEffect(() => {
        if (lastEffect) {
            setEffects(prev => [...prev, lastEffect]);
            setTimeout(() => {
                setEffects(prev => prev.filter(e => e.id !== lastEffect.id));
            }, 1500);
        }
    }, [lastEffect]);
    const getPosition = (r?: number, c?: number) => {
        if (r === undefined || c === undefined) {
            // Center screen fallback
            return {
                top: '50%',
                left: '50%',
                width: 'auto',
                height: 'auto',
                transform: 'translate(-50%, -50%)'
            };
        }
        const cellSize = 100 / GRID_SIZE;
        return {
            top: `${r * cellSize}%`,
            left: `${c * cellSize}%`,
            width: `${cellSize}%`,
            height: `${cellSize}%`
        };
    };
    return (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-3xl">
            <AnimatePresence>
                {effects.map(effect => {
                    // Allow effects without location for crack/lock (global feedback)
                    if (!effect.location && effect.type !== 'crack' && effect.type !== 'lock') return null;
                    const style = getPosition(effect.location?.r, effect.location?.c);
                    const isCentered = !effect.location;
                    if (effect.type === 'merge') {
                        const rotation = Math.random() * 20 - 10; // Random tilt
                        return (
                            <motion.div
                                key={effect.id}
                                initial={{ opacity: 0, y: 0, scale: 0.5, rotate: rotation }}
                                animate={{ opacity: 1, y: -60, scale: 1.2, rotate: rotation }}
                                exit={{ opacity: 0, y: -80, scale: 0.8 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                className="absolute flex flex-col items-center justify-center"
                                style={style}
                            >
                                <span className="font-display font-black text-3xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] stroke-black stroke-2 text-white">
                                    +{effect.scoreValue}
                                </span>
                                {effect.combo && effect.combo > 1 && (
                                    <span className="font-display font-black text-xl text-yellow-300 drop-shadow-md animate-pulse">
                                        x{effect.combo}
                                    </span>
                                )}
                            </motion.div>
                        );
                    }
                    if (effect.type === 'powerBurst') {
                        const burstType = effect.powerBurst;
                        let text = "BURST!";
                        let color = "text-yellow-400";
                        if (burstType === 'blast') { text = "BLAST!"; color = "text-red-400"; }
                        if (burstType === 'purify') { text = "PURIFY!"; color = "text-emerald-400"; }
                        if (burstType === 'calm') { text = "CALM!"; color = "text-blue-400"; }
                        return (
                            <React.Fragment key={effect.id}>
                                {/* Shockwave */}
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0.8, borderWidth: '4px' }}
                                    animate={{ scale: 2, opacity: 0, borderWidth: '0px' }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className="absolute rounded-full border-white"
                                    style={{ ...style, top: `calc(${style.top} + 10%)`, left: `calc(${style.left} + 10%)`, width: '80%', height: '80%' }}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, y: -60, scale: 1.5 }}
                                    exit={{ opacity: 0, y: -80, scale: 0.8 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    className="absolute flex flex-col items-center justify-center"
                                    style={style}
                                >
                                    <span className={`font-display font-black text-2xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] stroke-black stroke-2 ${color}`}>
                                        {text}
                                    </span>
                                    <span className="font-display font-black text-xl text-white drop-shadow-md">
                                        +{effect.scoreValue}
                                    </span>
                                </motion.div>
                            </React.Fragment>
                        );
                    }
                    if (effect.type === 'pulse') {
                        return (
                            <motion.div
                                key={effect.id}
                                initial={{ opacity: 0.8, scale: 0.5 }}
                                animate={{ opacity: 0, scale: 3 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="absolute flex items-center justify-center"
                                style={style}
                            >
                                <div className="w-full h-full rounded-full border-4 border-red-500 bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
                            </motion.div>
                        );
                    }
                    if (effect.type === 'crack') {
                        return (
                            <motion.div
                                key={effect.id}
                                initial={{ opacity: 0, scale: 0.5, x: 0 }}
                                animate={{ 
                                    opacity: 1, 
                                    scale: 1.5, 
                                    x: [-5, 5, -5, 5, 0],
                                    rotate: [-5, 5, -5, 5, 0]
                                }}
                                exit={{ opacity: 0, scale: 2 }}
                                transition={{ duration: 0.5 }}
                                className={isCentered ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" : "absolute flex items-center justify-center"}
                                style={isCentered ? {} : style}
                            >
                                <AlertTriangle className="w-12 h-12 text-red-500 drop-shadow-lg mb-2" />
                                <span className="font-display font-black text-4xl text-red-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] stroke-white stroke-1">
                                    CRACK!
                                </span>
                            </motion.div>
                        );
                    }
                    if (effect.type === 'lock') {
                        return (
                            <motion.div
                                key={effect.id}
                                initial={{ opacity: 0, scale: 2, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className={isCentered ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" : "absolute flex items-center justify-center"}
                                style={isCentered ? {} : style}
                            >
                                <Lock className="w-12 h-12 text-slate-400 drop-shadow-lg mb-2" />
                                <span className="font-display font-black text-4xl text-slate-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                    LOCKED
                                </span>
                            </motion.div>
                        );
                    }
                    return null;
                })}
            </AnimatePresence>
        </div>
    );
};