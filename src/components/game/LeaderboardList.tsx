import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { FlagIcon } from '@/components/ui/FlagIcon';
import { cn } from '@/lib/utils';
import { Trophy, Calendar, Infinity as InfinityIcon, Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface LeaderboardListProps {
    defaultMode?: 'daily' | 'endless';
}
export const LeaderboardList: React.FC<LeaderboardListProps> = ({ defaultMode = 'endless' }) => {
    const [mode, setMode] = useState<'daily' | 'endless'>(defaultMode);
    const currentUser = useAuthStore(state => state.user);
    const navigate = useNavigate();
    const { data: leaderboard, isLoading, isError, isRefetching } = useQuery({
        queryKey: ['leaderboard', mode],
        queryFn: () => api.getLeaderboard(mode), // This now handles cache/restore logic internally
        refetchInterval: 30000, // Refresh every 30s
        staleTime: 0, // Consider data immediately stale to force checks
        refetchOnMount: true, // Always refetch when component mounts
    });
    const handleUserClick = (userId: string) => {
        navigate(`/player/${userId}`);
    };
    return (
        <div className="w-full h-full flex flex-col space-y-4 relative">
            {/* Mode Toggles */}
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 relative">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMode('endless')}
                    className={cn(
                        "flex-1 rounded-lg font-bold text-xs uppercase tracking-wider transition-all",
                        mode === 'endless' ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <InfinityIcon className="w-3 h-3 mr-1.5" />
                    Endless
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMode('daily')}
                    className={cn(
                        "flex-1 rounded-lg font-bold text-xs uppercase tracking-wider transition-all",
                        mode === 'daily' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Calendar className="w-3 h-3 mr-1.5" />
                    Daily
                </Button>
                {/* Refetching Indicator */}
                {isRefetching && !isLoading && (
                    <div className="absolute -top-2 -right-2 bg-slate-800 rounded-full p-1 border border-white/10 shadow-lg z-10">
                        <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                    </div>
                )}
            </div>
            {/* List */}
            <div className="flex-1 overflow-y-auto min-h-[200px] pr-1 custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                        <span className="text-xs font-bold uppercase tracking-wider">Loading Ranks...</span>
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center h-full text-red-400 space-y-2">
                        <Globe className="w-8 h-8 opacity-50" />
                        <span className="text-xs font-bold uppercase tracking-wider">Failed to load</span>
                    </div>
                ) : leaderboard && leaderboard.length > 0 ? (
                    <div className="space-y-2">
                        {leaderboard.map((entry, index) => {
                            const isMe = currentUser?.id === entry.userId;
                            return (
                                <div
                                    key={`${entry.userId}-${index}`}
                                    onClick={() => handleUserClick(entry.userId)}
                                    className={cn(
                                        "flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer group",
                                        isMe 
                                            ? "bg-indigo-500/30 border-indigo-400 shadow-[inset_0_0_15px_rgba(99,102,241,0.3)] ring-1 ring-indigo-400/50" 
                                            : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                                    )}
                                >
                                    {/* Rank */}
                                    <div className={cn(
                                        "w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm shrink-0",
                                        index === 0 ? "bg-gradient-to-br from-yellow-300 to-yellow-600 text-yellow-950 shadow-lg shadow-yellow-500/20" :
                                        index === 1 ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 shadow-lg shadow-slate-500/20" :
                                        index === 2 ? "bg-gradient-to-br from-orange-300 to-orange-500 text-orange-900 shadow-lg shadow-orange-500/20" :
                                        "bg-white/5 text-slate-500"
                                    )}>
                                        {index + 1}
                                    </div>
                                    {/* Avatar */}
                                    <UserAvatar avatarId={entry.avatar} size="sm" className="shrink-0 group-hover:scale-110 transition-transform" />
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <FlagIcon code={entry.country} className="w-5 h-4 shadow-sm rounded-[2px]" />
                                            <span className={cn("font-bold text-sm truncate group-hover:text-white transition-colors", isMe ? "text-white" : "text-slate-300")}>
                                                {entry.name} {isMe && <span className="text-[10px] text-indigo-300 ml-1">(You)</span>}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Score */}
                                    <div className="text-right shrink-0">
                                        <span className="font-black text-white text-lg tabular-nums block leading-none">
                                            {entry.score.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                        <Trophy className="w-8 h-8 opacity-30" />
                        <span className="text-xs font-bold uppercase tracking-wider">No scores yet</span>
                    </div>
                )}
            </div>
        </div>
    );
};