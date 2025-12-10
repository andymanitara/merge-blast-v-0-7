import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
interface User {
    id: string;
    name: string;
    avatar?: string;
    country?: string;
}
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    loginAsGuest: () => Promise<void>;
    logout: () => void;
    updateProfile: (name: string, avatar: string, country: string) => void;
}
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            loginAsGuest: async () => {
                set({ isLoading: true, error: null });
                try {
                    // Attempt to fetch from backend
                    const response = await fetch('/api/auth/guest', {
                        method: 'POST',
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.user) {
                            set({
                                user: {
                                    id: data.user.id,
                                    name: data.user.name,
                                    avatar: 'user', // Default avatar
                                    country: 'GLOBAL' // Default country
                                },
                                token: data.user.token,
                                isAuthenticated: true,
                                isLoading: false,
                            });
                            return;
                        }
                    }
                    throw new Error('Failed to authenticate with server');
                } catch (error) {
                    console.warn('Auth server unreachable, using offline fallback', error);
                    // Offline Fallback
                    const fallbackId = uuidv4();
                    const fallbackToken = `offline_${fallbackId}_${Date.now()}`;
                    set({
                        user: {
                            id: fallbackId,
                            name: 'Guest',
                            avatar: 'user', // Default avatar
                            country: 'GLOBAL' // Default country
                        },
                        token: fallbackToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                }
            },
            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                    isLoading: false
                });
            },
            updateProfile: (name: string, avatar: string, country: string) => {
                set((state) => ({
                    user: state.user ? { ...state.user, name, avatar, country } : null
                }));
            }
        }),
        {
            name: 'shape-merge-auth',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);