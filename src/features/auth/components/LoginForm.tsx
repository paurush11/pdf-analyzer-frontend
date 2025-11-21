'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
    Alert,
    Anchor,
    Box,
    Button,
    Group,
    Paper,
    PasswordInput,
    Stack,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
    redirectTo?: string | null;
}

export const LoginForm = ({ redirectTo }: LoginFormProps) => {
    const router = useRouter();
    const { login, loginWithGoogle, loading } = useAuth();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const loginMutation = useMutation({
        mutationFn: async (vars: { identifier: string; password: string }) => {
            await login(vars.identifier.trim(), vars.password);
        },
        onSuccess: () => {
            if (redirectTo) router.push(redirectTo);
        },
        onError: (err: unknown) => {
            const message =
                (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                (err as Error)?.message ??
                'Unable to login. Please check your credentials and try again.';
            setError(message);
        },
    });

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        await loginMutation.mutateAsync({ identifier, password });
    };

    const disabled = loading || loginMutation.isPending;

    const destinationLabel = useMemo(() => {
        if (!redirectTo) return null;
        if (redirectTo === '/uploads') return 'uploads';
        if (redirectTo === '/files') return 'files';
        return redirectTo;
    }, [redirectTo]);

    return (
        <Box component="form" onSubmit={handleSubmit} maw={420} w="100%">
            <Paper withBorder shadow="md" p="xl" radius="md">
                <Stack gap="lg">
                    <div>
                        <Title order={2}>Welcome back</Title>
                        <Text c="dimmed" size="sm">
                            Enter your email or username and password to sign in.
                        </Text>
                        {destinationLabel && (
                            <Text size="sm" c="dimmed" mt="xs">
                                You need to sign in to access {destinationLabel}.
                            </Text>
                        )}
                    </div>

                    {error && (
                        <Alert variant="light" color="red" title="Login failed">
                            {error}
                        </Alert>
                    )}

                    <Stack gap="sm">
                        <TextInput
                            id="login-identifier"
                            label="Email or username"
                            placeholder="you@example.com or yourhandle"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.currentTarget.value)}
                            required
                            withAsterisk
                            disabled={disabled}
                            data-autofocus
                        />
                        <PasswordInput
                            id="login-password"
                            label="Password"
                            placeholder="Your password"
                            value={password}
                            onChange={(e) => setPassword(e.currentTarget.value)}
                            required
                            withAsterisk
                            disabled={disabled}
                        />
                    </Stack>

                    <Button
                        type="submit"
                        fullWidth
                        loading={loginMutation.isPending}
                        disabled={disabled}
                    >
                        Sign in
                    </Button>

                    {/* Divider */}
                    <Text size="sm" c="dimmed" ta="center">
                        or continue with
                    </Text>

                    {/* Google OAuth Button */}
                    <Button
                        variant="default"
                        fullWidth
                        onClick={loginWithGoogle}
                        disabled={disabled}
                    >
                        <Group gap="xs">
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <Text size="sm">Continue with Google</Text>
                        </Group>
                    </Button>

                    <Text size="sm" c="dimmed" ta="center">
                        Don&apos;t have an account?{' '}
                        <Anchor component={Link} href="/auth/signup">
                            Sign up
                        </Anchor>
                    </Text>
                </Stack>
            </Paper>
        </Box>
    );
};

export default LoginForm;