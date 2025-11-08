import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // don’t refetch just by tab focus; fewer surprise network calls
            refetchOnWindowFocus: false,
            // retry light transient failures
            retry: 2,
            // small cache window; tune per query with options
            staleTime: 15_000,
        },
        mutations: {
            retry: 1,
        },
    },
});
