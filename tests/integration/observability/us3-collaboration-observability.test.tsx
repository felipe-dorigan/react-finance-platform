import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearErrorSignals, listErrorSignals } from '@/features/observability/errorSignalService';
import { clearTelemetryEvents, listTelemetryEvents } from '@/features/observability/telemetryService';
import { CollaboratorsPanel } from '@/features/permissions/components/CollaboratorsPanel';
import { trackPermissionVisualBlock } from '@/features/permissions/permissionsObservability';
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

function PermissionVisualBlockHarness() {
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <main>
      <button
        type="button"
        onClick={() => {
          trackPermissionVisualBlock(
            {
              walletId: WALLET_ID,
              route: `/wallets/${WALLET_ID}/permissions`,
            },
            {
              attemptedAction: 'permissions.invite-or-upsert',
              role: 'read',
            },
          );
          setFeedback('Somente o dono da carteira pode convidar e alterar niveis de acesso.');
        }}
      >
        Simular bloqueio visual
      </button>

      {feedback ? <p role="alert">{feedback}</p> : null}
    </main>
  );
}

describe('us3 collaboration observability', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    clearTelemetryEvents();
    clearErrorSignals();
  });

  it('emite telemetria de sucesso ao criar convite de colaborador', async () => {
    const user = userEvent.setup();

    vi.spyOn(permissionService, 'listWalletPermissions').mockResolvedValue([]);
    vi.spyOn(invitationService, 'createWalletInvitation').mockResolvedValue({
      id: 'perm-invite-1',
      walletId: WALLET_ID,
      invitedEmail: 'invitee@finance.dev',
      role: 'read',
      roleLabel: 'leitura',
    });
    vi.spyOn(permissionService, 'upsertWalletPermission').mockResolvedValue({
      id: 'perm-invite-1',
      walletId: WALLET_ID,
      invitedEmail: 'invitee@finance.dev',
      role: 'read',
      roleLabel: 'leitura',
    });

    renderPanel();

    await screen.findByText('Nenhum colaborador convidado para esta carteira.');
    await user.type(screen.getByLabelText('E-mail do colaborador'), 'invitee@finance.dev');
    await user.click(screen.getByRole('button', { name: 'Convidar ou atualizar' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Convite enviado com sucesso.');

    const telemetry = listTelemetryEvents(WALLET_ID);
    expect(telemetry.some((event) => event.eventName === 'permissions.invite.succeeded')).toBe(true);
  });

  it('emite telemetria de sucesso ao atualizar permissao de colaborador existente', async () => {
    const user = userEvent.setup();

    vi.spyOn(permissionService, 'listWalletPermissions').mockResolvedValue([
      {
        id: 'perm-2',
        walletId: WALLET_ID,
        invitedEmail: 'invitee@finance.dev',
        role: 'read',
        roleLabel: 'leitura',
      },
    ]);
    vi.spyOn(permissionService, 'upsertWalletPermission').mockResolvedValue({
      id: 'perm-2',
      walletId: WALLET_ID,
      invitedEmail: 'invitee@finance.dev',
      role: 'edit',
      roleLabel: 'leitura+edicao',
    });

    renderPanel();

    await screen.findByText('Papel atual: leitura');
    await user.type(screen.getByLabelText('E-mail do colaborador'), 'invitee@finance.dev');
    await user.selectOptions(screen.getByLabelText('Nivel de acesso'), 'edit');
    await user.click(screen.getByRole('button', { name: 'Convidar ou atualizar' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Permissao atualizada com sucesso.');

    const telemetry = listTelemetryEvents(WALLET_ID);
    expect(telemetry.some((event) => event.eventName === 'permissions.upsert.succeeded')).toBe(true);
  });

  it('emite telemetria e error signal em bloqueio visual para papel sem permissao de gerenciamento', async () => {
    const user = userEvent.setup();

    render(<PermissionVisualBlockHarness />);

    await user.click(screen.getByRole('button', { name: 'Simular bloqueio visual' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Somente o dono da carteira pode convidar e alterar niveis de acesso.',
    );

    const telemetry = listTelemetryEvents(WALLET_ID);
    const errors = listErrorSignals(WALLET_ID);

    expect(telemetry.some((event) => event.eventName === 'permissions.visual-block.triggered')).toBe(true);
    expect(errors.some((signal) => signal.source === 'permissions.visual-block')).toBe(true);
  });

  it('emite error signal e exibe erro visivel quando o carregamento de colaboradores falha', async () => {
    vi.spyOn(permissionService, 'listWalletPermissions').mockRejectedValueOnce(new Error('Falha de API'));

    renderPanel();

    expect(await screen.findByRole('alert')).toHaveTextContent('Nao foi possivel carregar os colaboradores.');

    const errors = listErrorSignals(WALLET_ID);
    expect(errors.some((signal) => signal.source === 'permissions.list.load')).toBe(true);
  });
});