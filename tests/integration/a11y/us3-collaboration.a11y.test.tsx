import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useRef, useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CollaboratorsPanel } from '@/features/permissions/components/CollaboratorsPanel';
import * as permissionService from '@/features/permissions/permissionService';

const WALLET_ID = 'wallet-001';

function renderCollaborationA11yHarness(path = `/wallets/${WALLET_ID}/permissions`) {
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
          <Route path="/wallets/:walletId/permissions" element={<CollaborationA11yHarness />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function CollaborationA11yHarness() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isConfirmOpen) {
      return;
    }

    confirmButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = [confirmButtonRef.current, cancelButtonRef.current].filter(Boolean) as HTMLElement[];
      if (focusableElements.length === 0) {
        return;
      }

      const currentIndex = focusableElements.findIndex((element) => element === document.activeElement);
      const nextIndex = event.shiftKey
        ? (currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1)
        : (currentIndex === focusableElements.length - 1 ? 0 : currentIndex + 1);

      event.preventDefault();
      focusableElements[nextIndex]?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isConfirmOpen]);

  return (
    <main>
      <CollaboratorsPanel />

      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setIsConfirmOpen(true);
        }}
      >
        Revogar convite de colaborador
      </button>

      {isConfirmOpen ? (
        <section role="dialog" aria-modal="true" aria-labelledby="collaboration-confirm-title">
          <h2 id="collaboration-confirm-title">Confirmar revogacao do convite</h2>
          <p>Esta acao remove o acesso do colaborador convidado.</p>

          <button ref={confirmButtonRef} type="button">
            Confirmar revogacao
          </button>

          <button
            ref={cancelButtonRef}
            type="button"
            onClick={() => {
              setIsConfirmOpen(false);
              triggerRef.current?.focus();
            }}
          >
            Cancelar
          </button>
        </section>
      ) : null}
    </main>
  );
}

describe('us3 collaboration a11y', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prende o foco no dialogo de confirmacao e retorna ao gatilho ao cancelar', async () => {
    const user = userEvent.setup();

    vi.spyOn(permissionService, 'listWalletPermissions').mockResolvedValue([
      {
        id: 'perm-1',
        walletId: WALLET_ID,
        invitedEmail: 'guest@finance.dev',
        role: 'read',
        roleLabel: 'leitura',
      },
    ]);

    renderCollaborationA11yHarness();

    await screen.findByText('Papel atual: leitura');

    const openConfirmButton = screen.getByRole('button', { name: 'Revogar convite de colaborador' });
    openConfirmButton.focus();

    await user.click(openConfirmButton);

    const dialog = await screen.findByRole('dialog', { name: 'Confirmar revogacao do convite' });
    expect(dialog).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: 'Confirmar revogacao' });
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });

    await waitFor(() => {
      expect(confirmButton).toHaveFocus();
    });

    await user.tab();
    expect(cancelButton).toHaveFocus();

    await user.tab();
    expect(confirmButton).toHaveFocus();

    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Confirmar revogacao do convite' })).not.toBeInTheDocument();
      expect(openConfirmButton).toHaveFocus();
    });
  });
});