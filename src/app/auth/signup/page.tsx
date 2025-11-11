'use client';

import { Center, Container, Stack, Text } from '@mantine/core';
import SignupForm from '@/features/auth/components/SignupForm';

export default function SignupPage() {
    return (
        <Container size="sm" py="xl">
            <Stack gap="lg">
                <Text size="xl" fw={600}>
                    Join pdfimg
                </Text>
                <Center>
                    <SignupForm />
                </Center>
            </Stack>
        </Container>
    );
}


