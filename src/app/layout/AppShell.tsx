import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { getMockSession, loadMockSession, type MockSession } from '@/features/wallets/session/sessionService';

type AppShellProps = {
  children?: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [session, setSession] = useState<MockSession | null>(null);

  useEffect(() => {
    let active = true;

    loadMockSession().then((loadedSession) => {
      if (active) {
        setSession(loadedSession);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const resolvedSession = session ?? getMockSession();

  return (
    <main className="app-shell">
      <section className="app-card" aria-labelledby="app-title">
        <p className="app-eyebrow">React Finance Platform</p>
        <h1 id="app-title">Carteiras, contas e transacoes</h1>
        <p>
          Sessao mock carregada para {resolvedSession.email} com papel {resolvedSession.role}.
        </p>
        <div style={{ marginTop: 24 }}>
          {children ?? <Outlet />}
        </div>
      </section>
    </main>
  );
}