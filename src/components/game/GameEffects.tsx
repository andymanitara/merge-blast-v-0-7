import React, { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { playGameSound } from '@/lib/audioSynth';
import confetti from 'canvas-confetti';
export const GameEffects: React.FC = () => {
    const lastEffect = useGameStore(state => state.lastEffect);
    const isSoundEnabled = useGameStore(state => state.isSoundEnabled);
    const hapticsEnabled = useGameStore(state => state.hapticsEnabled);
    const graphicsQuality = useGameStore(state => state.graphicsQuality);
    const clearEffect = useGameStore(state => state.clearEffect);
    useEffect(() => {
        if (!lastEffect) return;
        // 1. Audio
        if (isSoundEnabled) {
            // Use combo count as intensity, default to 1 if undefined
            playGameSound(lastEffect.type, lastEffect.combo || 1);
        }
        // 2. Haptics (if supported and enabled)
        if (hapticsEnabled && navigator.vibrate) {
            switch (lastEffect.type) {
                case 'place':
                    navigator.vibrate(20);
                    break;
                case 'merge':
                    navigator.vibrate(50);
                    break;
                case 'heavyMerge':
                    navigator.vibrate([50, 50, 100]);
                    break;
                case 'gameover':
                    navigator.vibrate([100, 50, 100]);
                    break;
                case 'bestScore':
                    navigator.vibrate([50, 50, 50, 50, 100]);
                    break;
                case 'lockSpawn':
                    navigator.vibrate(100);
                    break;
                case 'pulse':
                    navigator.vibrate([30, 30, 30]);
                    break;
                case 'crack':
                    navigator.vibrate([30, 30]);
                    break;
                case 'lock':
                    navigator.vibrate(150);
                    break;
            }
        }
        // 3. Visuals (Confetti) - Only in High Quality for heavy effects
        if (graphicsQuality === 'high') {
            if (lastEffect.type === 'bestScore' || lastEffect.type === 'heavyMerge') {
                confetti({
                    particleCount: lastEffect.type === 'bestScore' ? 100 : 50,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#FF6B6B', '#4ECDC4', '#FFE66D']
                });
            }
        }
        // Clear effect immediately
        clearEffect();
    }, [lastEffect, isSoundEnabled, hapticsEnabled, graphicsQuality, clearEffect]);
    return null;
};