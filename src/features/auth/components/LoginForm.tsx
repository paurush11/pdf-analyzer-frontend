'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Alert, Anchor, Box, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthProvider';

interface LoginFormProps {
    redirectTo?: string | null;
}

export const LoginForm = ({ redirectTo }: LoginFormProps) => {
    const { login, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await login(email, password, redirectTo ? { redirectTo } : undefined);
        } catch (err) {
            const message =
                (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                'Unable to login. Please check your credentials and try again.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const disabled = loading || submitting;

    const destinationLabel = useMemo(() => {
        if (!redirectTo) {
            return null;
        }

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
                            Enter your email and password to sign in.
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
                            label="Email"
                            placeholder="you@example.com"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.currentTarget.value)}
                            required
                            withAsterisk
                            disabled={disabled}
                            data-autofocus
                        />
                        <PasswordInput
                            label="Password"
                            placeholder="Your password"
                            value={password}
                            onChange={(event) => setPassword(event.currentTarget.value)}
                            required
                            withAsterisk
                            disabled={disabled}
                        />
                    </Stack>

                    <Button type="submit" fullWidth loading={submitting} disabled={disabled}>
                        Sign in
                    </Button>

                    <Text size="sm" c="dimmed" ta="center">
                        Don&apos;t have an account?{' '}
                        <Anchor component={Link} href="/auth/signup">
                            Sign up
                        </Anchor>
                    </Text>
                    <Text size="sm" c="dimmed" ta="center">
                        Need to verify your account?{' '}
                        <Anchor
                            component={Link}
                            href={`/auth/verify${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                        >
                            Enter verification code
                        </Anchor>
                    </Text>
                </Stack>
            </Paper>
        </Box>
    );
};

export default LoginForm;


