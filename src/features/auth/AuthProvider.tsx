'use client';

import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { env } from '@/config/env';
import { AUTH_TOKENS_STORAGE_KEY } from './constants';
import type { AuthTokens, AuthUser } from './types';
import { axiosClient } from '@/api/http';

/**
 * -------------------------
 *  API RESPONSE / PAYLOAD TYPES
 * -------------------------
 */

// /core/auth/login/
export interface LoginResponse {
    message: string;
    accessToken?: string | null;
    idToken?: string | null;
    refreshToken?: string | null;
    tokenType?: string | null;
    expiresIn?: number | null;
}

// /core/auth/refresh/
export interface RefreshResponse {
    message: string;
    accessToken?: string | null;
    idToken?: string | null;
    tokenType?: string | null;
    expiresIn?: number | null;
}

// /core/auth/verify-token/
export interface VerifyTokenResponse {
    message: string;
    valid: boolean;
    userId?: string | null;
    userName?: string | null;
    expiresAt?: number | null;
    expiresAtFormatted?: string | null;
    isExpired?: boolean | null;
    remainingSeconds?: number | null;
}

// /core/auth/signup/
export interface SignupResponse {
    message: string;
}

// /core/auth/verify/
export interface VerifyEmailResponse {
    message: string;
}

export type LoginError = unknown;
export type RefreshError = unknown;
export type VerifyTokenError = unknown;
export type SignupError = unknown;
export type VerifyEmailError = unknown;

export type SignupPayload = {
    email: string;
    username: string;
    password: string;
    givenName: string;
    phone: string;
    name?: string;
};

export type VerifyEmailPayload = {
    email?: string;
    username?: string;
    code: string;
};

export type ExtendedAuthTokens = AuthTokens & { email?: string | null };

type LoginOptions = { redirectTo?: string | null };
type LogoutOptions = { redirectTo?: string | null };

interface AuthContextValue {
    tokens: ExtendedAuthTokens | null;
    isAuthenticated: boolean;
    loading: boolean;
    user: AuthUser | null;

    signup: (payload: SignupPayload) => Promise<SignupResponse>;
    login: (identifier: string, password: string, options?: LoginOptions) => Promise<void>;
    logout: (options?: LogoutOptions) => Promise<void>;
    refresh: () => Promise<void>;
    verify: () => Promise<VerifyTokenResponse>;
    verifyEmail: (payload: VerifyEmailPayload) => Promise<VerifyEmailResponse>;
    loginWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const isBrowser = typeof window !== 'undefined';

const readStoredTokens = (): ExtendedAuthTokens | null => {
    if (!isBrowser) return null;
    const raw = window.sessionStorage.getItem(AUTH_TOKENS_STORAGE_KEY);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as ExtendedAuthTokens;
        return parsed?.accessToken ? parsed : null;
    } catch {
        return null;
    }
};

const persistTokens = (tokens: ExtendedAuthTokens | null) => {
    if (!isBrowser) return;
    if (tokens?.accessToken) {
        window.sessionStorage.setItem(AUTH_TOKENS_STORAGE_KEY, JSON.stringify(tokens));
    } else {
        window.sessionStorage.removeItem(AUTH_TOKENS_STORAGE_KEY);
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [tokens, setTokens] = useState<ExtendedAuthTokens | null>(() => readStoredTokens());
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);
    const router = useRouter();

    const handleSetTokens = useCallback((next: ExtendedAuthTokens | null) => {
        setTokens(next);
        persistTokens(next);
    }, []);

    const syncUser = useCallback(
        async (accessToken: string) => {
            try {
                const data = await axiosClient<VerifyTokenResponse>({
                    url: '/core/auth/verify-token/',
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    data: { token: accessToken },
                });

                if (!data.userId || !data.userName || !data.valid) {
                    handleSetTokens(null);
                    setUser(null);
                    return;
                }

                setUser({ id: data.userId, username: data.userName });
            } catch {
                handleSetTokens(null);
                setUser(null);
            }
        },
        [handleSetTokens]
    );

    useEffect(() => {
        if (!tokens?.accessToken) return;

        let cancelled = false;

        const loadUser = async () => {
            setLoading((prev) => (!prev ? true : prev));
            try {
                await syncUser(tokens.accessToken);
            } finally {
                if (!cancelled) {
                    setLoading((prev) => (prev ? false : prev));
                }
            }
        };

        loadUser();

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
        async (identifier: string, password: string, options?: LoginOptions) => {
            const trimmed = identifier.trim();
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

            const body = isEmail
                ? { email: trimmed, password }
                : { username: trimmed, password };

            // IMPORTANT: trailing slash and same baseURL as Orval
            const data = await axiosClient<LoginResponse>({
                url: '/core/auth/login/',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                data: body,
            });

            const nextTokens: ExtendedAuthTokens = {
                accessToken: data.accessToken ?? '',
                refreshToken: data.refreshToken ?? null,
                idToken: data.idToken ?? null,
                email: isEmail ? trimmed : null,
            };

            handleSetTokens(nextTokens);

            const redirectPath = options?.redirectTo ?? env.auth.postLoginUrl;
            if (redirectPath) router.push(redirectPath);
        },
        [handleSetTokens, router]
    );

    const signup = useCallback(
        async (payload: SignupPayload): Promise<SignupResponse> => {
            const data = await axiosClient<SignupResponse>({
                url: '/core/auth/signup/',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                data: payload,
            });
            return data;
        },
        []
    );

    const verifyEmail = useCallback(
        async (payload: VerifyEmailPayload): Promise<VerifyEmailResponse> => {
            const data = await axiosClient<VerifyEmailResponse>({
                url: '/core/auth/verify/',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                data: payload,
            });
            return data;
        },
        []
    );

    const refresh = useCallback(async () => {
        if (!tokens?.refreshToken) throw new Error('No refresh token available');
        if (!tokens.email) throw new Error('No email stored with tokens');

        const data = await axiosClient<RefreshResponse>({
            url: '/core/auth/refresh/',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: { refreshToken: tokens.refreshToken, email: tokens.email },
        });

        const updated: ExtendedAuthTokens = {
            ...tokens,
            accessToken: data.accessToken ?? '',
            idToken: data.idToken ?? tokens.idToken ?? null,
        };

        handleSetTokens(updated);
        await syncUser(data.accessToken ?? '');
    }, [tokens, handleSetTokens, syncUser]);

    const verify = useCallback(async (): Promise<VerifyTokenResponse> => {
        if (!tokens?.accessToken) throw new Error('No access token available');
        return axiosClient<VerifyTokenResponse>({
            url: '/core/auth/verify-token/',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: { token: tokens.accessToken },
        });
    }, [tokens]);

    const loginWithGoogle = useCallback(() => {
        console.log('loginWithGoogle', `${env.apiBaseUrl}/core/auth/google`);
        window.location.href = `${env.apiBaseUrl}/core/auth/google`;
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            tokens,
            isAuthenticated: Boolean(tokens?.accessToken),
            loading,
            user,
            signup,
            login,
            logout,
            refresh,
            verify,
            verifyEmail,
            loginWithGoogle,
        }),
        [tokens, loading, user, signup, login, logout, refresh, verify, verifyEmail, loginWithGoogle]
    );

    useEffect(() => {
        const handleAuthEvent = (e: Event) => {
            const customEvent = e as CustomEvent<ExtendedAuthTokens>;
            const newTokens = customEvent.detail || readStoredTokens();

            if (newTokens?.accessToken && newTokens.accessToken !== tokens?.accessToken) {
                setTokens(newTokens);
            }
        };

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === AUTH_TOKENS_STORAGE_KEY) {
                const newTokens = readStoredTokens();
                if (newTokens?.accessToken !== tokens?.accessToken) {
                    setTokens(newTokens);
                }
            }
        };

        window.addEventListener('auth-tokens-updated', handleAuthEvent);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('auth-tokens-updated', handleAuthEvent);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [tokens?.accessToken]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};

export default AuthProvider;
