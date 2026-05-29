import { createBrowserRouter, Navigate, useRouteError } from 'react-router-dom';
import { AppShell } from '@/app/layout/AppShell';
import { WalletGuard, AuthGuard } from './guards';
import { WalletDashboardPage } from '@/features/transactions/pages/WalletDashboardPage';
import { CollaboratorsPanel } from '@/features/permissions/components/CollaboratorsPanel';

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

const UnauthorizedPage = () => <PlaceholderPage title="Acesso negado" description="Você não tem permissão para acessar esta área." />;
const LoginPage = () => <PlaceholderPage title="Login" description="Fluxo de autenticação será conectado nas próximas fases." />;
const WalletNotFoundPage = () => <PlaceholderPage title="Carteira não encontrada" description="O identificador informado não corresponde a uma carteira disponível." />;

function RouteErrorBoundary() {
  const error = useRouteError();

  return (
    <PlaceholderPage
      title="Erro de rota"
      description={error instanceof Error ? error.message : 'A rota encontrou um problema inesperado.'}
    />
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorBoundary />,
    element: <AuthGuard><AppShell /></AuthGuard>,
    children: [
      {
        index: true,
        element: <Navigate to="/wallets/wallet-001/dashboard" replace />,
      },
      {
        path: 'wallets/:walletId/dashboard',
        element: (
          <WalletGuard requiredRole="read">
            <WalletDashboardPage />
          </WalletGuard>
        ),
      },
      {
        path: 'wallets/:walletId/transactions',
        element: (
          <WalletGuard requiredRole="read">
            <PlaceholderPage title="Transações" description="Tela base para entradas, saídas e transferências." />
          </WalletGuard>
        ),
      },
      {
        path: 'wallets/:walletId/accounts',
        element: (
          <WalletGuard requiredRole="edit">
            <PlaceholderPage title="Contas" description="Gestão de contas financeiras da carteira." />
          </WalletGuard>
        ),
      },
      {
        path: 'wallets/:walletId/cards',
        element: (
          <WalletGuard requiredRole="edit">
            <PlaceholderPage title="Cartões" description="Gestão de cartões e conta de débito vinculada." />
          </WalletGuard>
        ),
      },
      {
        path: 'wallets/:walletId/permissions',
        element: (
          <WalletGuard requiredRole="owner">
            <CollaboratorsPanel />
          </WalletGuard>
        ),
      },
      {
        path: 'wallet-not-found',
        element: <WalletNotFoundPage />,
      },
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
  },
]);