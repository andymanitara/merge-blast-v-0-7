import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';
import { Toaster } from '@/components/ui/sonner';
export const RootLayout: React.FC = () => {
    return (
        <div className="relative w-full min-h-[100dvh] bg-slate-900 overflow-hidden">
            {/* Persistent Background Layer */}
            <AnimatedBackground />
            {/* Page Content Layer */}
            <div className="relative z-10 w-full h-full">
                <Outlet />
            </div>
            <Toaster position="top-center" theme="dark" richColors />
        </div>
    );
};