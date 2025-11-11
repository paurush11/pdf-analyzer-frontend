'use client';

import { useState } from 'react';
import { Button, Paper, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/features/auth/AuthProvider';

export const LogoutPanel = () => {
    const { logout, isAuthenticated } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const handleLogout = async () => {
        setSubmitting(true);
        try {
            await Promise.resolve(logout());
            notifications.show({
                title: 'Signed out',
                message: 'You have been logged out successfully.',
                color: 'green',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Paper withBorder shadow="md" p="xl" radius="md" maw={420} w="100%">
            <Stack gap="lg">
                <div>
                    <Title order={2}>Sign out</Title>
                    <Text c="dimmed" size="sm">
                        {isAuthenticated
                            ? 'Confirm to end your current session.'
                            : 'You are already signed out.'}
                    </Text>
                </div>

                <Button
                    color="red"
                    onClick={handleLogout}
                    disabled={!isAuthenticated}
                    loading={submitting}
                >
                    Log out
                </Button>
            </Stack>
        </Paper>
    );
};

export default LogoutPanel;


