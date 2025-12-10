import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { X, Hand, ArrowRight, Zap, AlertTriangle, Check } from 'lucide-react';
import { Shape } from './Shape';
import { ShapeType } from '@/lib/constants';
import { GameShape } from '@/types/game';
export const HowToPlayModal: React.FC = () => {
    const isOpen = useGameStore(state => state.isHowToPlayOpen);
    const close = useGameStore(state => state.closeHowToPlay);
    if (!isOpen) return null;
    // Helper to create dummy shapes for display
    const createDummyShape = (type: ShapeType, isFragile = false, isCracked = false): GameShape => ({
        id: `demo-${type}-${isFragile}-${isCracked}`,
        type,
        isFragile,
        isCracked,
        offsets: [{ r: 0, c: 0 }],
    });
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-slate-900/95 backdrop-blur-md w-full max-w-lg max-h-[90vh] rounded-3xl border border-white/10 shadow-2xl shadow-indigo-500/20 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                            <h2 className="text-3xl font-display font-black text-white text-glow">How to Play</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={close}
                                className="rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                        {/* Content - Added 'allow-touch-scroll' class */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-10 allow-touch-scroll">
                            {/* Section 1: Basics */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-indigo-300 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                                    The Basics
                                </h3>
                                {/* Drag & Drop */}
                                <div className="flex gap-4 items-start group">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                                        <Hand className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-bold text-white">Drag & Drop</h4>
                                        <p className="text-slate-300 font-medium leading-relaxed text-sm">
                                            Drag shapes onto the grid. There is <span className="text-indigo-400 font-bold">no gravity</span>—shapes stay exactly where you put them!
                                        </p>
                                    </div>
                                </div>
                                {/* Match to Clear */}
                                <div className="flex gap-4 items-start group">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                                        <div className="flex -space-x-1">
                                            <div className="w-4 h-4 bg-current rounded-sm opacity-80" />
                                            <div className="w-4 h-4 bg-current rounded-sm" />
                                        </div>
                                    </div>
                                    <div className="space-y-3 w-full">
                                        <h4 className="text-lg font-bold text-white">Match to Clear</h4>
                                        <p className="text-slate-300 font-medium leading-relaxed text-sm">
                                            Place identical shapes next to each other to <span className="text-emerald-400 font-bold">CLEAR</span> them immediately.
                                        </p>
                                        {/* Visual Match Demo */}
                                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex items-center justify-center gap-4 shadow-inner">
                                            <div className="w-12 h-12">
                                                <Shape shape={createDummyShape(ShapeType.Square)} />
                                            </div>
                                            <span className="text-slate-500 font-black text-xl">+</span>
                                            <div className="w-12 h-12">
                                                <Shape shape={createDummyShape(ShapeType.Square)} />
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-slate-500" />
                                            <div className="w-14 h-14 flex items-center justify-center">
                                                <span className="text-emerald-400 font-black text-xl">GONE!</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Section 2: Fragile Shapes */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-yellow-400 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                                    Fragile Shapes
                                </h3>
                                {/* Fragile Warning */}
                                <div className="flex gap-4 items-start group">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform duration-300">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-bold text-white">Match Immediately!</h4>
                                        <p className="text-slate-300 font-medium leading-relaxed text-sm">
                                            Fragile shapes (marked with <AlertTriangle className="w-3 h-3 inline text-yellow-400"/>) are unstable.
                                            You <span className="text-yellow-400 font-bold">MUST</span> match them immediately upon placement.
                                        </p>
                                    </div>
                                </div>
                                {/* Cracking Logic */}
                                <div className="flex gap-4 items-start group">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform duration-300">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-3 w-full">
                                        <h4 className="text-lg font-bold text-white">Crack & Lock</h4>
                                        <p className="text-slate-300 font-medium leading-relaxed text-sm">
                                            If a Fragile Shape doesn't match, it <span className="text-red-400 font-bold">CRACKS</span>.
                                            On the next turn, cracked tiles become <span className="font-bold text-slate-200">LOCKED</span> permanently!
                                        </p>
                                        <div className="flex gap-6 justify-center bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12">
                                                    <Shape shape={createDummyShape(ShapeType.Circle, true)} />
                                                </div>
                                                <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Fragile</span>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-slate-500 self-center" />
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12">
                                                    <Shape shape={createDummyShape(ShapeType.Circle, false, true)} />
                                                </div>
                                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Cracked</span>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-slate-500 self-center" />
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12">
                                                    <Shape shape={createDummyShape(ShapeType.Locked)} />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Locked</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Section 3: Power Bursts */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-amber-400 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                                    Power Bursts
                                </h3>
                                {/* Burst Info */}
                                <div className="flex gap-4 items-start group">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-300">
                                        <Zap className="w-6 h-6 fill-current" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-bold text-white">Chain Reactions</h4>
                                        <p className="text-slate-300 font-medium leading-relaxed text-sm">
                                            Create a chain of <span className="text-amber-400 font-bold">5+ matches</span> to trigger a random <span className="font-bold text-white">POWER BURST</span>!
                                            Bursts can clear areas, remove locks, or lower danger.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Footer */}
                        <div className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-sm">
                            <Button
                                onClick={close}
                                className="w-full py-6 text-xl font-bold rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Check className="w-6 h-6 mr-2" />
                                Got it, let's play!
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};