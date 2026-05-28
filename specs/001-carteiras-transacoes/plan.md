# Implementation Plan: Gestão de Carteiras, Contas e Transações

**Branch**: `001-carteiras-transacoes` | **Date**: 2026-05-28 | **Spec**: [specs/001-carteiras-transacoes/spec.md](specs/001-carteiras-transacoes/spec.md)

**Input**: Feature specification from `specs/001-carteiras-transacoes/spec.md`

## Summary

Implementar frontend React para gestão financeira por carteira (limite de 2), com contas, cartões, transações (entrada/saída/transferência), convites/permissões e auditoria imutável. O plano técnico usa TypeScript strict, validação por schema, cálculo monetário decimal-safe, timezone IANA por carteira (persistência UTC), detecção de duplicidade com confirmação explícita e definição formal de ambiente padrão para medição de p90 e SLA de operações de vínculo.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), React 19+

**Primary Dependencies**: React Router, TanStack Query, React Hook Form, Zod, decimal.js, MSW, Zustand (mínimo)

**Storage**: Mock in-memory (MSW) + projeções derivadas por carteira; trilhas técnicas append-only (`AuditEvent`, `WalletMutationJournal`, `TelemetryEvent`, `ErrorSignal`)

**Testing**: Vitest + Testing Library (UI/integration), validações de contrato com OpenAPI mock

**Target Platform**: Web SPA moderna (desktop e mobile), navegadores Chromium/Firefox/Safari atuais

**Project Type**: Frontend web application (single app)

**Performance Goals**:

- NFR/SC principal: p90 <= 2s em 50 execuções no ambiente padrão
- Operações de vínculo conta-cartão/registro-cartão: <1s por operação no ambiente padrão

**Constraints**:

- Aritmética monetária decimal-safe em todas as mutações e recomputações
- Timezone por carteira (IANA) para regra de negócio; persistência temporal em UTC
- Convites por carteira e isolamento entre carteiras
- Hard-delete remove registros de negócio vinculados sem remover auditoria/trilhas técnicas
- Regra de duplicidade vale para criação e edição; em edição só dispara se mudar valor, data, tipo ou vínculo principal (conta/cartão)

**Scale/Scope**:

- Até 2 carteiras por usuário
- US1/US2/US3 completas com baseline mínimo de 7 frentes de teste de interface
- Fluxo inicial orientado a mock API e contratos em `contracts/frontend-api.yaml`

## Ambiente Padrão (Definição Formal)

Referência oficial para benchmarks, regressões e validação de SLA:

- OS: Windows 11 23H2 (referência), equivalente aceito: Ubuntu 22.04 LTS/macOS 14
- Runtime: Node.js 20 LTS, npm 10+
- Navegador de medição: Chrome 125 headless (CI) e Chrome estável local
- CPU/RAM de referência: 4 vCPU e 8 GB RAM
- Rede de teste: latência local <= 20 ms, sem throttling
- Dataset padrão de carteira:
  - 2 contas ativas + 1 conta inativa
  - 2 cartões ativos vinculados
  - 200 transações totais (effective + pending), incluindo transferências
  - 30 despesas de cartão e 10 estornos
- Metodologia de medição:
  - 50 execuções por jornada
  - descarte das 5 primeiras como warm-up
  - p90 calculado sobre 45 execuções válidas

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Financial integrity gate: PASS. Modelagem define `decimal.js`, saldos principal/projetado, timezone IANA da carteira e persistência UTC.
- React architecture gate: PASS. Ownership definido: server state (TanStack Query), form state (RHF), UI/global mínimo (Zustand/Context), validação com Zod.
- Routing contract gate: PASS. Rotas por carteira (`/wallets/:walletId/*`), guardas de auth/role e error boundaries segmentadas.
- Quality gate: PASS. Estratégia inclui baseline mínimo obrigatório de interface + testes de integração das jornadas críticas.
- Security/a11y/observability gate: PASS. Escopo de permissão por carteira, baseline WCAG 2.2 AA documentada e telemetria/sinais de erro separados da auditoria.

## Phase 0 - Research Output

Arquivo gerado/atualizado: [specs/001-carteiras-transacoes/research.md](specs/001-carteiras-transacoes/research.md)

Resumo do que foi consolidado:

- Estratégia monetária e reconciliação determinística por carteira
- Estratégia de auditoria imutável com `changedFields`
- Terminologia oficial de permissões (produto vs enum técnico)
- Regras para despesas de cartão sem violar FR-004A
- Detecção de duplicidade com confirmação explícita, incluindo regra de acionamento na edição
- Definição formal de ambiente padrão para performance/SLA

## Phase 1 - Design & Contracts Output

Arquivos gerados/atualizados:

- [specs/001-carteiras-transacoes/data-model.md](specs/001-carteiras-transacoes/data-model.md)
- [specs/001-carteiras-transacoes/contracts/frontend-api.yaml](specs/001-carteiras-transacoes/contracts/frontend-api.yaml)
- [specs/001-carteiras-transacoes/quickstart.md](specs/001-carteiras-transacoes/quickstart.md)

Design decisions aplicadas:

- `Wallet.timezone` como campo obrigatório de domínio
- Despesa de cartão listada junto da visão geral com filtro por cartão
- Pagamento de despesa de cartão marca como paga e debita conta escolhida
- Resposta de API para duplicidade com bloqueio e confirmação explícita
- Em edição, detector de duplicidade só dispara quando campos-chave forem alterados

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
│   ├── transactions/
│   ├── accounts/
│   ├── cards/
│   ├── permissions/
│   ├── audit/
│   └── observability/
├── services/
│   ├── api/
│   └── mock/
└── schemas/

tests/
├── integration/
└── unit/
```

**Structure Decision**: SPA frontend única no repositório raiz, com arquitetura por feature e contratos mock-first para habilitar implementação incremental sem backend real.

## Post-Design Constitution Check

- Financial integrity gate: PASS após inclusão de timezone por carteira no modelo e contratos.
- React architecture gate: PASS com fronteiras de estado e validação mantidas.
- Routing contract gate: PASS com rota canônica por carteira preservada no quickstart.
- Quality gate: PASS com ambiente padrão formal e métricas objetivas de aceite.
- Security/a11y/observability gate: PASS com separação explícita entre auditoria e observabilidade.

## Complexity Tracking

Sem violações da constitution identificadas nesta fase.
