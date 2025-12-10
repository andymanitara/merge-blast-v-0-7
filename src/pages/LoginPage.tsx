import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Loader2, User } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { cn } from '@/lib/utils';
import { FloatingShapesBackground } from '@/components/layout/FloatingShapesBackground';
export function LoginPage() {
    const navigate = useNavigate();
    const loginAsGuest = useAuthStore(state => state.loginAsGuest);
    const isLoading = useAuthStore(state => state.isLoading);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);
    const handleLogin = async () => {
        await loginAsGuest();
    };
    return (
        <AppLayout container className="bg-transparent min-h-[100dvh] font-sans overflow-hidden relative flex items-center justify-center">
            {/* Animated Background Shapes */}
            <FloatingShapesBackground />
            <div className="relative z-10 flex flex-col items-center justify-center space-y-12 text-center max-w-md w-full px-4">
                {/* Title Section */}
                <div className="space-y-4">
                    <motion.h1
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-6xl md:text-8xl font-display font-black text-white tracking-tighter drop-shadow-2xl"
                    >
                        Merge<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 text-glow">Burst</span>
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl font-medium text-slate-300"
                    >
                        Infinite Puzzle Fun
                    </motion.p>
                </div>
                {/* Login Action */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="w-full"
                >
                    <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl shadow-indigo-500/20 space-y-6 backdrop-blur-xl">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">Welcome!</h2>
                            <p className="text-slate-400">Sign in to save your progress and high scores.</p>
                        </div>
                        <Button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className={cn(
                                "w-full h-16 text-xl font-bold rounded-2xl text-white transition-all shadow-xl relative overflow-hidden",
                                "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500",
                                "border border-white/20 shadow-indigo-500/30",
                                isLoading && "opacity-80 cursor-not-allowed"
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            ) : (
                                <User className="w-6 h-6 mr-2" />
                            )}
                            {isLoading ? "Signing in..." : "Continue as Guest"}
                        </Button>
                        <p className="text-xs text-slate-500 mt-4">
                            By continuing, you agree to play responsibly. <br/>
                            Guest accounts are stored locally on this device.
                        </p>
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}