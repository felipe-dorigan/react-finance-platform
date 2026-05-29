import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { router } from '@/app/router/routes';

function renderRoute(initialEntries: string[]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const memoryRouter = createMemoryRouter(router.routes, {
    initialEntries,
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={memoryRouter} />
    </QueryClientProvider>,
  );
}

describe('navigation contract', () => {
  it('renders deep linked dashboard route', async () => {
    renderRoute(['/wallets/wallet-001/dashboard']);

    expect(await screen.findByText('Dashboard da carteira')).toBeInTheDocument();
  });

  it('renders wallet not found fallback route', async () => {
    renderRoute(['/wallet-not-found']);

    expect(await screen.findByText('Carteira não encontrada')).toBeInTheDocument();
  });
});