import type { AchievementDef } from '@/types/game';
export const GRID_SIZE = 6;
export const INITIAL_NEXT_SHAPES_COUNT = 3;
export const MAX_DANGER = 100;
export const LOCK_SPAWN_RATE_BASE = 7; // Turns before a lock spawns (decreases with danger)
// Danger Ramp Constants - Aggressive Arcade Tuning
export const DANGER_RAMP = {
    NO_MERGE: 3,        // Increased from 2
    FRAGILE_FAIL: 20,   // Increased from 15
    CHAIN_REDUCTION: 5, // Increased from 2 to reward combos more
};
// Fragile Spawn Chances based on Danger Level (0-100)
export const FRAGILE_CHANCE = {
    EARLY: 0.10, // 0-30 Danger
    MID: 0.25,   // 30-70 Danger
    LATE: 0.40,  // 70+ Danger
};
// Pulse Requirements
export const PULSE_REQUIREMENTS = {
    CHAIN: 6,
    // Tier requirement removed
};
export const POWER_BURSTS = ['blast', 'purify', 'calm'] as const;
export const COMBO_SCORING = {
    BASE: 10,
    MULTIPLIER: 1.5,
};
export enum ShapeType {
    Square = 'square',
    Triangle = 'triangle',
    Circle = 'circle',
    Star = 'star',
    Diamond = 'diamond',
    // Special
    Locked = 'locked',
}
export const SHAPE_TYPES = [
    ShapeType.Square,
    ShapeType.Triangle,
    ShapeType.Circle,
    ShapeType.Star,
    ShapeType.Diamond,
];
// New Vibrant Color System (Gradients)
export const SHAPE_TYPE_COLORS: Record<ShapeType, string> = {
    [ShapeType.Square]: 'bg-gradient-to-br from-rose-400 to-rose-600',
    [ShapeType.Triangle]: 'bg-gradient-to-br from-sky-400 to-sky-600',
    [ShapeType.Circle]: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    [ShapeType.Star]: 'bg-gradient-to-br from-amber-300 to-amber-500',
    [ShapeType.Diamond]: 'bg-gradient-to-br from-violet-400 to-violet-600',
    // Special
    [ShapeType.Locked]: 'bg-gradient-to-br from-slate-700 to-slate-900',
};
// Glow/Shadow Colors for "Gem" effect
export const SHAPE_SHADOW_COLORS: Record<ShapeType, string> = {
    [ShapeType.Square]: 'shadow-rose-500/50',
    [ShapeType.Triangle]: 'shadow-sky-500/50',
    [ShapeType.Circle]: 'shadow-emerald-500/50',
    [ShapeType.Star]: 'shadow-amber-500/50',
    [ShapeType.Diamond]: 'shadow-violet-500/50',
    [ShapeType.Locked]: 'shadow-black/50',
};
export interface ShapeDefinition {
    type: ShapeType;
    offsets: { r: number; c: number }[];
    isJunk?: boolean; // Kept for type compatibility but unused
}
// Multi-tile configurations
// Offsets are relative to the "anchor" (0,0)
export const MULTI_TILE_SHAPES: ShapeDefinition[] = [
    // 1-Tile Shapes (Standard)
    { type: ShapeType.Square, offsets: [{ r: 0, c: 0 }] },
    { type: ShapeType.Triangle, offsets: [{ r: 0, c: 0 }] },
    { type: ShapeType.Circle, offsets: [{ r: 0, c: 0 }] },
    { type: ShapeType.Star, offsets: [{ r: 0, c: 0 }] },
    { type: ShapeType.Diamond, offsets: [{ r: 0, c: 0 }] },
    // 2-Tile Shapes (Vertical)
    { type: ShapeType.Square, offsets: [{ r: 0, c: 0 }, { r: 1, c: 0 }] },
    { type: ShapeType.Triangle, offsets: [{ r: 0, c: 0 }, { r: 1, c: 0 }] },
    // 2-Tile Shapes (Horizontal)
    { type: ShapeType.Circle, offsets: [{ r: 0, c: 0 }, { r: 0, c: 1 }] },
    { type: ShapeType.Star, offsets: [{ r: 0, c: 0 }, { r: 0, c: 1 }] },
];
// SVG Paths for shapes (viewBox 0 0 24 24)
export const SHAPE_PATHS: Record<ShapeType, string> = {
    [ShapeType.Square]: "M4 4h16v16H4z",
    [ShapeType.Triangle]: "M12 3l10 18H2z",
    [ShapeType.Circle]: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    [ShapeType.Star]: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    [ShapeType.Diamond]: "M12 2l10 10-10 10L2 12z",
    // Locked
    [ShapeType.Locked]: "M12 2a4 4 0 0 1 4 4v2h2.5A1.5 1.5 0 0 1 20 9.5v11.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 21V9.5A1.5 1.5 0 0 1 5.5 8H8V6a4 4 0 0 1 4-4zm0 11a2 2 0 1 0 0 4 2 2 0 0 0 0-4z", // Padlock
};
// Available Avatar IDs for Profile Customization
export const AVATAR_IDS = [
    'user', 'bot', 'zap', 'crown', 'ghost',
    'rocket', 'gamepad', 'smile', 'star', 'heart'
];
// Countries for Profile
export const COUNTRIES = [
    { code: 'GLOBAL', name: 'Global / Other', flag: '🌍' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
    { code: 'PL', name: 'Poland', flag: '🇵🇱' },
    { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
];
// Achievements List
export const ACHIEVEMENTS: AchievementDef[] = [
    {
        id: 'novice_merger',
        title: 'Novice Merger',
        description: 'Perform 100 total merges',
        icon: 'merge',
        type: 'merge',
        threshold: 100
    },
    {
        id: 'master_merger',
        title: 'Master Merger',
        description: 'Perform 1,000 total merges',
        icon: 'merge_double',
        type: 'merge',
        threshold: 1000
    },
    {
        id: 'high_scorer',
        title: 'High Scorer',
        description: 'Reach a score of 1,000 in a single game',
        icon: 'trophy',
        type: 'score',
        threshold: 1000
    },
    {
        id: 'score_legend',
        title: 'Score Legend',
        description: 'Reach a score of 5,000 in a single game',
        icon: 'crown',
        type: 'score',
        threshold: 5000
    },
    {
        id: 'chain_reaction',
        title: 'Chain Reaction',
        description: 'Trigger a chain reaction of 5 or more',
        icon: 'zap',
        type: 'chain',
        threshold: 5
    },
    {
        id: 'chain_master',
        title: 'Chain Master',
        description: 'Trigger a chain reaction of 10 or more',
        icon: 'flame',
        type: 'chain',
        threshold: 10
    },
    {
        id: 'survivor',
        title: 'Survivor',
        description: 'Play 50 games',
        icon: 'shield',
        type: 'games',
        threshold: 50
    },
    {
        id: 'danger_zone',
        title: 'Living on the Edge',
        description: 'Reach 90% Danger Level',
        icon: 'skull',
        type: 'danger',
        threshold: 90
    }
];