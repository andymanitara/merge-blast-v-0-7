export interface LeaderboardEntry {
    userId: string;
    name: string;
    avatar: string;
    country: string;
    score: number;
    date: string;
}
export interface UserProfile {
    id: string;
    name: string;
    avatar: string;
    country: string;
}
export interface PublicProfile {
    userId: string;
    name: string;
    avatar: string;
    country: string;
    stats: {
        totalGamesPlayed: number;
        totalMerges: number;
        highestChain: number;
        dangerMeter: number;
        bestScore: number;
        dailyBestScore: number;
    };
    achievements: string[];
    joinedAt: string;
}
export interface ExtraStats {
    totalGamesPlayed: number;
    totalMerges: number;
    highestChain: number;
    dangerMeter: number;
    unlockedAchievements: string[];
}
export const api = {
    getLeaderboard: async (mode: 'daily' | 'endless'): Promise<LeaderboardEntry[]> => {
        const cacheKey = `cached_leaderboard_${mode}`;
        try {
            // 1. Fetch from API
            const res = await fetch(`/api/leaderboard?mode=${mode}&t=${Date.now()}`, {
                cache: 'no-store',
                headers: {
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }
            });
            if (!res.ok) throw new Error('Failed to fetch leaderboard');
            const data = await res.json();
            const serverEntries = data.success ? data.data : [];
            // 2. Check for Server Reset (Empty list but we have cache)
            const cachedStr = localStorage.getItem(cacheKey);
            if (serverEntries.length === 0 && cachedStr) {
                const cachedEntries = JSON.parse(cachedStr) as LeaderboardEntry[];
                if (cachedEntries.length > 0) {
                    console.log('Server returned empty leaderboard. Attempting restoration from cache...');
                    // Trigger background restore (fire and forget)
                    api.restoreLeaderboard(mode, cachedEntries);
                    // Return cached data optimistically so user sees data immediately
                    return cachedEntries;
                }
            }
            // 3. Normal case: Update cache if we got data
            if (serverEntries.length > 0) {
                localStorage.setItem(cacheKey, JSON.stringify(serverEntries));
            }
            return serverEntries;
        } catch (error) {
            console.error('API Error:', error);
            // Fallback to cache on error
            const cachedStr = localStorage.getItem(cacheKey);
            if (cachedStr) {
                return JSON.parse(cachedStr);
            }
            return [];
        }
    },
    restoreLeaderboard: async (mode: 'daily' | 'endless', data: LeaderboardEntry[]): Promise<boolean> => {
        try {
            const res = await fetch('/api/leaderboard/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode,
                    data
                })
            });
            const result = await res.json();
            return result.success;
        } catch (e) {
            console.error('Restore failed', e);
            return false;
        }
    },
    getUserProfile: async (userId: string): Promise<PublicProfile | null> => {
        try {
            const res = await fetch(`/api/users/${userId}`);
            if (!res.ok) {
                if (res.status === 404) return null;
                throw new Error('Failed to fetch user profile');
            }
            const data = await res.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },
    updateUserProfile: async (userId: string, name: string, avatar: string, country: string): Promise<boolean> => {
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    avatar,
                    country
                })
            });
            const data = await res.json();
            return data.success;
        } catch (error) {
            console.error('API Error:', error);
            return false;
        }
    },
    submitScore: async (mode: 'daily' | 'endless', score: number, user: UserProfile, extraStats?: ExtraStats): Promise<boolean> => {
        try {
            const res = await fetch('/api/leaderboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode,
                    score,
                    user,
                    stats: extraStats
                })
            });
            const data = await res.json();
            if (data.success) {
                // Update local cache immediately to ensure persistence
                const cacheKey = `cached_leaderboard_${mode}`;
                const cachedStr = localStorage.getItem(cacheKey);
                let cachedEntries: LeaderboardEntry[] = cachedStr ? JSON.parse(cachedStr) : [];
                // Check if user already exists in cache
                const existingIndex = cachedEntries.findIndex(e => e.userId === user.id);
                const newEntry: LeaderboardEntry = {
                    userId: user.id,
                    name: user.name,
                    avatar: user.avatar,
                    country: user.country,
                    score: score,
                    date: new Date().toISOString()
                };
                if (existingIndex !== -1) {
                    if (score >= cachedEntries[existingIndex].score) {
                        cachedEntries[existingIndex] = newEntry;
                    }
                } else {
                    cachedEntries.push(newEntry);
                }
                // Sort and save
                cachedEntries.sort((a, b) => b.score - a.score);
                if (cachedEntries.length > 50) cachedEntries.length = 50;
                localStorage.setItem(cacheKey, JSON.stringify(cachedEntries));
            }
            return data.success;
        } catch (error) {
            console.error('API Error:', error);
            return false;
        }
    }
};