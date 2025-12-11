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
        let cachedEntries: LeaderboardEntry[] = [];
        // 1. Load Local Cache safely
        try {
            const cachedStr = localStorage.getItem(cacheKey);
            if (cachedStr) {
                cachedEntries = JSON.parse(cachedStr);
            }
        } catch (e) {
            console.error('Failed to parse cached leaderboard', e);
        }
        try {
            // 2. Fetch from Server
            const res = await fetch(`/api/leaderboard?mode=${mode}&t=${Date.now()}`, {
                cache: 'no-store',
                headers: {
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }
            });
            if (!res.ok) throw new Error('Failed to fetch leaderboard');
            const data = await res.json();
            const serverEntries: LeaderboardEntry[] = data.success ? data.data : [];
            // 3. Merge Strategy: Union of Server + Cache
            // We trust the Cache for persistence (in case server wiped)
            // We trust the Server for updates (other players)
            const mergedMap = new Map<string, LeaderboardEntry>();
            // Start with cache
            cachedEntries.forEach(entry => mergedMap.set(entry.userId, entry));
            // Merge server data
            // If server has an entry, we take it if it's better or equal (to get latest metadata)
            // If server is missing an entry we have, we keep ours (restoration)
            serverEntries.forEach(entry => {
                const existing = mergedMap.get(entry.userId);
                if (!existing || entry.score >= existing.score) {
                    mergedMap.set(entry.userId, entry);
                }
            });
            const mergedList = Array.from(mergedMap.values());
            mergedList.sort((a, b) => b.score - a.score);
            // Keep top 100 locally
            if (mergedList.length > 100) mergedList.length = 100;
            // 4. Gossip / Restore Protocol
            // If our merged list is "better" than what the server gave us,
            // the server might have lost data (restart). We push our data back.
            const serverTopScore = serverEntries.length > 0 ? serverEntries[0].score : 0;
            const mergedTopScore = mergedList.length > 0 ? mergedList[0].score : 0;
            const isMissingData = mergedList.length > serverEntries.length;
            const isScoreMismatch = mergedTopScore > serverTopScore;
            if ((isMissingData || isScoreMismatch) && mergedList.length > 0) {
                console.log(`[Leaderboard] Client has better data (Server: ${serverEntries.length}, Merged: ${mergedList.length}). Syncing...`);
                // Fire and forget - don't await to keep UI snappy
                api.restoreLeaderboard(mode, mergedList);
            }
            // 5. Update Local Cache with the merged truth
            localStorage.setItem(cacheKey, JSON.stringify(mergedList));
            return mergedList;
        } catch (error) {
            console.error('API Error:', error);
            // Fallback to cache on error
            return cachedEntries;
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
            // 1. Submit to Server
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
                // 2. Update Local Cache Immediately
                // This ensures that even if the server wipes before we fetch again,
                // we have this new score recorded locally to restore it later.
                try {
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
                    if (cachedEntries.length > 100) cachedEntries.length = 100;
                    localStorage.setItem(cacheKey, JSON.stringify(cachedEntries));
                } catch (cacheError) {
                    console.warn('Local cache update failed', cacheError);
                    // Do not fail the whole operation if local cache fails (e.g. quota exceeded)
                }
            }
            return data.success;
        } catch (error) {
            console.error('API Error:', error);
            return false;
        }
    }
};