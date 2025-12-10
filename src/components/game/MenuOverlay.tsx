import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { X, Play, Volume2, VolumeX, BookOpen, LogOut, User, Smartphone, Monitor, Vibrate, Settings, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoutAlertDialog } from '@/components/auth/LogoutAlertDialog';
import { UserAvatar } from '@/components/ui/UserAvatar';
export const MenuOverlay: React.FC = () => {
    const isMenuOpen = useGameStore(state => state.isMenuOpen);
    const closeMenu = useGameStore(state => state.closeMenu);
    const isSoundEnabled = useGameStore(state => state.isSoundEnabled);
    const toggleSound = useGameStore(state => state.toggleSound);
    const openHowToPlay = useGameStore(state => state.openHowToPlay);
    const resetAllStats = useGameStore(state => state.resetAllStats);
    const graphicsQuality = useGameStore(state => state.graphicsQuality);
    const setGraphicsQuality = useGameStore(state => state.setGraphicsQuality);
    const hapticsEnabled = useGameStore(state => state.hapticsEnabled);
    const toggleHaptics = useGameStore(state => state.toggleHaptics);
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const navigate = useNavigate();
    const handleExit = () => {
        closeMenu();
        navigate('/');
    };
    const handleHowToPlay = () => {
        closeMenu();
        openHowToPlay();
    };
    const handleLogout = () => {
        closeMenu();
        resetAllStats();
        logout();
        navigate('/login');
    };
    const handleEditProfile = () => {
        closeMenu();
        navigate('/profile');
    };
    return (
        <AnimatePresence>
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-md"
                >
                    <div className="flex items-center justify-end p-4">
                        <Button variant="ghost" size="icon" onClick={closeMenu} className="rounded-full hover:bg-white/10 text-white">
                            <X className="w-8 h-8" />
                        </Button>
                    </div>
                    {/* Added 'allow-touch-scroll' class to enable scrolling on mobile */}
                    <div className="flex-1 flex flex-col items-center justify-start p-6 space-y-8 max-w-md mx-auto w-full overflow-y-auto custom-scrollbar allow-touch-scroll">
                        <h2 className="text-5xl font-display font-black text-white text-glow">Menu</h2>
                        {/* Profile Summary */}
                        <div className="w-full glass-panel p-4 rounded-3xl flex items-center gap-4 border border-white/10">
                            <UserAvatar avatarId={user?.avatar} size="md" />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Playing as</p>
                                <p className="text-xl font-bold text-white truncate">{user?.name || 'Guest'}</p>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleEditProfile}
                                className="rounded-xl hover:bg-white/10 text-indigo-300"
                                title="Edit Profile"
                            >
                                <User className="w-5 h-5" />
                            </Button>
                        </div>
                        {/* Preferences */}
                        <div className="w-full space-y-4">
                            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-sm">
                                <Settings className="w-4 h-4" />
                                <span>Preferences</span>
                            </div>
                            <div className="space-y-3">
                                {/* Graphics Quality */}
                                <div className="grid grid-cols-2 gap-3 p-1 bg-white/5 rounded-2xl border border-white/10">
                                    <button
                                        onClick={() => setGraphicsQuality('high')}
                                        className={cn(
                                            "flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-200 border",
                                            graphicsQuality === 'high'
                                                ? "bg-white/10 border-purple-500 shadow-lg text-white"
                                                : "bg-transparent border-transparent hover:bg-white/5 text-slate-400"
                                        )}
                                    >
                                        <Monitor className={cn("w-6 h-6 mb-1", graphicsQuality === 'high' ? "text-purple-400" : "text-current")} />
                                        <span className="font-bold text-xs">High Quality</span>
                                    </button>
                                    <button
                                        onClick={() => setGraphicsQuality('performance')}
                                        className={cn(
                                            "flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-200 border",
                                            graphicsQuality === 'performance'
                                                ? "bg-white/10 border-blue-500 shadow-lg text-white"
                                                : "bg-transparent border-transparent hover:bg-white/5 text-slate-400"
                                        )}
                                    >
                                        <Smartphone className={cn("w-6 h-6 mb-1", graphicsQuality === 'performance' ? "text-blue-400" : "text-current")} />
                                        <span className="font-bold text-xs">Performance</span>
                                    </button>
                                </div>
                                {/* Haptics Toggle */}
                                <Button
                                    onClick={toggleHaptics}
                                    variant="outline"
                                    className="w-full justify-between h-14 rounded-2xl glass-panel hover:bg-white/10 text-white font-bold text-lg border-white/20"
                                >
                                    <span className="flex items-center gap-2">
                                        <Vibrate className="w-5 h-5" />
                                        Haptics
                                    </span>
                                    <span className={cn("px-3 py-1 rounded-lg text-xs uppercase", hapticsEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400")}>
                                        {hapticsEnabled ? "On" : "Off"}
                                    </span>
                                </Button>
                                {/* Sound Toggle */}
                                <Button
                                    onClick={toggleSound}
                                    variant="outline"
                                    className="w-full justify-between h-14 rounded-2xl glass-panel hover:bg-white/10 text-white font-bold text-lg border-white/20"
                                >
                                    <span className="flex items-center gap-2">
                                        {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                                        Sound Effects
                                    </span>
                                    <span className={cn("px-3 py-1 rounded-lg text-xs uppercase", isSoundEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400")}>
                                        {isSoundEnabled ? "On" : "Off"}
                                    </span>
                                </Button>
                            </div>
                        </div>
                        {/* Help */}
                        <div className="w-full space-y-4">
                            <Button
                                onClick={handleHowToPlay}
                                variant="outline"
                                className="w-full justify-between h-14 rounded-2xl glass-panel hover:bg-white/10 text-white font-bold text-lg border-white/20"
                            >
                                <span className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    How to Play
                                </span>
                            </Button>
                        </div>
                        <div className="w-full mt-auto space-y-4 pb-8">
                            <Button
                                onClick={closeMenu}
                                className="w-full py-8 text-2xl font-bold rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 transition-all"
                            >
                                <Play className="w-8 h-8 mr-3 fill-current" />
                                Resume
                            </Button>
                            <Button
                                onClick={handleExit}
                                variant="ghost"
                                className="w-full py-4 text-lg font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl"
                            >
                                <Home className="w-5 h-5 mr-2" />
                                Exit to Home
                            </Button>
                            <LogoutAlertDialog onConfirm={handleLogout}>
                                <Button
                                    variant="ghost"
                                    className="w-full py-4 text-lg font-bold text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-2xl"
                                >
                                    <LogOut className="w-5 h-5 mr-2" />
                                    Change User / Reset
                                </Button>
                            </LogoutAlertDialog>
                            {/* Footer */}
                            <div className="pt-4 text-center space-y-1">
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Merge Burst v1.0</p>
                                <p className="text-[10px] text-slate-700 font-medium">Made with ❤️ by Aurelia</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};