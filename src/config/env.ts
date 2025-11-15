const readEnv = (key: string, fallback: string) => {
    const value = process.env[key];
    if (value === undefined || value === '') {
        return fallback;
    }
    return value;
};

// src/config/env.ts
export const env = {
    apiBaseUrl: '/api',                 // goes through the rewrite
    auth: {
        postLoginUrl: process.env.NEXT_PUBLIC_AUTH_POST_LOGIN_URL ?? '/',
        postLogoutUrl: process.env.NEXT_PUBLIC_AUTH_POST_LOGOUT_URL ?? '/',
    },
} as const;


