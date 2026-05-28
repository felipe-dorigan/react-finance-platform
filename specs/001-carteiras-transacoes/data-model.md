# Data Model: Gestao de Carteiras, Contas e Transacoes

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
- mainBalance: string (decimal, derived projection)
- projectedBalance: string (decimal, derived projection)
- createdAt: string
- updatedAt: string

Regras:

- Máximo de 2 carteiras por ownerId.
- Excluir carteira não faz parte das permissões de convidado.
- Os saldos exibidos são projeções derivadas do journal de mutações.

### WalletPermission

- id: string (uuid)
- walletId: string (Wallet.id)
- invitedEmail: string (email)
- role: "read" | "edit" | "operate" (enum tecnico)
- roleLabel: "leitura" | "leitura+edicao" | "acesso_total_operacional" (rotulo canonico de produto)
- invitedByUserId: string (User.id)
- createdAt: string
- updatedAt: string

Regras:

- E-mail convidado único por carteira.
- Alterar convite existente atualiza role, não cria duplicado.
- Terminologia de interface MUST usar roleLabel; payload tecnico mantém role.

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
- actorUserId: string | null (User.id)
- actorEmail: string | null
- actorRole: "owner" | "read" | "edit" | "operate"
- action: string
- entityType: "account" | "card" | "transaction" | "invite" | "permission"
- entityId: string
- changedFields: array<ChangedField> | null
- metadata: object | null
- occurredAt: string (ISO-8601)

### ChangedField

- field: string
- from: string | number | boolean | null
- to: string | number | boolean | null

Regras:

- Imutável.
- Não é removido quando registros de negócio são excluídos.
- Para `action` de edição, mudança de status e alteração de permissão, `changedFields` é obrigatório.
- Deve existir correlação determinística entre a ação executada e um único AuditEvent emitido.

### WalletMutationJournal

- id: string (uuid)
- walletId: string (Wallet.id)
- actorUserId: string | null (User.id)
- actorEmail: string | null
- actorRole: string
- action: string
- entityType: string
- entityId: string
- payload: object | null
- previousVersion: number | null
- resultingVersion: number
- occurredAt: string (ISO-8601)

Regras:

- Append-only.
- Fonte de verdade para recomputar projeções da carteira.
- Hard-delete registra entrada de exclusão/cascata sem reescrever entradas anteriores.

### WalletSnapshot

- id: string (uuid)
- walletId: string (Wallet.id)
- version: number
- mainBalance: string (decimal)
- projectedBalance: string (decimal)
- totals: object
- computedAt: string (ISO-8601)

Regras:

- Derivado do WalletMutationJournal.
- Pode ser recriado a qualquer momento.
- Não é editado manualmente.

### TelemetryEvent

- id: string (uuid)
- walletId: string | null (Wallet.id)
- sessionId: string
- correlationId: string
- route: string
- eventName: string
- category: string
- properties: object | null
- occurredAt: string (ISO-8601)

Regras:

- Não conter segredos nem dados sensíveis.
- Separado da auditoria de negócio.
- Usado para medir comportamento e desempenho do fluxo.

### ErrorSignal

- id: string (uuid)
- walletId: string | null (Wallet.id)
- sessionId: string
- correlationId: string
- route: string
- source: string
- errorCode: string
- message: string
- severity: "info" | "warning" | "error" | "critical"
- stack: string | null
- occurredAt: string (ISO-8601)

Regras:

- Deve ser sanitizado antes de persistir.
- Deve permitir correlação com rota e carteira afetadas.
- Não substitui auditoria de mutação.

## Relacionamentos

- User 1:N Wallet (como dono)
- Wallet 1:N WalletPermission
- Wallet 1:N Account
- Wallet 1:N Card
- Wallet 1:N Transaction
- Wallet 1:N AuditEvent
- Wallet 1:N WalletMutationJournal
- Wallet 1:N WalletSnapshot
- Wallet 1:N TelemetryEvent
- Wallet 1:N ErrorSignal
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

Mapeamento de exibição:

- read = leitura
- edit = leitura+edicao
- operate = acesso_total_operacional

### AuditEvent

- created -> immutable (sem atualização ou exclusão)

## Regras de Recalculo

- Escopo sempre por carteira atual.
- Exclusão definitiva de conta remove entradas/saídas/transferências onde a conta é origem/destino.
- Exclusão definitiva de cartão remove despesas e estornos vinculados.
- Após exclusões, recomputar:
  - saldos das contas da carteira
  - saldo principal consolidado
  - saldo projetado consolidado

## Regras de Persistência

- `WalletMutationJournal` é append-only e representa o histórico técnico reconstruível da carteira.
- `WalletSnapshot` é sempre derivado do journal e pode ser recalculado.
- `TelemetryEvent` e `ErrorSignal` são trilhas observáveis separadas da auditoria e também permanecem imutáveis.
- Hard-delete remove registros de negócio vinculados (contas/cartões/transações/estornos afetados) da visão operacional da carteira atual.
- Hard-delete nunca apaga fatos anteriores de `AuditEvent`, `WalletMutationJournal`, `TelemetryEvent` ou `ErrorSignal`.

## Dicionario de Acoes Auditaveis (FR-014)

- account.created
- account.updated
- account.archived
- account.unarchived
- account.deleted
- card.created
- card.updated
- card.archived
- card.unarchived
- card.deleted
- card.debit_account_changed
- transaction.created
- transaction.updated
- transaction.deleted
- transaction.status_changed
- invite.sent
- invite.resent
- invite.revoked
- invite.accepted
- permission.changed
