'use client';

import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { env } from '@/config/env';
import { AUTH_TOKENS_STORAGE_KEY } from './constants';
import type { AuthTokens, AuthUser, LoginResponse, RefreshResponse, VerifyTokenResponse } from './types';
import { axiosClient } from '@/api/http'; // <-- use the mutator directly

type LoginOptions = { redirectTo?: string | null };
type LogoutOptions = { redirectTo?: string | null };

interface AuthContextValue {
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
    loading: boolean;
    user: AuthUser | null;
    login: (email: string, password: string, options?: LoginOptions) => Promise<void>;
    logout: (options?: LogoutOptions) => Promise<void>;
    refresh: () => Promise<void>;
    verify: () => Promise<VerifyTokenResponse>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const isBrowser = typeof window !== 'undefined';

const readStoredTokens = (): AuthTokens | null => {
    if (!isBrowser) return null;
    const raw = window.sessionStorage.getItem(AUTH_TOKENS_STORAGE_KEY);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as AuthTokens;
        return parsed?.accessToken ? parsed : null;
    } catch {
        return null;
    }
};

const persistTokens = (tokens: AuthTokens | null) => {
    if (!isBrowser) return;
    if (tokens?.accessToken) {
        window.sessionStorage.setItem(AUTH_TOKENS_STORAGE_KEY, JSON.stringify(tokens));
    } else {
        window.sessionStorage.removeItem(AUTH_TOKENS_STORAGE_KEY);
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const hasHydrated = useRef(false);
    const [tokens, setTokens] = useState<AuthTokens | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<AuthUser | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!hasHydrated.current) {
            const stored = readStoredTokens();
            if (stored) setTokens(stored);
            hasHydrated.current = true;
            setLoading(false);
        }
    }, []);

    const handleSetTokens = useCallback((next: AuthTokens | null) => {
        setTokens(next);
        persistTokens(next);
    }, []);

    const syncUser = useCallback(
        async (accessToken: string) => {
            try {
                const data = await axiosClient<VerifyTokenResponse>({
                    url: '/auth/verify-token',
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    data: { token: accessToken },
                });
                setUser({ id: data.userId, username: data.userName });
            } catch {
                // token invalid → clear session
                handleSetTokens(null);
                setUser(null);
            }
        },
        [handleSetTokens]
    );

    useEffect(() => {
        if (!hasHydrated.current) return;

        if (!tokens?.accessToken) {
            setUser(null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        syncUser(tokens.accessToken)
            .catch(() => { })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [syncUser, tokens?.accessToken]);

    const logout = useCallback(
        async (options?: LogoutOptions) => {
            handleSetTokens(null);
            setUser(null);
            const redirectPath = options?.redirectTo ?? env.auth.postLogoutUrl;
            if (redirectPath) router.push(redirectPath);
        },
        [handleSetTokens, router]
    );

    const login = useCallback(
        async (email: string, password: string, options?: LoginOptions) => {
            const data = await axiosClient<LoginResponse>({
                url: '/auth/login',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                data: { email, password }, // <-- send JSON body
            });

            const nextTokens: AuthTokens & { email?: string | null } = {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken ?? null,
                idToken: data.idToken ?? null,
                email, // optional, useful if your /auth/refresh needs it
            };

            handleSetTokens(nextTokens);

            const redirectPath = options?.redirectTo ?? env.auth.postLoginUrl;
            if (redirectPath) router.push(redirectPath);
        },
        [handleSetTokens, router]
    );

    const refresh = useCallback(async () => {
        if (!tokens?.refreshToken) throw new Error('No refresh token available');

        const data = await axiosClient<RefreshResponse>({
            url: '/auth/refresh',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: {
                refreshToken: tokens.refreshToken,
                // email: (tokens as any).email, // uncomment if backend requires it
            },
        });

        handleSetTokens({
            ...tokens,
            accessToken: data.accessToken,
            idToken: data.idToken ?? tokens.idToken ?? null,
        });

        await syncUser(data.accessToken);
    }, [tokens, handleSetTokens, syncUser]);

    const verify = useCallback(async () => {
        if (!tokens?.accessToken) throw new Error('No access token available');
        return axiosClient<VerifyTokenResponse>({
            url: '/auth/verify-token',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: { token: tokens.accessToken },
        });
    }, [tokens]);

    const value = useMemo<AuthContextValue>(
        () => ({
            tokens,
            isAuthenticated: Boolean(tokens?.accessToken),
            loading,
            user,
            login,
            logout,
            refresh,
            verify,
        }),
        [tokens, loading, user, login, logout, refresh, verify]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};

export default AuthProvider;
