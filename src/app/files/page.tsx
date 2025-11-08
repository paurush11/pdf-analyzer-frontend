'use client';

import { Button, Card, Container, Group, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

export default function FilesPage() {
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

