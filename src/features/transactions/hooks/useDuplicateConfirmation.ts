import { useState } from 'react';
import type { DuplicateDetectionCandidate } from '@/features/transactions/duplicateDetectionService';

type DuplicateConfirmationState<TPayload> = {
  pendingPayload: TPayload | null;
  candidate: DuplicateDetectionCandidate | null;
  message: string | null;
  isConfirming: boolean;
};

type UseDuplicateConfirmationOptions<TPayload> = {
  onConfirm: (payload: TPayload) => Promise<void>;
};

const INITIAL_STATE: DuplicateConfirmationState<never> = {
  pendingPayload: null,
  candidate: null,
  message: null,
  isConfirming: false,
};

export function useDuplicateConfirmation<TPayload>({
  onConfirm,
}: UseDuplicateConfirmationOptions<TPayload>) {
  const [state, setState] = useState<DuplicateConfirmationState<TPayload>>(
    INITIAL_STATE as DuplicateConfirmationState<TPayload>,
  );

  const askForConfirmation = (
    payload: TPayload,
    details: { message: string; candidate: DuplicateDetectionCandidate },
  ) => {
    setState({
      pendingPayload: payload,
      candidate: details.candidate,
      message: details.message,
      isConfirming: false,
    });
  };

  const cancelConfirmation = () => {
    setState(INITIAL_STATE as DuplicateConfirmationState<TPayload>);
  };

  const confirmAndPersist = async () => {
    if (!state.pendingPayload) {
      return;
    }

    setState((current) => ({ ...current, isConfirming: true }));

    try {
      await onConfirm(state.pendingPayload);
      setState(INITIAL_STATE as DuplicateConfirmationState<TPayload>);
    } catch (_error) {
      setState((current) => ({ ...current, isConfirming: false }));
      throw _error;
    }
  };

  return {
    duplicateConfirmation: state,
    hasPendingConfirmation: state.pendingPayload !== null,
    askForConfirmation,
    cancelConfirmation,
    confirmAndPersist,
  };
}