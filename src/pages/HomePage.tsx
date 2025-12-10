import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Play, Calendar, CircleHelp, Volume2, VolumeX, Globe, Trophy, Share2, Download } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { HowToPlayModal } from '@/components/game/HowToPlayModal';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { cn, shareApp } from '@/lib/utils';
import { playGameSound } from '@/lib/audioSynth';
import { toast } from 'sonner';
import { usePWA } from '@/hooks/use-pwa';
import { FloatingShapesBackground } from '@/components/layout/FloatingShapesBackground';
export function HomePage() {
    const navigate = useNavigate();
    const setGameMode = useGameStore(state => state.setGameMode);
    const initializeGame = useGameStore(state => state.initializeGame);
    const openHowToPlay = useGameStore(state => state.openHowToPlay);
    // Selectors for Daily Challenge status
    const dailyBestScore = useGameStore(state => state.dailyBestScore);
    const lastDailyDate = useGameStore(state => state.lastDailyDate);
    // Sound settings
    const isSoundEnabled = useGameStore(state => state.isSoundEnabled);
    const toggleSound = useGameStore(state => state.toggleSound);
    // User Profile
    const user = useAuthStore(state => state.user);
    // PWA Hook
    const { isInstallable, install } = usePWA();
    const handleStartGame = (mode: 'endless' | 'daily') => {
        playGameSound('click');
        setGameMode(mode);
        initializeGame(); // Ensure fresh start or correct mode init
        navigate('/game');
    };
    const handleOpenHelp = () => {
        playGameSound('click');
        openHowToPlay();
    };
    const handleToggleSound = () => {
        toggleSound();
        if (!isSoundEnabled) {
            // If we just enabled it, play a sound to confirm
            setTimeout(() => playGameSound('click'), 50);
        }
    };
    const handleProfileClick = () => {
        playGameSound('click');
        navigate('/profile');
    };
    const handleLeaderboardClick = () => {
        playGameSound('click');
        navigate('/leaderboard');
    };
    const handleShareApp = async () => {
        playGameSound('click');
        const result = await shareApp();
        if (result === 'copied') {
            toast.success("Link copied to clipboard!");
        } else if (result === 'failed') {
            toast.error("Could not share. Try copying the URL manually.");
        }
    };
    const handleInstall = () => {
        playGameSound('click');
        install();
    };
    // Check if played today
    const today = new Date().toISOString().split('T')[0];
    const hasPlayedDaily = lastDailyDate === today && dailyBestScore > 0;
    return (
        <AppLayout container className="bg-transparent min-h-[100dvh] font-sans overflow-hidden relative">
            {/* Animated Background Shapes */}
            <FloatingShapesBackground />
            {/* Top Left: Profile Button */}
            <div className="absolute top-4 left-4 z-20">
                <Button
                    variant="ghost"
                    onClick={handleProfileClick}
                    className="h-14 pl-2 pr-4 rounded-full glass-panel hover:bg-white/20 text-white transition-all hover:scale-105 shadow-lg flex items-center gap-3 border-white/20"
                >
                    <UserAvatar avatarId={user?.avatar} size="sm" />
                    <div className="flex flex-col items-start text-left">
                        <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">Player</span>
                        <span className="text-sm font-bold text-white max-w-[100px] truncate">
                            {user?.name || 'Guest'}
                        </span>
                    </div>
                </Button>
            </div>
            {/* Top Right: Controls (Install + Share + Sound + Help) */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
                {isInstallable && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleInstall}
                        className="w-12 h-12 rounded-full glass-panel hover:bg-white/20 text-white transition-all hover:scale-110 shadow-lg"
                        title="Install App"
                    >
                        <Download className="w-6 h-6" />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShareApp}
                    className="w-12 h-12 rounded-full glass-panel hover:bg-white/20 text-white transition-all hover:scale-110 shadow-lg"
                    title="Share Game"
                >
                    <Share2 className="w-6 h-6" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleSound}
                    className="w-12 h-12 rounded-full glass-panel hover:bg-white/20 text-white transition-all hover:scale-110 shadow-lg"
                    title={isSoundEnabled ? "Mute Sound" : "Enable Sound"}
                >
                    {isSoundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleOpenHelp}
                    className="w-12 h-12 rounded-full glass-panel hover:bg-white/20 text-white transition-all hover:scale-110 shadow-lg"
                    title="How to Play"
                >
                    <CircleHelp className="w-6 h-6" />
                </Button>
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] space-y-12 text-center pt-20 pb-10">
                {/* Title Section */}
                <div className="space-y-4">
                    <motion.h1
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-6xl md:text-8xl font-display font-black text-white tracking-tighter drop-shadow-2xl"
                    >
                        Merge<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 text-glow">Burst</span>
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl font-medium text-slate-300"
                    >
                        Infinite Puzzle Fun
                    </motion.p>
                </div>
                {/* Action Buttons */}
                <div className="flex flex-col w-full max-w-xs gap-6">
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col items-center"
                    >
                        <Button
                            onClick={() => handleStartGame('endless')}
                            className={cn(
                                "w-full h-20 text-2xl font-bold rounded-3xl text-white transition-all shadow-xl group relative overflow-hidden",
                                "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500",
                                "border border-white/20 shadow-indigo-500/30"
                            )}
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center w-full px-6 relative z-10">
                                <div className="p-2 bg-white/20 rounded-xl group-hover:scale-110 transition-transform mr-4 shrink-0">
                                    <Play className="w-8 h-8 fill-current" />
                                </div>
                                <div className="flex flex-col items-start text-left">
                                    <span className="text-shadow-sm leading-none">Play Endless</span>
                                    <span className="text-[10px] sm:text-xs font-bold text-indigo-100/80 uppercase tracking-wider mt-0.5">No tier limit</span>
                                </div>
                            </div>
                        </Button>
                    </motion.div>
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col items-center"
                    >
                        <Button
                            onClick={() => handleStartGame('daily')}
                            className={cn(
                                "w-full h-20 text-2xl font-bold rounded-3xl text-white transition-all shadow-xl group relative overflow-hidden",
                                "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
                                "border border-white/20 shadow-emerald-500/30"
                            )}
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center w-full px-6 relative z-10">
                                <div className="p-2 bg-white/20 rounded-xl group-hover:scale-110 transition-transform mr-4 shrink-0">
                                    <Calendar className="w-8 h-8" />
                                </div>
                                <div className="flex flex-col items-start text-left">
                                    <span className="text-shadow-sm leading-none">Daily Challenge</span>
                                    <span className="text-[10px] sm:text-xs font-bold text-emerald-100/80 uppercase tracking-wider mt-0.5">Tier limit max 3</span>
                                </div>
                                {hasPlayedDaily && (
                                    <div className="ml-auto flex flex-col items-end bg-black/20 px-3 py-1 rounded-lg border border-white/10 shrink-0">
                                        <div className="flex items-center gap-1 text-xs text-emerald-200 uppercase font-bold">
                                            <Trophy className="w-3 h-3" /> Best
                                        </div>
                                        <span className="text-lg font-black text-white">{dailyBestScore}</span>
                                    </div>
                                )}
                            </div>
                        </Button>
                    </motion.div>
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Button
                            onClick={handleLeaderboardClick}
                            className={cn(
                                "w-full h-20 text-2xl font-bold rounded-3xl text-white transition-all shadow-xl group relative overflow-hidden",
                                "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500",
                                "border border-white/20 shadow-cyan-500/30"
                            )}
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center w-full px-6 relative z-10">
                                <div className="p-2 bg-white/20 rounded-xl group-hover:scale-110 transition-transform mr-4 shrink-0">
                                    <Globe className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                                </div>
                                <span className="text-shadow-sm">Leaderboard</span>
                            </div>
                        </Button>
                    </motion.div>
                </div>
            </div>
            <HowToPlayModal />
        </AppLayout>
    );
}