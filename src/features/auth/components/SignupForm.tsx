'use client';

import { FormEvent, useState } from 'react';
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
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import type {
    SignupPayload,
    SignupError,
    SignupResponse,
} from '@/features/auth/AuthProvider';

const isEmailLike = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const SignupForm = () => {
    const [displayName, setDisplayName] = useState('');
    const [givenName, setGivenName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { signup } = useAuth();

    const normalizePhoneNumber = (raw: string) => {
        const trimmed = (raw || '').trim();
        const cleaned = trimmed.replace(/[^\d+]/g, '');
        return !cleaned.startsWith('+') && /^\d+$/.test(cleaned) ? `+${cleaned}` : cleaned;
    };

    const signupMutation = useMutation<SignupResponse, SignupError | Error, SignupPayload>({
        mutationFn: async (vars: SignupPayload) => signup(vars),
    });

    const submitting = signupMutation.isPending;

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);

        try {
            const usernameTrimmed = username.trim();
            if (!usernameTrimmed) {
                throw new Error('Please choose a username.');
            }

            // 🔒 mirror backend rule: username must NOT be email-like
            if (isEmailLike(usernameTrimmed)) {
                throw new Error('Username cannot be an email address. Please choose a different username.');
            }

            const normalizedPhone = normalizePhoneNumber(phone);
            if (!normalizedPhone || normalizedPhone.length < 8) {
                throw new Error('Please provide a valid phone number including country code.');
            }

            await signupMutation.mutateAsync({
                name: displayName || undefined,
                givenName,
                email,
                username: usernameTrimmed,
                password,
                phone: normalizedPhone,
            });

            notifications.show({
                title: 'Account created',
                message: 'Check your email for a verification code before logging in.',
                color: 'green',
            });

            setDisplayName('');
            setGivenName('');
            setUsername('');
            setEmail('');
            setPassword('');
            setPhone('');
        } catch (err) {
            const maybeError = err as {
                response?: { data?: { message?: string } };
                message?: string;
            };

            const message =
                maybeError?.response?.data?.message ??
                maybeError?.message ??
                'Unable to sign up. Please review the details and try again.';

            setError(message);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} maw={480} w="100%">
            <Paper withBorder shadow="md" p="xl" radius="md">
                <Stack gap="lg">
                    <div>
                        <Title order={2}>Create an account</Title>
                        <Text c="dimmed" size="sm">
                            Fill in your details to get started.
                        </Text>
                    </div>

                    {error && (
                        <Alert variant="light" color="red" title="Signup failed">
                            {error}
                        </Alert>
                    )}

                    <Stack gap="sm">
                        <TextInput
                            label="First name"
                            placeholder="Ada"
                            value={givenName}
                            onChange={(e) => setGivenName(e.currentTarget.value)}
                            required
                            withAsterisk
                            disabled={submitting}
                            data-autofocus
                        />
                        <TextInput
                            label="Username"
                            placeholder="adalovelace"
                            description="Used to sign in along with your email."
                            value={username}
                            onChange={(e) => setUsername(e.currentTarget.value)}
                            required
                            withAsterisk
                            disabled={submitting}
                        />
                        <TextInput
                            label="Display name"
                            placeholder="Ada Lovelace"
                            description="Optional — shown in the app header."
                            value={displayName}
                            onChange={(e) => setDisplayName(e.currentTarget.value)}
                            disabled={submitting}
                        />
                        <TextInput
                            label="Email"
                            placeholder="you@example.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.currentTarget.value)}
                            required
                            withAsterisk
                            disabled={submitting}
                        />
                        <PasswordInput
                            label="Password"
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.currentTarget.value)}
                            required
                            withAsterisk
                            disabled={submitting}
                        />
                        <TextInput
                            label="Phone number"
                            placeholder="+1 555 123 4567"
                            description="Include your country code. We’ll convert it to E.164."
                            value={phone}
                            onChange={(e) => setPhone(e.currentTarget.value)}
                            required
                            withAsterisk
                            disabled={submitting}
                        />
                    </Stack>

                    <Button type="submit" fullWidth loading={submitting}>
                        Sign up
                    </Button>

                    <Text size="sm" c="dimmed" ta="center">
                        Already have an account?{' '}
                        <Anchor component={Link} href="/auth/login">
                            Sign in
                        </Anchor>
                    </Text>
                    <Text size="sm" c="dimmed" ta="center">
                        Received a code?{' '}
                        <Anchor
                            component={Link}
                            href={`/auth/verify${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                        >
                            Verify your email
                        </Anchor>
                    </Text>
                </Stack>
            </Paper>
        </Box>
    );
};

export default SignupForm;
