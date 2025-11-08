'use client';

import Link from 'next/link';
import {
  Button,
  Card,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';

export default function Home() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Stack gap={8}>
          <Title order={1}>Welcome to pdfimg</Title>
          <Text c="dimmed" size="lg">
            Preview the Mantine theme and jump straight to the tools you need for working with PDFs and images.
          </Text>
        </Stack>

        <Group wrap="wrap">
          <Button component={Link} href="/uploads" size="md">
            Go to uploads
          </Button>
          <Button component={Link} href="/files" variant="light" size="md">
            Browse files
          </Button>
        </Group>

        <Card withBorder shadow="sm" radius="md" padding="lg">
          <Stack gap="sm">
            <Title order={3}>What&apos;s next?</Title>
            <Text size="sm" c="dimmed">
              Use the buttons above to explore the uploads workflow or review existing files. This page exists to showcase the global Mantine theme tokens—adjust them in the theme settings to see the updates reflected instantly.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
