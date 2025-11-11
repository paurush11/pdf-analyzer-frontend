'use client';

import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { axiosClient } from '@/api/http';
import { env } from '@/config/env';
import { AUTH_TOKENS_STORAGE_KEY } from './constants';
import type { AuthTokens, AuthUser, LoginResponse, RefreshResponse, VerifyTokenResponse } from './types';

type LoginOptions = {
    redirectTo?: string | null;
};

type LogoutOptions = {
    redirectTo?: string | null;
};

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
        if (!parsed?.accessToken) {
            return null;
        }
        return parsed;
    } catch (error) {
        console.warn('Failed to parse stored auth tokens', error);
        return null;
    }
};

const persistTokens = (tokens: AuthTokens | null) => {
    if (!isBrowser) return;
    if (tokens && tokens.accessToken) {
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
            if (stored) {
                setTokens(stored);
            }
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
                const client = axiosClient();
                const { data } = await client.post<VerifyTokenResponse>('/auth/verify-token', {
                    token: accessToken,
                });
                setUser({
                    id: data.userId,
                    username: data.userName,
                });
            } catch (error) {
                console.warn('Failed to verify access token, clearing session', error);
                handleSetTokens(null);
                setUser(null);
            }
        },
        [handleSetTokens]
    );

    useEffect(() => {
        if (!hasHydrated.current) {
            return;
        }

        if (!tokens?.accessToken) {
            setUser(null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        syncUser(tokens.accessToken)
            .catch(() => {
                /* errors handled in syncUser */
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [syncUser, tokens?.accessToken]);

    const logout = useCallback(async (options?: LogoutOptions) => {
        handleSetTokens(null);
        setUser(null);
        const redirectPath = options?.redirectTo ?? env.auth.postLogoutUrl;
        if (redirectPath) {
            router.push(redirectPath);
        }
    }, [handleSetTokens, router]);

    const login = useCallback(
        async (email: string, password: string, options?: LoginOptions) => {
            const client = axiosClient();
            const { data } = await client.post<LoginResponse>('/auth/login', { email, password });
            const nextTokens: AuthTokens = {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken ?? null,
                idToken: data.idToken ?? null,
            };

            handleSetTokens(nextTokens);

            const redirectPath = options?.redirectTo ?? env.auth.postLoginUrl;
            router.push(redirectPath);
        },
        [handleSetTokens, router]
    );

    const refresh = useCallback(async () => {
        if (!tokens?.refreshToken) {
            throw new Error('No refresh token available');
        }

        const client = axiosClient();
        const { data } = await client.post<RefreshResponse>('/auth/refresh', {
            refreshToken: tokens.refreshToken,
        });

        handleSetTokens({
            ...tokens,
            accessToken: data.accessToken,
            idToken: data.idToken ?? tokens.idToken ?? null,
        });
        await syncUser(data.accessToken);
    }, [handleSetTokens, syncUser, tokens]);

    const verify = useCallback(async () => {
        if (!tokens?.accessToken) {
            throw new Error('No access token available');
        }
        const client = axiosClient();
        const { data } = await client.post<VerifyTokenResponse>('/auth/verify-token', {
            token: tokens.accessToken,
        });

        return data;
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
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthProvider;


