// src/hooks/useMutation.ts
'use client';

import { useMutation as rqUseMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { notifications } from '@mantine/notifications';
import { MutationOptions, ApiError } from './types';
import { isAxiosError, formatErrorMessage } from '@/lib/error';

export function useMutation<TData = unknown, TVariables = void, TError = AxiosError<ApiError>>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: MutationOptions<TData, TVariables, TError>
) {
    const {
        showSuccessToast = true,
        showErrorToast = true,
        successMessage,
        errorMessage,
        onSuccess: userOnSuccess,
        onError: userOnError,
        ...rest
    } = options || {};

    return rqUseMutation<TData, TError, TVariables>({
        mutationFn,
        ...rest, // <- do NOT pass onSettled, we won’t call it manually
        onSuccess: (data, variables, _ctx) => {
            if (showSuccessToast && successMessage) notifications.show({
                title: 'Success',
                message: successMessage,
                color: 'green',
            });
            userOnSuccess?.(data, variables);
        },
        onError: (err, variables, _ctx) => {
            let formatted = { message: 'An error occurred' };
            if (showErrorToast) {
                if (isAxiosError(err)) {
                    const data = err.response?.data as ApiError;
                    formatted = formatErrorMessage(data);
                    notifications.show({
                        title: 'Error',
                        message: errorMessage || formatted.message,
                        color: 'red',
                    });
                } else {
                    notifications.show({
                        title: 'Error',
                        message: errorMessage || (err as any)?.message || formatted.message,
                        color: 'red',
                    });
                }
            }
            userOnError?.(err, variables, formatted);
        },
    });
}
