'use client';

import { FormEvent, useState } from 'react';
import {
    Alert,
    Anchor,
    Box,
    Button,
    Paper,
    Stack,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import Link from 'next/link';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import type {
    VerifyEmailError,
} from '@/features/auth/AuthProvider';
import type {
    PostAuthVerify200,
} from '@/api/generated/js-auth.gen';

type Props = { initialEmail?: string };

// You can alias this for clarity if you like:
type VerifyEmailResponse = PostAuthVerify200;

const VerifyEmailForm = ({ initialEmail = '' }: Props) => {
    const router = useRouter();
    const { verifyEmail } = useAuth();

    const [email, setEmail] = useState(initialEmail);
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    const verifyMutation = useMutation<
        VerifyEmailResponse,
        VerifyEmailError | Error,
        { email: string; code: string }
    >({
        mutationFn: async (vars) => verifyEmail(vars),
    });

    const submitting = verifyMutation.isPending;

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        try {
            await verifyMutation.mutateAsync({ email, code });

            notifications.show({
                title: 'Email verified',
                message: 'You can now sign in with your credentials.',
            });

            router.push('/auth/login');
        } catch (err) {
            const maybeError = err as {
                response?: { data?: { message?: string } };
                message?: string;
            };

            const message =
                maybeError?.response?.data?.message ??
                maybeError?.message ??
                'Could not verify your email. Double-check the code and try again.';

            setError(message);
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
                        <Anchor component={Link} href="/auth/signup">
                            Go back to sign up
                        </Anchor>
                    </Text>
                </Stack>
            </Paper>
        </Box>
    );
};

export default VerifyEmailForm;
