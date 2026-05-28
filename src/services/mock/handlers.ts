import { http, HttpResponse } from 'msw';
import type { JsonBodyType } from 'msw';
import {
  changeCardDebitAccountRequestSchema,
  createCardLinkedRecordRequestSchema,
  createTransactionRequestSchema,
  payExpenseRequestSchema,
  updateTransactionRequestSchema,
} from '@/schemas/transactionSchemas';
import { upsertPermissionRequestSchema } from '@/schemas/walletSchemas';
import fixtures from './fixtures/wallets.json';

type WalletFixture = {
  id: string;
  ownerId: string;
  name: string;
  timezone: string;
  status: string;
  mainBalance: string;
  projectedBalance: string;
};

type AccountFixture = {
  id: string;
  walletId: string;
  name: string;
  status: string;
  balance: string;
};

type CardFixture = {
  id: string;
  walletId: string;
  name: string;
  debitAccountId: string;
  status: string;
};

type PermissionFixture = {
  id: string;
  walletId: string;
  invitedEmail: string;
  role: string;
  roleLabel: string;
};

type TransactionFixture = Record<string, never>;

const data = fixtures as {
  wallets: WalletFixture[];
  accounts: AccountFixture[];
  cards: CardFixture[];
  transactions: TransactionFixture[];
  permissions: PermissionFixture[];
  auditEvents: unknown[];
};

function jsonOk(body: JsonBodyType, init?: number) {
  return HttpResponse.json(body, { status: init ?? 200 });
}

function getWallet(walletId: string) {
  return data.wallets.find((wallet) => wallet.id === walletId) ?? null;
}

export const handlers = [
  http.get('/wallets/:walletId/accounts', ({ params }) => {
    return jsonOk(data.accounts.filter((account) => account.walletId === params.walletId));
  }),
  http.get('/wallets/:walletId/cards', ({ params }) => {
    return jsonOk(data.cards.filter((card) => card.walletId === params.walletId));
  }),
  http.get('/wallets/:walletId/cards/:cardId', ({ params }) => {
    const card = data.cards.find((entry) => entry.id === params.cardId);

    if (!card) {
      return jsonOk({ message: 'Not found' }, 404);
    }

    return jsonOk({ card, linkedRecords: [] });
  }),
  http.get('/wallets/:walletId/transactions', ({ params }) => {
    return jsonOk(data.transactions.filter((transaction) => transaction.walletId === params.walletId));
  }),
  http.get('/wallets/:walletId/expenses', ({ params }) => {
    return jsonOk(data.transactions.filter((transaction) => transaction.walletId === params.walletId));
  }),
  http.get('/wallets/:walletId/permissions', ({ params }) => {
    return jsonOk(data.permissions.filter((permission) => permission.walletId === params.walletId));
  }),
  http.post('/wallets/:walletId/permissions', async ({ request, params }) => {
    const payload = upsertPermissionRequestSchema.parse(await request.json());
    const walletId = String(params.walletId);
    const existing = data.permissions.find((permission) => permission.walletId === walletId && permission.invitedEmail === payload.invitedEmail);

    return jsonOk(
      existing
        ? { ...existing, role: payload.role }
        : {
            id: `perm-${data.permissions.length + 1}`,
            walletId,
            invitedEmail: payload.invitedEmail,
            role: payload.role,
            roleLabel: 'leitura',
          },
      existing ? 200 : 201,
    );
  }),
  http.post('/wallets/:walletId/invites', async ({ request, params }) => {
    const payload = upsertPermissionRequestSchema.parse(await request.json());
    return jsonOk(
      {
        id: `perm-${data.permissions.length + 1}`,
        walletId: String(params.walletId),
        invitedEmail: payload.invitedEmail,
        role: payload.role,
        roleLabel: 'leitura',
      },
      201,
    );
  }),
  http.get('/wallets/:walletId/audit-events', ({ params }) => {
    return jsonOk(data.auditEvents.filter(() => params.walletId));
  }),
  http.patch('/wallets/:walletId/cards/:cardId/debit-account', async ({ request }) => {
    const payload = changeCardDebitAccountRequestSchema.parse(await request.json());
    return jsonOk({ debitAccountId: payload.debitAccountId });
  }),
  http.post('/wallets/:walletId/cards/:cardId/records', async ({ request }) => {
    const payload = createCardLinkedRecordRequestSchema.parse(await request.json());
    return jsonOk(payload, 201);
  }),
  http.patch('/wallets/:walletId/expenses/:expenseId/pay', async ({ request }) => {
    const payload = payExpenseRequestSchema.parse(await request.json());
    return jsonOk({ paidFromAccountId: payload.paidFromAccountId });
  }),
  http.post('/wallets/:walletId/transactions', async ({ request, params }) => {
    const payload = createTransactionRequestSchema.parse(await request.json());
    return jsonOk({ id: `tx-${Date.now()}`, walletId: String(params.walletId), ...payload }, 201);
  }),
  http.patch('/wallets/:walletId/transactions/:transactionId', async ({ request, params }) => {
    const payload = updateTransactionRequestSchema.parse(await request.json());
    return jsonOk({ id: String(params.transactionId), walletId: String(params.walletId), ...payload });
  }),
  http.post('/telemetry/events', async () => jsonOk({}, 202)),
  http.post('/error-signals', async () => jsonOk({}, 202)),
];

export function getMockWallet(walletId: string) {
  return getWallet(walletId);
}