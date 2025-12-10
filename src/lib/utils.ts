import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
interface ShareResultParams {
    score: number;
    gameMode: 'endless' | 'daily';
    bestScore: number;
    dailyBestScore: number;
    highestChain: number;
}
export async function shareGameResult({ score, gameMode, bestScore, dailyBestScore, highestChain }: ShareResultParams): Promise<'shared' | 'copied' | 'failed'> {
    const isDaily = gameMode === 'daily';
    const date = new Date().toLocaleDateString();
    let text = "";
    if (isDaily) {
        text = `🧩 Merge Burst Daily ${date}\n🏆 Score: ${score}\n🔥 Best: ${dailyBestScore}\n⚡ Max Chain: ${highestChain}\n\nCan you beat my score?`;
    } else {
        text = `🧩 Merge Burst Endless\n⭐ Score: ${score}\n🏆 Best: ${bestScore}\n⚡ Max Chain: ${highestChain}\n\nPlay now!`;
    }
    const shareData = {
        title: "Merge Burst",
        text,
        url: window.location.origin
    };
    return executeShare(shareData);
}
export async function shareApp(): Promise<'shared' | 'copied' | 'failed'> {
    const shareData = {
        title: "Merge Burst",
        text: "Check out Merge Burst! An addictive infinite puzzle game.",
        url: window.location.origin
    };
    return executeShare(shareData);
}
async function executeShare(shareData: { title: string; text: string; url?: string }): Promise<'shared' | 'copied' | 'failed'> {
    try {
        // 1. Try Web Share API first
        if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
            return 'shared';
        }
        // 2. Try Clipboard API
        const textToCopy = shareData.url ? `${shareData.text} ${shareData.url}` : shareData.text;
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(textToCopy);
                return 'copied';
            } catch (clipboardError) {
                // Silently fail or debug log, as we have a fallback
                // console.debug("Clipboard API failed, trying legacy fallback", clipboardError);
            }
        }
        // 3. Legacy Fallback (execCommand)
        if (typeof document !== 'undefined') {
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            // Ensure it's not visible but part of the DOM
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    return 'copied';
                }
            } catch (err) {
                document.body.removeChild(textArea);
                console.error("Legacy copy failed", err);
            }
        }
        // 4. No sharing method available
        console.warn("Share API and Clipboard API not available");
        return 'failed';
    } catch (error) {
        // AbortError is common if user cancels share sheet (mobile)
        if (error instanceof Error && error.name === 'AbortError') {
             return 'failed';
        }
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error sharing:", errorMessage);
        return 'failed';
    }
}