'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';

export const useRequireAuth = () => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const redirected = useRef(false);

    useEffect(() => {
        if (!loading && !isAuthenticated && !redirected.current) {
            redirected.current = true;
            const params = new URLSearchParams();
            if (pathname) {
                params.set('next', pathname);
            }
            router.replace(`/auth/login${params.size ? `?${params.toString()}` : ''}`);
        }
    }, [isAuthenticated, loading, pathname, router]);

    const isChecking = useMemo(() => loading || (!isAuthenticated && !redirected.current), [isAuthenticated, loading]);

    return {
        isAuthenticated,
        isChecking,
    };
};

export default useRequireAuth;

