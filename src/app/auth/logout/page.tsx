'use client';

import { Center, Container, Stack, Text } from '@mantine/core';
import LogoutPanel from '@/features/auth/components/LogoutPanel';

export default function LogoutPage() {
    return (
        <Container size="sm" py="xl">
            <Stack gap="lg">
                <Text size="xl" fw={600}>
                    Manage your session
                </Text>
                <Center>
                    <LogoutPanel />
                </Center>
            </Stack>
        </Container>
    );
}


