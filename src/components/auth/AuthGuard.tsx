import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
interface AuthGuardProps {
    children: React.ReactNode;
}
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const location = useLocation();
    if (!isAuthenticated) {
        // Redirect to login page, but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <>{children}</>;
};