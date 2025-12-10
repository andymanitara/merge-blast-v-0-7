import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
interface FlagIconProps {
    code: string;
    className?: string;
}
export const FlagIcon: React.FC<FlagIconProps> = ({ code, className }) => {
    const [error, setError] = useState(false);
    if (!code || code === 'GLOBAL' || error) {
        return <Globe className={cn("text-slate-400", className)} />;
    }
    return (
        <img
            src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
            alt={code}
            className={cn("object-cover", className)}
            onError={() => setError(true)}
            loading="lazy"
        />
    );
};