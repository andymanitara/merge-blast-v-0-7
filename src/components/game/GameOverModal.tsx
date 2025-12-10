import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCw, Calendar, Share2, Globe, Home } from 'lucide-react';
import { shareGameResult } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { LeaderboardList } from '@/components/game/LeaderboardList';
export const GameOverModal: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isGameOver = useGameStore(state => state.isGameOver);
    const score = useGameStore(state => state.score);
    const bestScore = useGameStore(state => state.bestScore);
    const dailyBestScore = useGameStore(state => state.dailyBestScore);
    const gameMode = useGameStore(state => state.gameMode);
    const highestChain = useGameStore(state => state.highestChain);
    const resetGame = useGameStore(state => state.resetGame);
    // Stats for profile update
    const totalGamesPlayed = useGameStore(state => state.totalGamesPlayed);
    const totalMerges = useGameStore(state => state.totalMerges);
    const dangerMeter = useGameStore(state => state.dangerMeter);
    const unlockedAchievements = useGameStore(state => state.unlockedAchievements);
    const user = useAuthStore(state => state.user);
    const currentBest = gameMode === 'daily' ? dailyBestScore : bestScore;
    const isNewBest = score >= currentBest && score > 0;
    // Auto-submit score on mount when game is over
    useEffect(() => {
        if (isGameOver && user && score > 0) {
            api.submitScore(gameMode, score, {
                id: user.id,
                name: user.name,
                avatar: user.avatar || 'user',
                country: user.country || 'GLOBAL'
            }, {
                totalGamesPlayed,
                totalMerges,
                highestChain,
                dangerMeter,
                unlockedAchievements
            }).then(success => {
                if (success) {
                    // Invalidate queries to refresh leaderboard immediately
                    queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
                    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
                    // Optional: toast.success("Score submitted to global leaderboard!");
                }
            });
        }
    }, [isGameOver, user, score, gameMode, totalGamesPlayed, totalMerges, highestChain, dangerMeter, unlockedAchievements, queryClient]);
    const handleShare = async () => {
        const result = await shareGameResult({
            score,
            gameMode,
            bestScore,
            dailyBestScore,
            highestChain
        });
        if (result === 'copied') {
            toast.success("Result copied to clipboard!");
        } else if (result === 'failed') {
            toast.error("Unable to share result. Please try taking a screenshot!");
        }
    };
    const handleHome = () => {
        // Close modal implicitly by navigating away, but we should probably reset game state or just leave it as is?
        // Usually navigating away unmounts the game page, so state might persist if we return unless reset.
        // The user just wants to go home.
        navigate('/');
    };
    if (!isGameOver) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                // Added 'allow-touch-scroll' class to enable scrolling on mobile
                className="glass-panel p-6 rounded-4xl shadow-2xl shadow-indigo-500/20 text-center max-w-md w-full space-y-6 max-h-[95vh] overflow-y-auto border border-white/20 custom-scrollbar flex flex-col allow-touch-scroll"
            >
                <div className="space-y-2 shrink-0">
                    <h2 className="text-4xl font-display font-black text-white text-glow">
                        {isNewBest ? "New Best!" : "Game Over!"}
                    </h2>
                    <p className="text-slate-300 font-medium">
                        {isNewBest ? "You crushed it!" : "No more moves possible."}
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4 shrink-0">
                    <div className="py-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-xs text-slate-400 font-bold uppercase">Score</p>
                        <p className="text-3xl font-black text-white text-glow">{score}</p>
                    </div>
                    <div className="py-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            {gameMode === 'daily' ? (
                                <Calendar className="w-3 h-3 text-indigo-300" />
                            ) : (
                                <Trophy className="w-3 h-3 text-indigo-300" />
                            )}
                            <p className="text-xs text-indigo-300 font-bold uppercase">
                                {gameMode === 'daily' ? "Daily Best" : "Best"}
                            </p>
                        </div>
                        <p className="text-3xl font-black text-indigo-200">{currentBest}</p>
                    </div>
                </div>
                {/* Global Leaderboard Section */}
                <div className="flex-1 min-h-[250px] flex flex-col space-y-2">
                    <div className="flex items-center justify-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-xs shrink-0">
                        <Globe className="w-3 h-3" />
                        <span>Global Rankings</span>
                    </div>
                    <div className="flex-1 bg-black/20 rounded-2xl p-2 border border-white/5 overflow-hidden relative">
                        <LeaderboardList defaultMode={gameMode} />
                    </div>
                </div>
                <div className="flex gap-3 w-full shrink-0">
                    <Button
                        onClick={handleHome}
                        variant="outline"
                        className="w-16 py-6 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 text-white active:scale-95 transition-all"
                        title="Home"
                    >
                        <Home className="w-6 h-6" />
                    </Button>
                    <Button
                        onClick={resetGame}
                        className="flex-1 py-6 text-xl font-bold rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-all"
                    >
                        <RefreshCw className="w-6 h-6 mr-2" />
                        Play Again
                    </Button>
                    <Button
                        onClick={handleShare}
                        variant="outline"
                        className="w-16 py-6 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 text-white active:scale-95 transition-all"
                        title="Share Result"
                    >
                        <Share2 className="w-6 h-6" />
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};