'use client';

import { AppShell, Container } from '@mantine/core';
import AppHeader from './AppHeader';

interface AppShellLayoutProps {
    children: React.ReactNode;
}

export const AppShellLayout = ({ children }: AppShellLayoutProps) => {
    return (
        <AppShell
            header={{ height: 72 }}
            padding="lg"
            withBorder={false}
            styles={() => ({
                header: {
                    backgroundColor: 'var(--app-surface)',
                    borderBottom: '1px solid var(--app-border)',
                    backdropFilter: 'saturate(180%) blur(6px)',
                },
                main: {
                    background: 'var(--app-panel)',
                    minHeight: '100vh',
                },
            })}
        >
            <AppShell.Header>
                <Container size={1200} h="100%" px="lg" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                    <AppHeader />
                </Container>
            </AppShell.Header>
            <AppShell.Main>
                <Container size={1200} py="xl">
                    {children}
                </Container>
            </AppShell.Main>
        </AppShell>
    );
};

export default AppShellLayout;
