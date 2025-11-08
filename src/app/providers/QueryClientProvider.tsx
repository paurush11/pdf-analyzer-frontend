'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { mantineCssVariableResolver } from '../theme/cssVariableResolver';
import { mantineTheme } from '../theme/theme';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <MantineProvider
            theme={mantineTheme}
            cssVariablesResolver={mantineCssVariableResolver}
            defaultColorScheme="light"
        >
            <Notifications position="top-right" />
            <QueryClientProvider client={queryClient}>
                {children}
                <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
            </QueryClientProvider>
        </MantineProvider>
    );
}
