import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useRef, useState } from 'react';
import { describe, expect, it } from 'vitest';

function ModalFocusTrapHarness() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const confirmRef = useRef<HTMLButtonElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    confirmRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      const focusables = [confirmRef.current, cancelRef.current].filter(Boolean) as HTMLElement[];
      const currentIndex = focusables.findIndex((element) => element === document.activeElement);
      const nextIndex = event.shiftKey
        ? (currentIndex <= 0 ? focusables.length - 1 : currentIndex - 1)
        : (currentIndex === focusables.length - 1 ? 0 : currentIndex + 1);

      event.preventDefault();
      focusables[nextIndex]?.focus();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  return (
    <main>
      <button ref={triggerRef} type="button" onClick={() => setIsOpen(true)}>
        Abrir confirmacao global
      </button>

      {isOpen ? (
        <section role="dialog" aria-modal="true" aria-labelledby="global-confirm-title">
          <h2 id="global-confirm-title">Confirmar acao critica</h2>
          <button ref={confirmRef} type="button">Confirmar</button>
          <button
            ref={cancelRef}
            type="button"
            onClick={() => {
              setIsOpen(false);
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

describe('modal focus trap and return', () => {
  it('prende foco no modal-confirm e retorna ao gatilho ao cancelar', async () => {
    const user = userEvent.setup();
    render(<ModalFocusTrapHarness />);

    const trigger = screen.getByRole('button', { name: 'Abrir confirmacao global' });
    trigger.focus();

    await user.click(trigger);

    const dialog = await screen.findByRole('dialog', { name: 'Confirmar acao critica' });
    expect(dialog).toBeInTheDocument();

    const confirm = screen.getByRole('button', { name: 'Confirmar' });
    const cancel = screen.getByRole('button', { name: 'Cancelar' });

    await waitFor(() => expect(confirm).toHaveFocus());

    await user.tab();
    expect(cancel).toHaveFocus();

    await user.tab();
    expect(confirm).toHaveFocus();

    await user.click(cancel);

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Confirmar acao critica' })).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
  });
});
