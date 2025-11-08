// src/hooks/useQuery.ts
'use client';

import { useEffect, useRef } from 'react';
import { useQuery as rqUseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { notifications } from '@mantine/notifications';
import { QueryOptions, ApiError } from './types';
import { isAxiosError, formatErrorMessage } from '@/lib/error';

export function useQuery<TData = unknown, TError = AxiosError<ApiError>>(
    queryKey: readonly unknown[],
    queryFn: () => Promise<TData>,
    options?: QueryOptions<TData, TError>
) {
    const {
        showErrorToast = true,
        errorMessage,
        onError: userOnError,    // <— pull user onError out
        ...rest
    } = options || {};

    const lastToastKey = useRef<string | null>(null);

    const result = rqUseQuery<TData, TError>({
        queryKey,
        queryFn,
        ...rest,                  // <— we do NOT pass onError here (avoids duplicate calls)
    });

    useEffect(() => {
        if (result.isError) {
            const err = result.error as TError;
            // 1) toast (once per error message)
            if (showErrorToast) {
                let msg = 'An error occurred';
                if (isAxiosError(err)) {
                    const data = err.response?.data as ApiError;
                    msg = errorMessage || formatErrorMessage(data).message || err.message;
                } else {
                    msg = errorMessage || (err as any)?.message || msg;
                }
                const key = `${queryKey.join('|')}|${msg}`;
                if (lastToastKey.current !== key) {
                    lastToastKey.current = key;
                    notifications.show({
                        title: 'Error',
                        message: msg,
                        color: 'red',
                    });
                }
            }
            // 2) call user’s onError if provided
            userOnError?.(err);
        }
    }, [result.isError, result.error, showErrorToast, errorMessage, userOnError, queryKey]);

    useEffect(() => {
        if (result.isSuccess) lastToastKey.current = null;
    }, [result.isSuccess]);

    return result;
}
