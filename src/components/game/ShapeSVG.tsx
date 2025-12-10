import React from 'react';
import { ShapeType, SHAPE_PATHS } from '@/lib/constants';
import { cn } from '@/lib/utils';
interface ShapeSVGProps {
    type: ShapeType;
    className?: string;
}
export const ShapeSVG: React.FC<ShapeSVGProps> = ({ type, className }) => {
    const path = SHAPE_PATHS[type];
    return (
        <svg
            viewBox="0 0 24 24"
            className={cn("w-full h-full fill-current", className)}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d={path} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};