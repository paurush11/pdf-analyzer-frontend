'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Center, Container, Loader, Stack, Text, Alert, Button } from '@mantine/core';
import Link from 'next/link';
import { axiosClient } from '@/api/http';
import type { ExtendedAuthTokens } from '@/features/auth/AuthProvider';
import { AUTH_TOKENS_STORAGE_KEY } from '@/features/auth/constants';

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    const processCallback = async () => {
      if (oauthError) {
        setError(errorDescription || oauthError);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        return;
      }

      try {
        const response = await axiosClient<{
          accessToken: string;
          idToken: string;
          refreshToken: string;
          user: {
            email: string;
            sub: string;
            name?: string;
          };
        }>({
          url: `/core/auth/google/callback/?code=${encodeURIComponent(code)}`,
          method: 'GET',
        });

        const tokens: ExtendedAuthTokens = {
          accessToken: response.accessToken,
          idToken: response.idToken,
          refreshToken: response.refreshToken,
          email: response.user.email,
        };

        // Store tokens
        window.sessionStorage.setItem(AUTH_TOKENS_STORAGE_KEY, JSON.stringify(tokens));

        // Notify AuthProvider
        window.dispatchEvent(
          new CustomEvent('auth-tokens-updated', { detail: tokens }),
        );

        await new Promise((resolve) => setTimeout(resolve, 100));

        router.push('/uploads');
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        setError(e?.response?.data?.message || e?.message || 'OAuth failed');
      }
    };

    processCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <Container size="sm" py="xl">
        <Center>
          <Alert color="red" title="Authentication failed" maw={420}>
            <Stack gap="sm">
              <Text size="sm">{error}</Text>
              <Button component={Link} href="/auth/login" fullWidth>
                Back to login
              </Button>
            </Stack>
          </Alert>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Center mih="60vh">
        <Stack gap="md" align="center">
          <Loader size="lg" />
          <Text size="sm" c="dimmed">
            Completing Google sign-in...
          </Text>
        </Stack>
      </Center>
    </Container>
  );
}
