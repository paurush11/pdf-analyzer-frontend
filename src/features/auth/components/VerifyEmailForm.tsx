'use client';

import { FormEvent, useState } from 'react';
import { Alert, Anchor, Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import Link from 'next/link';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { axiosClient } from '@/api/http';

type Props = { initialEmail?: string };

const VerifyEmailForm = ({ initialEmail = '' }: Props) => {
    const router = useRouter();
    const [email, setEmail] = useState(initialEmail);
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const client = axiosClient();
            await client.post('/auth/verify', { email, code });
            notifications.show({
                title: 'Email verified',
                message: 'You can now sign in with your credentials.',
            });
            router.push('/auth/login');
        } catch (err) {
            const message =
                (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                'Could not verify your email. Double-check the code and try again.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} maw={420} w="100%">
            <Paper withBorder shadow="md" p="xl" radius="md">
                <Stack gap="lg">
                    <div>
                        <Title order={2}>Verify your email</Title>
                        <Text c="dimmed" size="sm">
                            Enter the email you used to sign up and the verification code sent to your inbox.
                        </Text>
                    </div>

                    {error && (
                        <Alert variant="light" color="red" title="Verification failed">
                            {error}
                        </Alert>
                    )}

                    <Stack gap="sm">
                        <TextInput
                            label="Email"
                            placeholder="you@example.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.currentTarget.value)}
                            required
                            withAsterisk
                            disabled={submitting}
                            data-autofocus
                        />
                        <TextInput
                            label="Verification code"
                            placeholder="123456"
                            value={code}
                            onChange={(e) => setCode(e.currentTarget.value)}
                            required
                            withAsterisk
                            disabled={submitting}
                        />
                    </Stack>

                    <Button type="submit" fullWidth loading={submitting} disabled={submitting}>
                        Confirm email
                    </Button>

                    <Text size="sm" c="dimmed" ta="center">
                        Need to make changes?{' '}
                        <Anchor component={Link} href="/auth/signup">Go back to sign up</Anchor>
                    </Text>
                </Stack>
            </Paper>
        </Box>
    );
};

export default VerifyEmailForm;
