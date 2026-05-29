import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CollaboratorsPanel } from '@/features/permissions/components/CollaboratorsPanel';
import * as permissionService from '@/features/permissions/permissionService';
import * as sessionService from '@/features/wallets/session/sessionService';

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

describe('ui permission protection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('aplica bloqueio visual e desabilita acoes restritas para papel sem gestao', async () => {
    const user = userEvent.setup();

    vi.spyOn(sessionService, 'getMockSession').mockReturnValue({
      userId: 'user-002',
      email: 'reader@finance.dev',
      role: 'read',
      walletId: WALLET_ID,
      permissions: [],
    });

    vi.spyOn(permissionService, 'listWalletPermissions').mockResolvedValue([
      {
        id: 'perm-1',
        walletId: WALLET_ID,
        invitedEmail: 'guest@finance.dev',
        role: 'edit',
        roleLabel: 'leitura+edicao',
      },
    ]);

    renderPanel();

    expect(
      await screen.findByText('Somente o dono da carteira pode convidar e alterar niveis de acesso.'),
    ).toBeInTheDocument();

    const inviteEmailInput = screen.getByLabelText('E-mail do colaborador');
    const roleSelect = screen.getByLabelText('Nivel de acesso');
    const submitButton = screen.getByRole('button', { name: 'Convidar ou atualizar' });
    const rowButton = screen.getByRole('button', { name: 'Atualizar permissao' });

    expect(inviteEmailInput).toBeDisabled();
    expect(roleSelect).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(rowButton).toBeDisabled();

    await user.click(rowButton);
    expect(screen.queryByRole('status', { name: 'Permissao atualizada com sucesso.' })).not.toBeInTheDocument();
  });
});