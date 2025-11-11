'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import AuthProvider from '@/features/auth/AuthProvider';
import AppShellLayout from '@/components/layout/AppShellLayout';
import { mantineCssVariableResolver } from '../theme/cssVariableResolver';
import { mantineTheme } from '../theme/theme';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <MantineProvider
            theme={mantineTheme}
            cssVariablesResolver={mantineCssVariableResolver}
            defaultColorScheme="auto"
        >
            <Notifications position="top-right" />
            <AuthProvider>
                <QueryClientProvider client={queryClient}>
                    <AppShellLayout>{children}</AppShellLayout>
                    <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
                </QueryClientProvider>
            </AuthProvider>
        </MantineProvider>
    );
}
