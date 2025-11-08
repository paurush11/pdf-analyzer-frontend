// src/hooks/types.ts
import type { AxiosError } from 'axios';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export type ApiError = Record<string, unknown> | { detail?: string } | string;

export type QueryOptions<TData = unknown, TError = AxiosError<ApiError>> =
    // keep all normal query options; we’ll pull some out in the wrapper
    Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> & {
        showErrorToast?: boolean;
        errorMessage?: string;
        // explicitly expose onError so TS knows it exists
        onError?: (error: TError) => void;
    };

export type FormattedError = {
    message: string;
    fieldErrors?: Record<string, string[]>;
};

export type MutationOptions<TData, TVars, TErr = AxiosError<ApiError>> =
    // remove onSuccess/onError so we can define our own enhanced versions
    Omit<UseMutationOptions<TData, TErr, TVars>, 'mutationFn' | 'onSuccess' | 'onError' | 'onSettled'> & {
        showSuccessToast?: boolean;
        showErrorToast?: boolean;
        successMessage?: string;
        errorMessage?: string;
        onSuccess?: (data: TData, variables: TVars) => void;
        onError?: (error: TErr, variables: TVars, formatted: FormattedError) => void;
    };
