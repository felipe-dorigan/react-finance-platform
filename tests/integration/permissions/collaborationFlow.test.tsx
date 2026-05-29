import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
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

describe('collaboration flow', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('realiza convite e atualiza permissao imediatamente sem duplicar colaborador', async () => {
    const user = userEvent.setup();

    const permissionsStore: Array<{
      id: string;
      walletId: string;
      invitedEmail: string;
      role: 'read' | 'edit' | 'operate';
      roleLabel: 'leitura' | 'leitura+edicao' | 'acesso_total_operacional';
    }> = [];

    const listSpy = vi.spyOn(permissionService, 'listWalletPermissions').mockImplementation(async () =>
      permissionsStore.map((permission) => ({ ...permission })),
    );

    const inviteSpy = vi.spyOn(invitationService, 'createWalletInvitation').mockImplementation(async (_walletId, payload) => {
      const created = {
        id: `perm-${permissionsStore.length + 1}`,
        walletId: WALLET_ID,
        invitedEmail: payload.invitedEmail,
        role: payload.role,
        roleLabel: permissionService.getPermissionRoleLabel(payload.role),
      } as const;
      permissionsStore.push(created);
      return created;
    });

    const upsertSpy = vi.spyOn(permissionService, 'upsertWalletPermission').mockImplementation(async (_walletId, payload) => {
      const target = permissionsStore.find(
        (permission) => permission.invitedEmail.toLowerCase() === payload.invitedEmail.toLowerCase(),
      );

      if (!target) {
        throw new Error('permission not found');
      }

      target.role = payload.role;
      target.roleLabel = permissionService.getPermissionRoleLabel(payload.role);

      return { ...target };
    });

    renderPanel();

    await screen.findByText('Nenhum colaborador convidado para esta carteira.');

    await user.type(screen.getByLabelText('E-mail do colaborador'), 'guest@finance.dev');
    await user.click(screen.getByRole('button', { name: 'Convidar ou atualizar' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Convite enviado com sucesso.');
    expect(await screen.findByText('Papel atual: leitura')).toBeInTheDocument();
    expect(inviteSpy).toHaveBeenCalledTimes(1);

    await user.type(screen.getByLabelText('E-mail do colaborador'), 'guest@finance.dev');
    await user.selectOptions(screen.getByLabelText('Nivel de acesso'), 'edit');
    await user.click(screen.getByRole('button', { name: 'Convidar ou atualizar' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Permissao atualizada com sucesso.');
    await waitFor(() => {
      expect(screen.getByText('Papel atual: leitura+edicao')).toBeInTheDocument();
    });

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalled();
    expect(screen.getAllByText('guest@finance.dev')).toHaveLength(1);
  });
});