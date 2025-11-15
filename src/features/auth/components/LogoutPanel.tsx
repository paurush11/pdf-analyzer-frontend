'use client';

import { Button, Paper, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';

export const LogoutPanel = () => {
    const { logout, isAuthenticated } = useAuth();

    const logoutMutation = useMutation({
        mutationFn: () => logout(),
        onSuccess: () => {
            notifications.show({
                title: 'Signed out',
                message: 'You have been logged out successfully.',
                color: 'green',
            });
        },
    });

    return (
        <Paper withBorder shadow="md" p="xl" radius="md" maw={420} w="100%">
            <Stack gap="lg">
                <div>
                    <Title order={2}>Sign out</Title>
                    <Text c="dimmed" size="sm">
                        {isAuthenticated ? 'Confirm to end your current session.' : 'You are already signed out.'}
                    </Text>
                </div>

                <Button
                    color="red"
                    onClick={() => logoutMutation.mutate()}
                    disabled={!isAuthenticated}
                    loading={logoutMutation.isPending}
                >
                    Log out
                </Button>
            </Stack>
        </Paper>
    );
};

export default LogoutPanel;
