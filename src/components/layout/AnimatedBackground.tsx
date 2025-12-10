import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
export const AnimatedBackground: React.FC = () => {
    const graphicsQuality = useGameStore(state => state.graphicsQuality);
    const isHighQuality = graphicsQuality === 'high';
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Dark Gradient Base */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
            {/* Floating Orbs - Conditional Complexity */}
            {isHighQuality ? (
                <>
                    <motion.div
                        animate={{
                            x: [0, 100, 0],
                            y: [0, -50, 0],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl gpu-accelerated"
                    />
                    <motion.div
                        animate={{
                            x: [0, -100, 0],
                            y: [0, 100, 0],
                            scale: [1, 1.5, 1]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl gpu-accelerated"
                    />
                    <motion.div
                        animate={{
                            x: [0, 50, -50, 0],
                            y: [0, 50, 0],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl gpu-accelerated"
                    />
                </>
            ) : (
                <>
                    {/* Simplified Orbs for Performance Mode */}
                    <motion.div
                        animate={{
                            x: [0, 50, 0],
                            y: [0, -30, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl gpu-accelerated"
                    />
                    <motion.div
                        animate={{
                            x: [0, -50, 0],
                            y: [0, 50, 0],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl gpu-accelerated"
                    />
                </>
            )}
        </div>
    );
};