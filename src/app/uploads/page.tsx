'use client';

import { useEffect } from 'react';
import { Button, Card, Container, Group, Loader, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';

export default function UploadsPage() {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace('/auth/login?next=/uploads');
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
                    <Title order={1}>Uploads</Title>
                    <Text c="dimmed" size="lg">
                        Kick off a new PDF or image upload workflow. This page will host the drag-and-drop uploader and progress timelines.
                    </Text>
                </Stack>

                <Card withBorder shadow="sm" radius="md">
                    <Stack gap="md" align="center">
                        <Title order={3}>Ready when you are</Title>
                        <Text size="sm" c="dimmed" ta="center">
                            Upload functionality is coming soon. Once it is wired up, you&apos;ll be able to drop files here, monitor background processing, and receive notifications when everything is complete.
                        </Text>
                        <Group>
                            <Button component={Link} href="/">
                                Return home
                            </Button>
                            <Button component={Link} href="/files" variant="light">
                                View files
                            </Button>
                        </Group>
                    </Stack>
                </Card>
            </Stack>
        </Container>
    );
}

