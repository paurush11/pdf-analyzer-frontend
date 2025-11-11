import axios from 'axios';
import { env } from '@/config/env';
import { AUTH_TOKENS_STORAGE_KEY } from '@/features/auth/constants';
import type { AuthTokens } from '@/features/auth/types';

const readAccessToken = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    const raw = window.sessionStorage.getItem(AUTH_TOKENS_STORAGE_KEY);
    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw) as AuthTokens;
        return parsed.accessToken ?? null;
    } catch (error) {
        console.warn('Unable to read auth tokens from session storage', error);
        return null;
    }
};

export const axiosClient = () => {
    const instance = axios.create({
        baseURL: env.apiBaseUrl,
        withCredentials: true,
    });

    instance.interceptors.request.use((config) => {
        const token = readAccessToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    return instance;
};
