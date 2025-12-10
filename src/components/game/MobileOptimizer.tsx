import React, { useEffect } from 'react';
export const MobileOptimizer: React.FC = () => {
    useEffect(() => {
        // Prevent default touch actions to stop scrolling/zooming
        const preventDefault = (e: Event) => {
            e.preventDefault();
        };
        // Options for passive listeners (must be false to allow preventDefault)
        const nonPassive = { passive: false };
        // Prevent scrolling and rubber-banding
        const preventTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 1) {
                // Always prevent multi-touch gestures (pinch zoom)
                e.preventDefault();
                return;
            }
            // Allow scrolling in specific containers (modals, menus)
            // We check if the touch target is inside an element with the 'allow-touch-scroll' class
            const target = e.target as HTMLElement;
            if (target.closest('.allow-touch-scroll')) {
                return; // Allow default behavior (scrolling)
            }
            // Prevent scrolling on the body to ensure game stays fixed
            e.preventDefault();
        };
        // Save original styles to restore on unmount
        const originalOverflow = document.body.style.overflow;
        const originalTouchAction = document.body.style.touchAction;
        const originalUserSelect = document.body.style.userSelect;
        const originalWebkitUserSelect = document.body.style.webkitUserSelect;
        const originalOverscrollBehavior = document.body.style.overscrollBehavior;
        const originalHtmlTouchAction = document.documentElement.style.touchAction;
        const originalHtmlOverscrollBehavior = document.documentElement.style.overscrollBehavior;
        // Apply mobile-optimized styles
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.overscrollBehavior = 'none';
        // Also apply to HTML element for better coverage
        document.documentElement.style.touchAction = 'none';
        document.documentElement.style.overscrollBehavior = 'none';
        // Add listeners
        document.addEventListener('contextmenu', preventDefault);
        document.addEventListener('touchmove', preventTouchMove, nonPassive);
        // Prevent double-tap zoom on some browsers
        document.addEventListener('dblclick', preventDefault);
        return () => {
            // Restore styles
            document.body.style.overflow = originalOverflow;
            document.body.style.touchAction = originalTouchAction;
            document.body.style.userSelect = originalUserSelect;
            document.body.style.webkitUserSelect = originalWebkitUserSelect;
            document.body.style.overscrollBehavior = originalOverscrollBehavior;
            document.documentElement.style.touchAction = originalHtmlTouchAction;
            document.documentElement.style.overscrollBehavior = originalHtmlOverscrollBehavior;
            // Remove listeners
            document.removeEventListener('contextmenu', preventDefault);
            document.removeEventListener('touchmove', preventTouchMove);
            document.removeEventListener('dblclick', preventDefault);
        };
    }, []);
    return (
        <style>{`
            /* Disable tap highlight on mobile */
            * {
                -webkit-tap-highlight-color: transparent;
            }
            /* Prevent text selection globally during game */
            body {
                -webkit-user-select: none;
                user-select: none;
            }
        `}</style>
    );
};