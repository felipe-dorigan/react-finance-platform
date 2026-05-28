# Implementation Plan: Gestão de Carteiras, Contas e Transações

**Branch**: `001-create-feature-branch` | **Date**: 2026-05-28 | **Spec**: [specs/001-carteiras-transacoes/spec.md](specs/001-carteiras-transacoes/spec.md)

**Input**: Feature specification from [specs/001-carteiras-transacoes/spec.md](specs/001-carteiras-transacoes/spec.md)

## Summary

Implementar uma SPA React para gestão financeira por carteira (limite de 2), cobrindo contas, cartões, transações, permissões por convite e auditoria imutável, com recálculo determinístico por carteira e baseline mínimo obrigatório de testes de interface definido na spec e na constitution 2.1.0.

## Technical Context

**Language/Version**: TypeScript strict com React 19+

**Primary Dependencies**: Vite, React Router, TanStack Query, React Hook Form, Zod, MSW, decimal.js, date-fns, Zustand, Vitest, Testing Library

**Storage**: Persistência mockada no cliente por carteira, com camada operacional mutável (hard-delete de negócio) e trilhas técnicas append-only (`WalletMutationJournal`, `AuditEvent`, `TelemetryEvent`, `ErrorSignal`)

**Testing**: Baseline mínimo de testes de interface: renderização de telas críticas, validação de formulário, fluxo feliz de transação, regra visual de transferência, estados loading/empty/error, proteção de permissão na UI e regressão de cálculo exibido

**Target Platform**: Aplicação web SPA

**Project Type**: web application

**Performance Goals**: UI estável com feedback imediato de formulário e atualização de resumo/lista após mutações

**Constraints**: aritmética decimal-safe, recálculo restrito à carteira atual, separação entre auditoria e observabilidade, validação de fronteira com schema, política de testes mínimos da constitution 2.1.0

**Scale/Scope**: até 2 carteiras por usuário, múltiplas contas/cartões por carteira, matriz de permissões (`read`, `edit`, `operate`), auditoria de mutações e visão consolidada financeira

## Routing Outline

- `/wallets/:walletId/dashboard` para visão consolidada e indicadores de saldo.
- `/wallets/:walletId/transactions` para entradas/saídas/transferências.
- `/wallets/:walletId/accounts` para gestão de contas e estados ativo/inativo.
- `/wallets/:walletId/cards` para gestão de cartões e conta de débito vinculada.
- `/wallets/:walletId/permissions` para convites e permissões por e-mail.
- `/wallets/:walletId/settings` para gestão de itens arquivados.
- `/wallets/:walletId/audit` para trilha de auditoria imutável.

Regras de navegação:

- autenticação antes de rotas de carteira;
- guarda por papel para ações restritas;
- error boundaries por segmento de carteira;
- deep links preservando `walletId` com fallback seguro quando acesso for negado.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Pre-Phase 0:

- Financial integrity gate: PASS. Modelo de saldo principal/projetado e recálculo por carteira estão definidos com `decimal.js` e regras de status.
- React architecture gate: PASS. Ownership de estado definido (`TanStack Query` server state, `RHF` form state, store mínimo para UI/sessão) e validação por Zod.
- Routing contract gate: PASS. Mapa de rotas com guardas, boundaries e deep links por `walletId` documentado.
- Quality gate: PASS. Estratégia de testes alinhada à constitution 2.1.0 com baseline mínimo de interface e gate obrigatório em CI.
- Security/a11y/observability gate: PASS. Sanitização nas fronteiras, segregação auditoria x observabilidade e emissões correlacionáveis por rota/carteira/sessão.

Post-Phase 1 re-check:

- PASS mantido. `research.md`, `data-model.md`, `quickstart.md` e `contracts/frontend-api.yaml` permanecem consistentes com os princípios I-V e com a política de testes mínimos de interface.

## Project Structure

### Documentation (this feature)

```text
specs/001-carteiras-transacoes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── frontend-api.yaml
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   └── router/
├── features/
│   ├── wallets/
│   ├── accounts/
│   ├── cards/
│   ├── transactions/
│   ├── invitations/
│   ├── permissions/
│   ├── audit/
│   ├── observability/
│   └── persistence/
├── schemas/
├── services/
│   ├── api/
│   └── mock/
├── shared/
└── store/

tests/
├── integration/
└── unit/
```

**Structure Decision**: arquitetura de frontend único em React com separação por domínio em `src/features`, contrato mock em `specs/001-carteiras-transacoes/contracts/frontend-api.yaml` e foco de validação em testes de interface mínimos definidos na spec.

## Phase Outputs

- Phase 0 (Research): atualizar decisões para refletir baseline mínimo de testes de interface e remover obrigações de suítes mais amplas como requisito de gate.
- Phase 1 (Design): manter modelo de dados e contrato da API; ajustar quickstart para execução e evidência dos sete testes mínimos de interface.
- Agent context: referência de plano em [.github/copilot-instructions.md](.github/copilot-instructions.md) permanece correta para [specs/001-carteiras-transacoes/plan.md](specs/001-carteiras-transacoes/plan.md).

## Complexity Tracking

Nenhuma violação ativa de constitution exige exceção nesta fase.
