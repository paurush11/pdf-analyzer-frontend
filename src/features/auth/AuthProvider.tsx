'use client';

import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { env } from '@/config/env';
import { AUTH_TOKENS_STORAGE_KEY } from './constants';
import type { AuthTokens, AuthUser } from './types';
import { axiosClient } from '@/api/http';

import type {
    PostAuthLogin200,
    PostAuthLogin400,
    PostAuthLogin401,
    PostAuthRefresh200,
    PostAuthRefresh400,
    PostAuthRefresh401,
    PostAuthVerifyToken200,
    PostAuthVerifyToken400,
    PostAuthVerifyToken403,
    PostAuthSignup200,
    PostAuthSignup400,
    PostAuthSignup409,
    PostAuthVerify200,
    PostAuthVerify400,
    PostAuthSignupBody,
} from '@/api/generated/js-auth.gen';

// ----- Type aliases from OpenAPI -----
export type LoginResponse = PostAuthLogin200;
export type RefreshResponse = PostAuthRefresh200;
export type VerifyTokenResponse = PostAuthVerifyToken200;
export type SignupResponse = PostAuthSignup200;
export type VerifyEmailResponse = PostAuthVerify200;

export type LoginError = PostAuthLogin400 | PostAuthLogin401;
export type RefreshError = PostAuthRefresh400 | PostAuthRefresh401;
export type VerifyTokenError = PostAuthVerifyToken400 | PostAuthVerifyToken403;
export type SignupError = PostAuthSignup400 | PostAuthSignup409;
export type VerifyEmailError = PostAuthVerify400;

// Use the generated signup body so we never drift from the API
export type SignupPayload = PostAuthSignupBody;

// Payload for verify-email
export type VerifyEmailPayload = {
    email?: string;
    username?: string;
    code: string;
};

// Extend tokens with email so we can refresh
export type ExtendedAuthTokens = AuthTokens & { email?: string | null };

type LoginOptions = { redirectTo?: string | null };
type LogoutOptions = { redirectTo?: string | null };

interface AuthContextValue {
    tokens: ExtendedAuthTokens | null;
    isAuthenticated: boolean;
    loading: boolean;
    user: AuthUser | null;

    signup: (payload: SignupPayload) => Promise<SignupResponse>;
    // identifier can be either email or username
    login: (identifier: string, password: string, options?: LoginOptions) => Promise<void>;
    logout: (options?: LogoutOptions) => Promise<void>;
    refresh: () => Promise<void>;
    verify: () => Promise<VerifyTokenResponse>;
    verifyEmail: (payload: VerifyEmailPayload) => Promise<VerifyEmailResponse>;
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
    const hasHydrated = useRef(false);
    const [tokens, setTokens] = useState<ExtendedAuthTokens | null>(null);
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

    const handleSetTokens = useCallback((next: ExtendedAuthTokens | null) => {
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

                if (!data.userId || !data.userName) {
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

    // LOGIN: identifier can be email or username
    const login = useCallback(
        async (identifier: string, password: string, options?: LoginOptions) => {
            const trimmed = identifier.trim();

            // crude but fine email check – similar to Zod .email()
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

            const body = isEmail
                ? { email: trimmed, password }
                : { username: trimmed, password };

            const data = await axiosClient<LoginResponse>({
                url: '/auth/login',
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

    // SIGNUP
    const signup = useCallback(async (payload: SignupPayload): Promise<SignupResponse> => {
        const data = await axiosClient<SignupResponse>({
            url: '/auth/signup',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: payload,
        });
        return data;
    }, []);

    const verifyEmail = useCallback(
        async (payload: VerifyEmailPayload): Promise<VerifyEmailResponse> => {
            const data = await axiosClient<VerifyEmailResponse>({
                url: '/auth/verify',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                data: payload, // { email?, username?, code }
            });
            return data;
        },
        []
    );

    const refresh = useCallback(async () => {
        if (!tokens?.refreshToken) throw new Error('No refresh token available');
        if (!tokens.email) throw new Error('No email stored with tokens');

        const data = await axiosClient<RefreshResponse>({
            url: '/auth/refresh',
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
            signup,
            login,
            logout,
            refresh,
            verify,
            verifyEmail,
        }),
        [tokens, loading, user, signup, login, logout, refresh, verify, verifyEmail]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};

export default AuthProvider;
