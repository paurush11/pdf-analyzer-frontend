const readEnv = (key: string, fallback: string) => {
    const value = process.env[key];
    if (value === undefined || value === '') {
        return fallback;
    }
    return value;
};

export const env = {
    apiBaseUrl: readEnv('NEXT_PUBLIC_API_BASE', '/api'),
    auth: {
        postLoginUrl: readEnv('NEXT_PUBLIC_AUTH_POST_LOGIN_URL', '/uploads'),
        postLogoutUrl: readEnv('NEXT_PUBLIC_AUTH_POST_LOGOUT_URL', '/'),
    },
} as const;


