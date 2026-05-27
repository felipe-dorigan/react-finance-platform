# Data Model: Gestão de Carteiras, Contas e Transações

## Entidades

### User
- id: string (uuid)
- email: string (email)
- name: string
- createdAt: string (ISO-8601)
- updatedAt: string (ISO-8601)

Regras:
- Usuário autenticado é obrigatório para qualquer ação de carteira.

### Wallet
- id: string (uuid)
- ownerId: string (User.id)
- name: string (1..80)
- status: "active" | "archived"
- mainBalance: string (decimal)
- projectedBalance: string (decimal)
- createdAt: string
- updatedAt: string

Regras:
- Máximo de 2 carteiras por ownerId.
- Excluir carteira não faz parte das permissões de convidado.

### WalletPermission
- id: string (uuid)
- walletId: string (Wallet.id)
- invitedEmail: string (email)
- role: "read" | "edit" | "operate"
- invitedByUserId: string (User.id)
- createdAt: string
- updatedAt: string

Regras:
- E-mail convidado único por carteira.
- Alterar convite existente atualiza role, não cria duplicado.

### Account
- id: string (uuid)
- walletId: string (Wallet.id)
- name: string (1..80)
- type: "checking" | "savings" | "cash" | "other"
- status: "active" | "inactive"
- balance: string (decimal)
- createdAt: string
- updatedAt: string

Regras:
- Conta inativa não pode receber novas transações.
- Conta com cartão vinculado não pode ser excluída.

### Card
- id: string (uuid)
- walletId: string (Wallet.id)
- name: string (1..80)
- brand: string
- last4: string (4 dígitos)
- debitAccountId: string (Account.id)
- status: "active" | "inactive"
- createdAt: string
- updatedAt: string

Regras:
- Cartão exige `debitAccountId` válido.
- Alterar `debitAccountId` deve atualizar vínculo para pagamentos futuros.
- Cartão inativo não pode ser usado em novos lançamentos.

### Transaction
- id: string (uuid)
- walletId: string (Wallet.id)
- type: "income" | "expense" | "transfer"
- status: "effective" | "pending"
- amount: string (decimal > 0)
- date: string (ISO-8601)
- period: null | "daily" | "weekly" | "monthly" | "yearly"
- sourceAccountId: string | null (Account.id)
- destinationAccountId: string | null (Account.id)
- cardId: string | null (Card.id)
- description: string | null
- createdByUserId: string (User.id)
- createdAt: string
- updatedAt: string

Regras:
- `transfer` é sempre pontual (`period = null`).
- Em `transfer`, origem e destino obrigatórias e diferentes.
- `pending` impacta apenas saldo projetado.
- `effective` impacta saldo principal e projetado.

### Refund
- id: string (uuid)
- walletId: string (Wallet.id)
- originalTransactionId: string (Transaction.id de despesa)
- amount: string (decimal > 0)
- refundType: "partial" | "total"
- createdByUserId: string (User.id)
- createdAt: string

Regras:
- Soma de estornos não pode exceder valor líquido estornável da despesa.
- Estorno gera entrada vinculada à despesa original.

### AuditEvent
- id: string (uuid)
- walletId: string (Wallet.id)
- actorUserId: string (User.id)
- actorEmail: string
- actorRole: "owner" | "read" | "edit" | "operate"
- action: string
- entityType: "account" | "card" | "transaction" | "permission" | "invite"
- entityId: string
- metadata: object
- occurredAt: string (ISO-8601)

Regras:
- Imutável.
- Não é removido quando registros de negócio são excluídos.

## Relacionamentos
- User 1:N Wallet (como dono)
- Wallet 1:N WalletPermission
- Wallet 1:N Account
- Wallet 1:N Card
- Wallet 1:N Transaction
- Wallet 1:N AuditEvent
- Account 1:N Card (via debitAccountId)
- Transaction 1:N Refund (somente para despesas de cartão)

## Transições de Estado

### Account/Card
- active -> inactive (arquivar)
- inactive -> active (reativar)
- active|inactive -> deleted (exclusão definitiva, com regras de bloqueio e recálculo)

### Transaction
- pending <-> effective (mudança auditável com recomputação de saldos)

### WalletPermission
- read <-> edit <-> operate (alterável pelo dono/operador conforme regra de domínio)

## Regras de Recalculo
- Escopo sempre por carteira atual.
- Exclusão definitiva de conta remove entradas/saídas/transferências onde a conta é origem/destino.
- Exclusão definitiva de cartão remove despesas e estornos vinculados.
- Após exclusões, recomputar:
  - saldos das contas da carteira
  - saldo principal consolidado
  - saldo projetado consolidado