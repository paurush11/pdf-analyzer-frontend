'use client';

import { FormEvent, useState } from 'react';
import { Alert, Anchor, Box, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import Link from 'next/link';
import { notifications } from '@mantine/notifications';
import { axiosClient } from '@/api/http';

export const SignupForm = () => {
    const [displayName, setDisplayName] = useState('');
    const [givenName, setGivenName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const normalizePhoneNumber = (raw: string) => {
        const trimmed = (raw || '').trim();
        const cleaned = trimmed.replace(/[^\d+]/g, '');
        if (!cleaned.startsWith('+') && /^\d+$/.test(cleaned)) {
            return `+${cleaned}`;
        }
        return cleaned;
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const normalizedPhone = normalizePhoneNumber(phone);
            if (!normalizedPhone || normalizedPhone.length < 8) {
                throw new Error('Please provide a valid phone number including country code.');
            }

            const client = axiosClient();
            await client.post('/auth/signup', {
                name: displayName || undefined,
                givenName,
                email,
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
            setEmail('');
            setPassword('');
            setPhone('');
        } catch (err) {
            const message =
                (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                (err as Error)?.message ??
                'Unable to sign up. Please review the details and try again.';
            setError(message);
        } finally {
            setSubmitting(false);
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
                            onChange={(event) => setGivenName(event.currentTarget.value)}
                            required
                            withAsterisk
                            disabled={submitting}
                            data-autofocus
                        />
                        <TextInput
                            label="Display name"
                            placeholder="Ada Lovelace"
                            description="Optional — shown in the app header."
                            value={displayName}
                            onChange={(event) => setDisplayName(event.currentTarget.value)}
                            disabled={submitting}
                        />
                        <TextInput
                            label="Email"
                            placeholder="you@example.com"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.currentTarget.value)}
                            required
                            withAsterisk
                            disabled={submitting}
                        />
                        <PasswordInput
                            label="Password"
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(event) => setPassword(event.currentTarget.value)}
                            required
                            withAsterisk
                            disabled={submitting}
                        />
                        <TextInput
                            label="Phone number"
                            placeholder="+1 555 123 4567"
                            description="Include your country code. We’ll convert it to E.164 for Cognito."
                            value={phone}
                            onChange={(event) => setPhone(event.currentTarget.value)}
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


