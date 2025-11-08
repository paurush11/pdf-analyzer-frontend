import type { AxiosError } from 'axios';
import type { ApiError, FormattedError } from '@/hooks/types';

export function isAxiosError(e: unknown): e is AxiosError<ApiError> {
    return !!(e as any)?.isAxiosError;
}

export function formatErrorMessage(errorData: ApiError): FormattedError {
    if (!errorData) return { message: 'An error occurred' };

    if (typeof errorData === 'string') return { message: errorData };

    if (typeof errorData === 'object') {
        const obj = errorData as Record<string, any>;
        if (obj.detail && typeof obj.detail === 'string') {
            return { message: obj.detail };
        }
        const fieldErrors: Record<string, string[]> = {};
        for (const [field, val] of Object.entries(obj)) {
            if (Array.isArray(val)) fieldErrors[field] = val.map(String);
            else fieldErrors[field] = [String(val)];
        }
        const message = Object.entries(fieldErrors)
            .map(([f, errs]) => `${f}: ${errs[0]}`)
            .join('\n');
        return { message: message || 'Request failed', fieldErrors };
    }

    return { message: String(errorData) };
}
