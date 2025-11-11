export interface AuthTokens {
    accessToken: string;
    refreshToken?: string | null;
    idToken?: string | null;
}

export interface AuthUser {
    id: string;
    username: string;
}

export interface LoginResponse {
    message: string;
    accessToken: string;
    refreshToken?: string;
    idToken?: string;
}

export interface RefreshResponse {
    message: string;
    accessToken: string;
    idToken?: string;
}

export interface VerifyTokenResponse {
    message: string;
    valid: boolean;
    userId: string;
    userName: string;
    expiresAt: number;
    expiresAtFormatted: string;
    isExpired: boolean;
    remainingSeconds: number;
}


