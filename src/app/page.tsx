'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  Group,
  List,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { UploadCloud, Shield, Zap, CheckCircle, ArrowRightCircle } from 'feather-icons-react';
import { useAuth } from '@/features/auth/AuthProvider';

const featureHighlights = [
  { icon: UploadCloud, title: 'Effortless intake', description: 'Drag-and-drop encounter notes, labs, and imaging reports in bulk with resumable support.' },
  { icon: Shield, title: 'HIPAA-aligned security', description: 'End-to-end encryption, audited access logs, and patient-safe session controls for care teams.' },
  { icon: Zap, title: 'Clinical intelligence', description: 'AI-assisted extraction that flags diagnoses, medications, and follow-ups in seconds.' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only using auth state after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  const theme = useMantineTheme();
  const brand = theme.primaryColor as string;
  const brandScale = theme.colors[brand] ?? theme.colors[theme.primaryColor];

  // Hero gradient: brand → surface (scheme-aware)
  const gradientStart = brandScale[6];
  const gradientEnd = 'var(--app-surface)';

  const cardBg = 'var(--app-surface)';
  const cardBorder = 'var(--app-border)';

  return (
    <Stack gap="xl" py="xl">
      <Paper
        withBorder
        radius="xl"
        shadow="md"
        p={{ base: 'lg', md: 'xl' }}
        style={{
          background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
          borderColor: 'var(--app-border)',
        }}
      >
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 'lg', md: 'xl' }} verticalSpacing="xl">
          <Stack gap="lg" justify="center">
            <Badge size="lg" variant="light" color={brand} radius="sm" w="fit-content">
              Healthcare-grade documentation hub
            </Badge>

            <Stack gap="sm">
              <Title order={1} fw={800}>
                Turn medical records into a living notebook
              </Title>
              <Text size="lg">
                Centralize clinical PDFs, imaging summaries, and lab reports while AI keeps your patient notes structured and searchable.
              </Text>
            </Stack>

            <Group gap="sm">
              <Button
                component={Link}
                href={mounted && isAuthenticated ? '/uploads' : '/auth/signup'}
                size="md"
                color={brand}
                rightSection={<ArrowRightCircle size={18} />}
              >
                {mounted && isAuthenticated ? 'Upload medical records' : 'Create a free account'}
              </Button>
              {mounted && !isAuthenticated && (
                <Button component={Link} href="/auth/login" variant="subtle" size="md" color={brand}>
                  Clinician sign in
                </Button>
              )}
              {mounted && isAuthenticated && (
                <Button component={Link} href="/auth/logout" variant="subtle" size="md">
                  Sign out
                </Button>
              )}
            </Group>

            <Group gap="md" wrap="wrap">
              {featureHighlights.map((f) => {
                const Icon = f.icon;
                return (
                  <Group key={f.title} gap="xs">
                    <ThemeIcon variant="light" radius="xl" color={brand} size="lg">
                      <Icon size={16} />
                    </ThemeIcon>
                    <Text size="sm" fw={600}>{f.title}</Text>
                  </Group>
                );
              })}
            </Group>
          </Stack>

          <Card radius="lg" shadow="sm" padding="xl" withBorder style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
            <Stack gap="md">
              <Stack gap={4}>
                <Title order={3}>Why care teams choose pdfimg</Title>
                <Text size="sm">
                  Built for physicians, nurses, and revenue cycle teams who need answers on demand.
                </Text>
              </Stack>

              <List
                spacing="md"
                icon={
                  <ThemeIcon color={brand} size={28} radius="xl" variant="light">
                    <CheckCircle size={16} />
                  </ThemeIcon>
                }
              >
                <List.Item>Consolidate EMR exports, imaging PDFs, and scanned referrals into a longitudinal patient notebook.</List.Item>
                <List.Item>Surface diagnoses, medications, allergies, vitals, and follow-ups automatically for quick review.</List.Item>
                <List.Item>Safeguard PHI with enterprise authentication powered by AWS Cognito and granular access policies.</List.Item>
              </List>
            </Stack>
          </Card>
        </SimpleGrid>
      </Paper>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {featureHighlights.map((f) => {
          const Icon = f.icon;
          return (
            <Card
              key={f.title}
              withBorder
              radius="lg"
              padding="lg"
              shadow="sm"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <Stack gap="sm">
                <ThemeIcon variant="light" radius="md" color={brand} size="lg">
                  <Icon size={18} />
                </ThemeIcon>
                <Title order={4}>{f.title}</Title>
                <Text size="sm">{f.description}</Text>
              </Stack>
            </Card>
          );
        })}
      </SimpleGrid>

      <Card withBorder radius="lg" padding="xl" shadow="sm" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Stack gap={4} maw={420}>
            <Title order={3}>Explore the care workspace</Title>
            <Text size="sm">
              Track patient timelines, collaborate on treatment plans, and keep every record at your fingertips.
            </Text>
          </Stack>
          <Group gap="sm">
            <Button
              component={Link}
              href={mounted && isAuthenticated ? '/uploads' : '/auth/login?next=/uploads'}
              variant="light"
              color={brand}
              rightSection={<ArrowRightCircle size={16} />}
            >
              Uploads dashboard
            </Button>
            <Button
              component={Link}
              href={mounted && isAuthenticated ? '/files' : '/auth/login?next=/files'}
              variant="light"
              color={brand}
              rightSection={<ArrowRightCircle size={16} />}
            >
              Browse processed files
            </Button>
          </Group>
        </Group>
      </Card>
    </Stack>
  );
}
