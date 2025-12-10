import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe } from 'lucide-react';
import { LeaderboardList } from '@/components/game/LeaderboardList';
export function LeaderboardPage() {
    const navigate = useNavigate();
    return (
        <AppLayout container className="bg-transparent min-h-[100dvh] font-sans overflow-hidden relative flex flex-col py-4 md:py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl mx-auto flex-1 flex flex-col space-y-6 h-full"
            >
                {/* Header */}
                <div className="flex items-center justify-between shrink-0 px-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="rounded-full hover:bg-white/10 text-white transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
                            <Globe className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-display font-black text-white text-glow">Global Rankings</h1>
                    </div>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>
                {/* Main Content Panel */}
                <div className="flex-1 glass-panel p-4 md:p-6 rounded-3xl border border-white/10 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl overflow-hidden flex flex-col relative">
                    {/* Decorative background glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                    <div className="relative z-10 w-full h-full">
                        <LeaderboardList />
                    </div>
                </div>
            </motion.div>
        </AppLayout>
    );
}