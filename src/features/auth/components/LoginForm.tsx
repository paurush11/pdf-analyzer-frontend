'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
    Alert,
    Anchor,
    Box,
    Button,
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
    const { login, loading } = useAuth();

    // single identifier field: email OR username
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
