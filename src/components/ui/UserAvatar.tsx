import React from 'react';
import { cn } from '@/lib/utils';
import { 
    User, Bot, Zap, Crown, Ghost, 
    Rocket, Gamepad2, Smile, Star, Heart 
} from 'lucide-react';
interface UserAvatarProps {
    avatarId?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}
export const UserAvatar: React.FC<UserAvatarProps> = ({ 
    avatarId = 'user', 
    className,
    size = 'md'
}) => {
    // Map IDs to Lucide Icons
    const getIcon = () => {
        switch (avatarId) {
            case 'bot': return Bot;
            case 'zap': return Zap;
            case 'crown': return Crown;
            case 'ghost': return Ghost;
            case 'rocket': return Rocket;
            case 'gamepad': return Gamepad2;
            case 'smile': return Smile;
            case 'star': return Star;
            case 'heart': return Heart;
            case 'user':
            default: return User;
        }
    };
    const Icon = getIcon();
    // Size classes
    const sizeClasses = {
        sm: 'w-8 h-8 p-1.5',
        md: 'w-12 h-12 p-2.5',
        lg: 'w-16 h-16 p-3',
        xl: 'w-24 h-24 p-5'
    };
    // Color mapping for avatars (Vibrant Arcade Theme)
    const colorClasses: Record<string, string> = {
        user: 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/40',
        bot: 'bg-gradient-to-br from-slate-500 to-slate-700 shadow-slate-500/40',
        zap: 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-orange-500/40',
        crown: 'bg-gradient-to-br from-amber-300 to-yellow-500 shadow-yellow-500/40',
        ghost: 'bg-gradient-to-br from-purple-400 to-indigo-500 shadow-purple-500/40',
        rocket: 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/40',
        gamepad: 'bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/40',
        smile: 'bg-gradient-to-br from-pink-400 to-rose-500 shadow-pink-500/40',
        star: 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-cyan-500/40',
        heart: 'bg-gradient-to-br from-rose-400 to-red-600 shadow-rose-500/40',
    };
    const bgClass = colorClasses[avatarId] || colorClasses['user'];
    return (
        <div className={cn(
            "rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white/20 relative overflow-hidden",
            sizeClasses[size],
            bgClass,
            className
        )}>
            {/* Glossy Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
            <Icon className="w-full h-full fill-current relative z-10" />
        </div>
    );
};