'use client';

import { Center, Container, Stack, Text } from '@mantine/core';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/features/auth/components/LoginForm';

export default function LoginPage() {
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('next');

    return (
        <Container size="sm" py="xl">
            <Stack gap="lg">
                <Text size="xl" fw={600}>
                    Access your workspace
                </Text>
                <Center>
                    <LoginForm redirectTo={redirectTo} />
                </Center>
            </Stack>
        </Container>
    );
}


