import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useRef, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { AccountForm } from '@/features/accounts/components/AccountForm';
import { CardForm } from '@/features/cards/components/CardForm';

function renderAccountsCardsA11yHarness() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AccountsCardsA11yHarness />
    </QueryClientProvider>,
  );
}

function AccountsCardsA11yHarness() {
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
      <h1>Gestao de contas e cartoes</h1>

      <AccountForm onSubmit={() => Promise.resolve()} />
      <CardForm
        debitAccountOptions={[{ id: 'acc-1', label: 'Conta principal' }]}
        onSubmit={() => Promise.resolve()}
      />

      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setIsConfirmOpen(true);
        }}
      >
        Excluir conta principal
      </button>

      {isConfirmOpen ? (
        <section role="dialog" aria-modal="true" aria-labelledby="accounts-cards-confirm-title">
          <h2 id="accounts-cards-confirm-title">Confirmar exclusao de conta</h2>
          <p>Esta acao remove vinculos ativos de conta e cartao.</p>

          <button ref={confirmButtonRef} type="button">
            Confirmar exclusao
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

describe('us2 accounts-cards a11y', () => {
  it('prende o foco no dialogo de confirmacao e retorna ao gatilho original ao cancelar', async () => {
    const user = userEvent.setup();
    renderAccountsCardsA11yHarness();

    const openConfirmButton = screen.getByRole('button', { name: 'Excluir conta principal' });
    openConfirmButton.focus();

    await user.click(openConfirmButton);

    const dialog = await screen.findByRole('dialog', { name: 'Confirmar exclusao de conta' });
    expect(dialog).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: 'Confirmar exclusao' });
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
      expect(screen.queryByRole('dialog', { name: 'Confirmar exclusao de conta' })).not.toBeInTheDocument();
      expect(openConfirmButton).toHaveFocus();
    });
  });
});