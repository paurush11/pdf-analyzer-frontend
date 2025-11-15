'use client';

import { useEffect } from 'react';
import { Button, Card, Container, Group, Loader, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';

export default function FilesPage() {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace('/auth/login?next=/files');
        }
    }, [isAuthenticated, loading, router]);

    if (loading) {
        return (
            <Container size="lg" py="xl">
                <Stack gap="md" align="center">
                    <Loader color="blue" />
                    <Text size="sm" c="dimmed">
                        Checking your session…
                    </Text>
                </Stack>
            </Container>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <Container size="lg" py="xl">
            <Stack gap="lg">
                <Stack gap={6}>
                    <Title order={1}>Files</Title>
                    <Text c="dimmed" size="lg">
                        Manage processed documents, inspect their metadata, and perform quick actions once they appear here.
                    </Text>
                </Stack>

                <Card withBorder shadow="sm" radius="md">
                    <Stack gap="md" align="center">
                        <Title order={3}>Nothing here yet</Title>
                        <Text size="sm" c="dimmed" ta="center">
                            Uploaded files will show up in this space. Come back after running an upload to review the outputs, download assets, or trigger follow-up tasks.
                        </Text>
                        <Group>
                            <Button component={Link} href="/uploads">
                                Start an upload
                            </Button>
                            <Button component={Link} href="/">
                                Go home
                            </Button>
                        </Group>
                    </Stack>
                </Card>
            </Stack>
        </Container>
    );
}

