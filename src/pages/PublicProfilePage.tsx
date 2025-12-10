import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { FlagIcon } from '@/components/ui/FlagIcon';
import { AchievementList } from '@/components/game/AchievementList';
import { api } from '@/lib/api';
import { ArrowLeft, Trophy, BarChart3, Loader2, AlertCircle } from 'lucide-react';
export function PublicProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { data: profile, isLoading, isError } = useQuery({
        queryKey: ['userProfile', userId],
        queryFn: () => userId ? api.getUserProfile(userId) : null,
        enabled: !!userId,
        retry: 1
    });
    if (isLoading) {
        return (
            <AppLayout container className="bg-transparent min-h-[100dvh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-white">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
                    <p className="font-bold text-lg">Loading Profile...</p>
                </div>
            </AppLayout>
        );
    }
    if (isError || !profile) {
        return (
            <AppLayout container className="bg-transparent min-h-[100dvh] flex items-center justify-center">
                <div className="glass-panel p-8 rounded-3xl text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Profile Not Found</h2>
                    <p className="text-slate-400">The user you are looking for does not exist or could not be loaded.</p>
                    <Button onClick={() => navigate(-1)} variant="outline" className="mt-4 border-white/20 text-white hover:bg-white/10">
                        Go Back
                    </Button>
                </div>
            </AppLayout>
        );
    }
    return (
        <AppLayout container className="bg-transparent min-h-[100dvh] font-sans overflow-hidden relative flex flex-col items-center py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl space-y-8"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="rounded-full hover:bg-white/10 text-white"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl font-display font-black text-white text-glow uppercase tracking-wider">Player Profile</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>
                {/* Main Card */}
                <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl shadow-indigo-500/20 space-y-8 backdrop-blur-xl relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    {/* Identity Section */}
                    <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full" />
                            <UserAvatar avatarId={profile.avatar} size="xl" className="relative z-10" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-white">{profile.name}</h2>
                            <div className="flex items-center justify-center gap-2 text-slate-400 font-bold bg-black/20 py-1 px-3 rounded-full w-fit mx-auto">
                                <FlagIcon code={profile.country} className="w-5 h-4 rounded-[2px]" />
                                <span className="text-sm">{profile.country === 'GLOBAL' ? 'Global' : profile.country}</span>
                            </div>
                        </div>
                    </div>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center text-center">
                            <p className="text-2xl font-black text-white">{profile.stats.totalGamesPlayed}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Games</p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center text-center">
                            <p className="text-2xl font-black text-emerald-400">{profile.stats.totalMerges}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Merges</p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center text-center">
                            <p className="text-2xl font-black text-indigo-400">{profile.stats.bestScore}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Best Score</p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center text-center">
                            <p className="text-2xl font-black text-orange-400">{profile.stats.highestChain}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Chain</p>
                        </div>
                    </div>
                </div>
                {/* Achievements Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-sm px-2">
                        <Trophy className="w-4 h-4" />
                        <span>Achievements</span>
                    </div>
                    <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl">
                        <AchievementList 
                            unlocked={profile.achievements} 
                            stats={{
                                score: 0, // Not relevant for static display
                                bestScore: profile.stats.bestScore,
                                totalMerges: profile.stats.totalMerges,
                                totalGamesPlayed: profile.stats.totalGamesPlayed,
                                highestChain: profile.stats.highestChain,
                                dangerMeter: profile.stats.dangerMeter
                            }}
                        />
                    </div>
                </div>
            </motion.div>
        </AppLayout>
    );
}