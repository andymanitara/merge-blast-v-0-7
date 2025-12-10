import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { ACHIEVEMENTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Trophy, Zap, Shield, Skull, Crown, Flame, Merge } from 'lucide-react';
// Map icons
const getIcon = (name: string) => {
    switch(name) {
        case 'merge': return Merge;
        case 'merge_double': return Merge;
        case 'trophy': return Trophy;
        case 'crown': return Crown;
        case 'zap': return Zap;
        case 'flame': return Flame;
        case 'shield': return Shield;
        case 'skull': return Skull;
        default: return Trophy;
    }
}
interface AchievementListProps {
    unlocked?: string[];
    stats?: {
        score: number;
        bestScore: number;
        totalMerges: number;
        totalGamesPlayed: number;
        highestChain: number;
        dangerMeter: number;
    };
}
export const AchievementList: React.FC<AchievementListProps> = ({ unlocked: propUnlocked, stats: propStats }) => {
    // If props are provided (Public Profile mode), use them.
    // Otherwise, use store selectors (Current User mode).
    // Store selectors (only used if props are missing)
    const storeUnlocked = useGameStore(state => state.unlockedAchievements);
    const storeScore = useGameStore(state => state.score);
    const storeBestScore = useGameStore(state => state.bestScore);
    const storeTotalMerges = useGameStore(state => state.totalMerges);
    const storeTotalGamesPlayed = useGameStore(state => state.totalGamesPlayed);
    const storeHighestChain = useGameStore(state => state.highestChain);
    const storeDangerMeter = useGameStore(state => state.dangerMeter);
    // Determine which data source to use
    const unlocked = propUnlocked ?? storeUnlocked;
    const stats = propStats ?? {
        score: storeScore,
        bestScore: storeBestScore,
        totalMerges: storeTotalMerges,
        totalGamesPlayed: storeTotalGamesPlayed,
        highestChain: storeHighestChain,
        dangerMeter: storeDangerMeter
    };
    const getProgress = (ach: typeof ACHIEVEMENTS[0]) => {
        if (unlocked.includes(ach.id)) return 100;
        let current = 0;
        switch (ach.type) {
            case 'score': current = stats.bestScore; break; // Use best score for progress display
            case 'merge': current = stats.totalMerges; break;
            case 'chain': current = stats.highestChain; break;
            case 'games': current = stats.totalGamesPlayed; break;
            case 'danger': current = stats.dangerMeter; break;
        }
        return Math.min(100, Math.floor((current / ach.threshold) * 100));
    };
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACHIEVEMENTS.map(ach => {
                const isUnlocked = unlocked.includes(ach.id);
                const Icon = getIcon(ach.icon);
                const progress = getProgress(ach);
                return (
                    <div key={ach.id} className={cn(
                        "relative p-4 rounded-2xl border flex items-center gap-4 overflow-hidden transition-all",
                        isUnlocked 
                            ? "bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500/50 shadow-lg shadow-indigo-500/10" 
                            : "bg-white/5 border-white/10 opacity-70 grayscale"
                    )}>
                        {/* Icon */}
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                            isUnlocked ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/40" : "bg-white/10 text-slate-500"
                        )}>
                            <Icon className="w-6 h-6" />
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h4 className={cn("font-bold truncate", isUnlocked ? "text-white" : "text-slate-400")}>
                                {ach.title}
                            </h4>
                            <p className="text-xs text-slate-400 truncate">{ach.description}</p>
                            {/* Progress Bar */}
                            <div className="mt-2 h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                <div 
                                    className={cn("h-full rounded-full transition-all duration-500", isUnlocked ? "bg-emerald-400" : "bg-indigo-500/50")}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                        {/* Shine effect for unlocked */}
                        {isUnlocked && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 pointer-events-none" />
                        )}
                    </div>
                );
            })}
        </div>
    );
};