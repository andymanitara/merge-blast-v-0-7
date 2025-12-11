import { Hono } from "hono";
import { Env } from './core-utils';
interface LeaderboardEntry {
    userId: string;
    name: string;
    avatar: string;
    country: string;
    score: number;
    date: string;
}
interface UserProfileData {
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
// In-memory storage for MVP (resets on worker restart)
const LEADERBOARD: {
    daily: LeaderboardEntry[];
    endless: LeaderboardEntry[];
} = {
    daily: [],
    endless: []
};
const PROFILES = new Map<string, UserProfileData>();
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Existing test route
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'this works' }}));
    // Guest Auth Route
    app.post('/api/auth/guest', async (c) => {
        const userId = crypto.randomUUID();
        // Simple mock token generation (in a real app, sign a JWT)
        const token = `guest_${userId}_${Date.now()}`;
        return c.json({
            success: true,
            user: {
                id: userId,
                name: 'Guest',
                token: token
            }
        });
    });
    // Get Leaderboard
    app.get('/api/leaderboard', (c) => {
        const mode = c.req.query('mode') as 'daily' | 'endless' || 'endless';
        // Safety check: Ensure the list exists
        if (!LEADERBOARD[mode]) {
            LEADERBOARD[mode] = [];
        }
        const list = LEADERBOARD[mode];
        return c.json({
            success: true,
            data: list
        });
    });
    // Restore Leaderboard (Client-Side Hydration / Gossip Protocol)
    app.post('/api/leaderboard/restore', async (c) => {
        try {
            const body = await c.req.json<{
                mode: 'daily' | 'endless';
                data: LeaderboardEntry[];
            }>();
            const { mode, data } = body;
            if (!mode || !data || !Array.isArray(data)) {
                return c.json({ success: false, error: 'Invalid data' }, 400);
            }
            if (!LEADERBOARD[mode]) {
                LEADERBOARD[mode] = [];
            }
            const currentList = LEADERBOARD[mode];
            // Merge logic:
            // 1. Create a map of existing entries by userId
            const entryMap = new Map<string, LeaderboardEntry>();
            currentList.forEach(e => entryMap.set(e.userId, e));
            // 2. Merge restored data
            // We only update if the restored entry has a higher score or doesn't exist.
            data.forEach(restoredEntry => {
                const existing = entryMap.get(restoredEntry.userId);
                if (!existing) {
                    entryMap.set(restoredEntry.userId, restoredEntry);
                } else {
                    if (restoredEntry.score > existing.score) {
                        entryMap.set(restoredEntry.userId, restoredEntry);
                    }
                }
                // OPTIONAL: Ensure profile exists (Basic hydration to prevent 404s)
                // If the worker restarted, PROFILES is empty. We can at least restore basic info.
                if (!PROFILES.has(restoredEntry.userId)) {
                     PROFILES.set(restoredEntry.userId, {
                        userId: restoredEntry.userId,
                        name: restoredEntry.name,
                        avatar: restoredEntry.avatar,
                        country: restoredEntry.country,
                        stats: { 
                            totalGamesPlayed: 0, 
                            totalMerges: 0, 
                            highestChain: 0, 
                            dangerMeter: 0, 
                            bestScore: restoredEntry.score, 
                            dailyBestScore: 0 
                        },
                        achievements: [],
                        joinedAt: new Date().toISOString()
                     });
                }
            });
            // 3. Convert back to array
            const mergedList = Array.from(entryMap.values());
            // 4. Sort and Slice
            mergedList.sort((a, b) => b.score - a.score);
            // Increased limit to 100 to prevent aggressive truncation
            if (mergedList.length > 100) {
                mergedList.length = 100;
            }
            LEADERBOARD[mode] = mergedList;
            return c.json({ success: true, count: mergedList.length });
        } catch (e) {
            console.error('Leaderboard restore error:', e);
            return c.json({ success: false, error: 'Server error' }, 500);
        }
    });
    // Get User Profile
    app.get('/api/users/:userId', (c) => {
        const userId = c.req.param('userId');
        const profile = PROFILES.get(userId);
        if (!profile) {
            return c.json({ success: false, error: 'User not found' }, 404);
        }
        return c.json({
            success: true,
            data: profile
        });
    });
    // Update User Profile & Sync Leaderboards
    app.put('/api/users/:userId', async (c) => {
        try {
            const userId = c.req.param('userId');
            const body = await c.req.json<{
                name: string;
                avatar: string;
                country: string;
            }>();
            const { name, avatar, country } = body;
            if (!name) {
                return c.json({ success: false, error: 'Name is required' }, 400);
            }
            // 1. Update Profile
            const existingProfile = PROFILES.get(userId);
            if (existingProfile) {
                PROFILES.set(userId, {
                    ...existingProfile,
                    name,
                    avatar,
                    country
                });
            } else {
                // Create new if doesn't exist
                PROFILES.set(userId, {
                    userId,
                    name,
                    avatar,
                    country,
                    stats: {
                        totalGamesPlayed: 0,
                        totalMerges: 0,
                        highestChain: 0,
                        dangerMeter: 0,
                        bestScore: 0,
                        dailyBestScore: 0
                    },
                    achievements: [],
                    joinedAt: new Date().toISOString()
                });
            }
            // 2. Sync Leaderboards
            // Iterate through all game modes and update entries for this user
            const modes: ('daily' | 'endless')[] = ['daily', 'endless'];
            modes.forEach(mode => {
                if (LEADERBOARD[mode]) {
                    LEADERBOARD[mode].forEach(entry => {
                        if (entry.userId === userId) {
                            entry.name = name;
                            entry.avatar = avatar;
                            entry.country = country;
                        }
                    });
                }
            });
            return c.json({ success: true });
        } catch (e) {
            console.error('Profile update error:', e);
            return c.json({ success: false, error: 'Server error' }, 500);
        }
    });
    // Submit Score & Update Profile
    app.post('/api/leaderboard', async (c) => {
        try {
            const body = await c.req.json<{
                mode: 'daily' | 'endless';
                score: number;
                user: {
                    id: string;
                    name: string;
                    avatar: string;
                    country: string;
                };
                stats?: {
                    totalGamesPlayed: number;
                    totalMerges: number;
                    highestChain: number;
                    dangerMeter: number;
                    unlockedAchievements: string[];
                }
            }>();
            const { mode, score, user, stats } = body;
            if (!user || typeof score !== 'number') {
                return c.json({ success: false, error: 'Invalid data' }, 400);
            }
            // 1. Update Leaderboard
            // Safety check: Ensure the list exists
            if (!LEADERBOARD[mode]) {
                LEADERBOARD[mode] = [];
            }
            const list = LEADERBOARD[mode];
            const existingIndex = list.findIndex(e => e.userId === user.id);
            if (existingIndex !== -1) {
                // Update if new score is higher OR EQUAL (to update timestamp/activity)
                if (score >= list[existingIndex].score) {
                    list[existingIndex] = {
                        userId: user.id,
                        name: user.name,
                        avatar: user.avatar,
                        country: user.country,
                        score: score,
                        date: new Date().toISOString()
                    };
                }
            } else {
                // Add new entry
                list.push({
                    userId: user.id,
                    name: user.name,
                    avatar: user.avatar,
                    country: user.country,
                    score: score,
                    date: new Date().toISOString()
                });
            }
            // Sort descending
            list.sort((a, b) => b.score - a.score);
            // Keep top 100 (Increased from 50)
            if (list.length > 100) {
                list.length = 100;
            }
            // 2. Update User Profile
            const existingProfile = PROFILES.get(user.id);
            // Determine best scores
            let bestScore = existingProfile?.stats.bestScore || 0;
            let dailyBestScore = existingProfile?.stats.dailyBestScore || 0;
            if (mode === 'endless' && score > bestScore) bestScore = score;
            if (mode === 'daily' && score > dailyBestScore) dailyBestScore = score;
            // Merge stats if provided, otherwise keep existing or default
            const updatedStats = {
                totalGamesPlayed: stats?.totalGamesPlayed ?? existingProfile?.stats.totalGamesPlayed ?? 0,
                totalMerges: stats?.totalMerges ?? existingProfile?.stats.totalMerges ?? 0,
                highestChain: Math.max(stats?.highestChain ?? 0, existingProfile?.stats.highestChain ?? 0),
                dangerMeter: Math.max(stats?.dangerMeter ?? 0, existingProfile?.stats.dangerMeter ?? 0),
                bestScore,
                dailyBestScore
            };
            // Merge achievements
            const existingAchievements = new Set(existingProfile?.achievements || []);
            if (stats?.unlockedAchievements) {
                stats.unlockedAchievements.forEach(a => existingAchievements.add(a));
            }
            PROFILES.set(user.id, {
                userId: user.id,
                name: user.name,
                avatar: user.avatar,
                country: user.country,
                stats: updatedStats,
                achievements: Array.from(existingAchievements),
                joinedAt: existingProfile?.joinedAt || new Date().toISOString()
            });
            return c.json({ success: true });
        } catch (e) {
            console.error('Leaderboard submit error:', e);
            return c.json({ success: false, error: 'Server error' }, 500);
        }
    });
}