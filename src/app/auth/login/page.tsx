'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Center, Container, Loader, Stack, Text } from '@mantine/core';
import LoginForm from '@/features/auth/components/LoginForm';

const LoginContent = () => {
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

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <Center mih="80vh">
                    <Loader color="gray" />
                </Center>
            }
        >
            <LoginContent />
        </Suspense>
    );
}


