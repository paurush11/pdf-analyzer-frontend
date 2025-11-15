import axios, { AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { env } from '@/config/env';
import { AUTH_TOKENS_STORAGE_KEY } from '@/features/auth/constants';
import type { AuthTokens } from '@/features/auth/types';

const readAccessToken = () => {
    if (typeof window === 'undefined') return null;
    const raw = window.sessionStorage.getItem(AUTH_TOKENS_STORAGE_KEY);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as AuthTokens;
        return parsed.accessToken ?? null;
    } catch {
        return null;
    }
};

const instance = axios.create({
    baseURL: env.apiBaseUrl, // e.g. '/api'
    withCredentials: true,
});

// attach bearer if present
instance.interceptors.request.use((config) => {
    const token = readAccessToken();
    if (token) {
        const hdrs = (config.headers ?? {}) as AxiosRequestHeaders;
        hdrs.Authorization = `Bearer ${token}`;
        config.headers = hdrs;
    }
    return config;
});

// ---- fix: only pass a real AbortSignal to axios ----
function isAbortSignal(x: unknown): x is AbortSignal {
    return !!x && typeof (x as any).aborted === 'boolean' && typeof (x as any).addEventListener === 'function';
}

/** Orval mutator: returns response.data typed as T */
export const axiosClient = async <T = unknown>(raw: AxiosRequestConfig): Promise<T> => {
    const { signal, ...rest } = raw ?? {};
    const cfg: AxiosRequestConfig = {
        ...rest,
        ...(isAbortSignal(signal) ? { signal } : {}), // <-- guard here
    };
    const res = await instance.request<T>(cfg);
    return res.data;
};
