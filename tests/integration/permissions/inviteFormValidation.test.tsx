import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CollaboratorsPanel } from '@/features/permissions/components/CollaboratorsPanel';
import * as invitationService from '@/features/permissions/invitationService';
import * as permissionService from '@/features/permissions/permissionService';

const WALLET_ID = 'wallet-001';

function renderPanel(path = `/wallets/${WALLET_ID}/permissions`) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/wallets/:walletId/permissions" element={<CollaboratorsPanel />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('invite form validation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('bloqueia envio invalido e exibe mensagem de e-mail no formulario de convite', async () => {
    const user = userEvent.setup();

    vi.spyOn(permissionService, 'listWalletPermissions').mockResolvedValue([]);
    const inviteSpy = vi.spyOn(invitationService, 'createWalletInvitation').mockResolvedValue({
      id: 'perm-1',
      walletId: WALLET_ID,
      invitedEmail: 'guest@finance.dev',
      role: 'read',
      roleLabel: 'leitura',
    });
    const upsertSpy = vi.spyOn(permissionService, 'upsertWalletPermission').mockResolvedValue({
      id: 'perm-1',
      walletId: WALLET_ID,
      invitedEmail: 'guest@finance.dev',
      role: 'read',
      roleLabel: 'leitura',
    });

    renderPanel();

    await screen.findByText('Nenhum colaborador convidado para esta carteira.');

    await user.type(screen.getByLabelText('E-mail do colaborador'), 'email-invalido');
    await user.click(screen.getByRole('button', { name: 'Convidar ou atualizar' }));

    expect(await screen.findByText('Informe um e-mail valido.')).toBeInTheDocument();
    expect(inviteSpy).not.toHaveBeenCalled();
    expect(upsertSpy).not.toHaveBeenCalled();
  });
});