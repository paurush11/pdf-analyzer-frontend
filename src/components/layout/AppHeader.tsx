'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ActionIcon,
    Anchor,
    Avatar,
    Badge,
    Button,
    Divider,
    Group,
    Loader,
    Menu,
    Stack,
    Text,
    useMantineColorScheme,
    useMantineTheme,
} from '@mantine/core';
import {
    Menu as FeatherMenu,
    Home as HomeIcon,
    UploadCloud,
    Folder,
    LogOut,
    Settings,
    Sun,
    Moon,
} from 'feather-icons-react';
import { useAuth } from '@/features/auth/AuthProvider';

const navLinks = [
    { label: 'Home', href: '/', requiresAuth: false, icon: HomeIcon },
    { label: 'Uploads', href: '/uploads', requiresAuth: true, icon: UploadCloud },
    { label: 'Files', href: '/files', requiresAuth: true, icon: Folder },
];

export const AppHeader = () => {
    // 1) All hooks must be called unconditionally and in the same order
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const { isAuthenticated, user, loading, logout } = useAuth();
    const theme = useMantineTheme();
    const { colorScheme, setColorScheme } = useMantineColorScheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    // 2) Only the *rendered output* is conditional, not the hooks
    if (!mounted) {
        // Render nothing on server + first client render → header is client-only
        return null;
    }

    const brand = theme.primaryColor as string;
    const ToggleIcon = colorScheme === 'dark' ? Sun : Moon;
    const toggleColorScheme = () => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');

    return (
        <Group justify="space-between" align="center" w="100%">
            <Group gap="sm" align="center">
                <Anchor component={Link} href="/" td="none" c="inherit">
                    <Stack gap={0} justify="center">
                        <Text fw={700} size="lg">
                            Medical Notebook AI
                        </Text>
                        <Badge size="xs" variant="light" radius="sm" color={brand}>
                            patient intelligence workspace
                        </Badge>
                    </Stack>
                </Anchor>

                <Group gap="xs" visibleFrom="md">
                    {navLinks.map((link) => {
                        if (link.requiresAuth && !isAuthenticated) return null;
                        const active = pathname === link.href;
                        const Icon = link.icon;
                        return (
                            <Button
                                key={link.href}
                                component={Link}
                                href={link.href}
                                variant={active ? 'light' : 'subtle'}
                                color={active ? brand : undefined}
                                leftSection={<Icon size={16} />}
                            >
                                {link.label}
                            </Button>
                        );
                    })}
                </Group>
            </Group>

            <Group gap="xs">
                <ActionIcon
                    variant="subtle"
                    color={brand}
                    radius="xl"
                    size="lg"
                    onClick={toggleColorScheme}
                    aria-label="Toggle color scheme"
                >
                    <ToggleIcon size={18} />
                </ActionIcon>

                <Menu shadow="md" position="bottom-end" withArrow>
                    <Menu.Target>
                        <Button variant="subtle" size="md" leftSection={<FeatherMenu size={18} />} hiddenFrom="md">
                            Menu
                        </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label>Navigation</Menu.Label>
                        {navLinks.map((link) => {
                            if (link.requiresAuth && !isAuthenticated) return null;
                            const Icon = link.icon;
                            return (
                                <Menu.Item
                                    key={link.href}
                                    component={Link}
                                    href={link.href}
                                    leftSection={<Icon size={16} />}
                                >
                                    {link.label}
                                </Menu.Item>
                            );
                        })}
                        <Divider />
                        {!loading && !isAuthenticated && (
                            <>
                                <Menu.Item component={Link} href="/auth/login" color={brand}>
                                    Sign in
                                </Menu.Item>
                                <Menu.Item component={Link} href="/auth/signup" color={brand}>
                                    Create account
                                </Menu.Item>
                            </>
                        )}
                        {!loading && isAuthenticated && (
                            <>
                                <Menu.Item component={Link} href="/auth/logout" leftSection={<Settings size={16} />}>
                                    Manage session
                                </Menu.Item>
                                <Menu.Item color="red" leftSection={<LogOut size={16} />} onClick={() => logout()}>
                                    Sign out
                                </Menu.Item>
                            </>
                        )}
                    </Menu.Dropdown>
                </Menu>

                {!loading && !isAuthenticated && (
                    <Group gap="xs" visibleFrom="md">
                        <Button component={Link} href="/auth/login" variant="default">
                            Sign in
                        </Button>
                        <Button component={Link} href="/auth/signup" color={brand}>
                            Create account
                        </Button>
                    </Group>
                )}

                {!loading && isAuthenticated && (
                    <Menu shadow="md" width={240} position="bottom-end">
                        <Menu.Target>
                            <Button
                                variant="light"
                                leftSection={
                                    <Avatar radius="xl" size="sm" color={brand}>
                                        {user?.username?.[0]?.toUpperCase() ?? '?'}
                                    </Avatar>
                                }
                            >
                                {user?.username ?? 'Account'}
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Label>Session</Menu.Label>
                            <Menu.Item component={Link} href="/auth/logout" leftSection={<Settings size={16} />}>
                                Manage session
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item color="red" leftSection={<LogOut size={16} />} onClick={() => logout()}>
                                Sign out
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                )}

                {loading && <Loader size="sm" aria-label="Loading" />}
            </Group>
        </Group>
    );
};

export default AppHeader;
