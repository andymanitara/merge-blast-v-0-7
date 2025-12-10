import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { FlagIcon } from '@/components/ui/FlagIcon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVATAR_IDS, COUNTRIES } from '@/lib/constants';
import { ArrowLeft, Save, User, Trophy, BarChart3, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AchievementList } from '@/components/game/AchievementList';
import { api } from '@/lib/api';
export function ProfilePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = useAuthStore(state => state.user);
    const updateProfile = useAuthStore(state => state.updateProfile);
    // Game Stats
    const totalGamesPlayed = useGameStore(state => state.totalGamesPlayed);
    const totalMerges = useGameStore(state => state.totalMerges);
    const bestScore = useGameStore(state => state.bestScore);
    const highestChain = useGameStore(state => state.highestChain);
    const [name, setName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('user');
    const [selectedCountry, setSelectedCountry] = useState('GLOBAL');
    const [isSaving, setIsSaving] = useState(false);
    useEffect(() => {
        if (user) {
            setName(user.name);
            setSelectedAvatar(user.avatar || 'user');
            setSelectedCountry(user.country || 'GLOBAL');
        }
    }, [user]);
    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Please enter a display name");
            return;
        }
        setIsSaving(true);
        try {
            // 1. Update local store (Optimistic update)
            updateProfile(name.trim(), selectedAvatar, selectedCountry);
            // 2. Sync with backend if user has an ID
            if (user?.id) {
                const success = await api.updateUserProfile(user.id, name.trim(), selectedAvatar, selectedCountry);
                if (success) {
                    // Invalidate queries to ensure leaderboards and public profiles reflect changes
                    await queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
                    await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
                    toast.success("Profile updated successfully!");
                } else {
                    toast.warning("Profile saved locally, but sync failed.");
                }
            } else {
                toast.success("Profile updated locally!");
            }
            navigate(-1); // Go back
        } catch (error) {
            console.error("Failed to save profile:", error);
            toast.error("An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };
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
                        disabled={isSaving}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-3xl font-display font-black text-white text-glow">Edit Profile</h1>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>
                {/* Main Card */}
                <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl shadow-indigo-500/20 space-y-8 backdrop-blur-xl">
                    {/* Avatar Selection */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block text-center">
                            Choose Avatar
                        </label>
                        <div className="flex justify-center mb-6">
                            <motion.div
                                key={selectedAvatar}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full" />
                                <UserAvatar avatarId={selectedAvatar} size="xl" className="relative z-10" />
                            </motion.div>
                        </div>
                        <div className="grid grid-cols-5 gap-3">
                            {AVATAR_IDS.map((id) => (
                                <button
                                    key={id}
                                    onClick={() => setSelectedAvatar(id)}
                                    disabled={isSaving}
                                    className={cn(
                                        "relative rounded-xl p-1 transition-all duration-200",
                                        selectedAvatar === id
                                            ? "bg-white/20 scale-110 ring-2 ring-indigo-400 shadow-lg"
                                            : "hover:bg-white/10 hover:scale-105",
                                        isSaving && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <UserAvatar avatarId={id} size="sm" className="w-full h-full" />
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Name Input */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block">
                            Display Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="pl-12 h-14 bg-black/20 border-white/10 text-white placeholder:text-slate-500 rounded-2xl focus:ring-indigo-500 focus:border-indigo-500 text-lg font-bold"
                                maxLength={15}
                                disabled={isSaving}
                            />
                        </div>
                        <p className="text-xs text-slate-500 text-right">
                            {name.length}/15 characters
                        </p>
                    </div>
                    {/* Country Selection */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block">
                            Country / Region
                        </label>
                        <Select value={selectedCountry} onValueChange={setSelectedCountry} disabled={isSaving}>
                            <SelectTrigger className="w-full h-14 bg-black/20 border-white/10 text-white rounded-2xl focus:ring-indigo-500 focus:border-indigo-500 text-lg font-bold pl-4">
                                <SelectValue placeholder="Select Country" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white max-h-[300px]">
                                {COUNTRIES.map((country) => (
                                    <SelectItem
                                        key={country.code}
                                        value={country.code}
                                        className="focus:bg-white/10 focus:text-white cursor-pointer py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FlagIcon code={country.code} className="w-6 h-4 rounded-[2px] shadow-sm" />
                                            <span>{country.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Save Button */}
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 transition-all"
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5 mr-2" />
                        )}
                        {isSaving ? "Saving..." : "Save Profile"}
                    </Button>
                </div>
                {/* Statistics Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-sm px-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>Career Stats</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-panel p-4 rounded-2xl flex flex-col items-center text-center border border-white/10 shadow-lg">
                            <p className="text-2xl font-black text-white">{totalGamesPlayed}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Games</p>
                        </div>
                        <div className="glass-panel p-4 rounded-2xl flex flex-col items-center text-center border border-white/10 shadow-lg">
                            <p className="text-2xl font-black text-emerald-400">{totalMerges}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Merges</p>
                        </div>
                        <div className="glass-panel p-4 rounded-2xl flex flex-col items-center text-center border border-white/10 shadow-lg">
                            <p className="text-2xl font-black text-indigo-400">{bestScore}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Best Score</p>
                        </div>
                        <div className="glass-panel p-4 rounded-2xl flex flex-col items-center text-center border border-white/10 shadow-lg">
                            <p className="text-2xl font-black text-orange-400">{highestChain}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Chain</p>
                        </div>
                    </div>
                </div>
                {/* Achievements Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-sm px-2">
                        <Trophy className="w-4 h-4" />
                        <span>Trophy Case</span>
                    </div>
                    <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl">
                        <AchievementList />
                    </div>
                </div>
            </motion.div>
        </AppLayout>
    );
}