'use client';

import { Center, Container, Stack, Text } from '@mantine/core';
import VerifyEmailForm from '@/features/auth/components/VerifyEmailForm';

export default function VerifyEmailPage() {
    return (
        <Container size="sm" py="xl">
            <Stack gap="lg">
                <Text size="xl" fw={600}>
                    Confirm your account
                </Text>
                <Center>
                    <VerifyEmailForm />
                </Center>
            </Stack>
        </Container>
    );
}



