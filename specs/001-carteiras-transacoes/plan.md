# Implementation Plan: Gestão de Carteiras, Contas e Transações

**Branch**: `[001-create-feature-branch]` | **Date**: 2026-05-27 | **Spec**: `specs/001-carteiras-transacoes/spec.md`

**Input**: Feature specification from `specs/001-carteiras-transacoes/spec.md`

## Summary

Construir um frontend React para gestão financeira por carteira (limite de 2 carteiras por usuário), cobrindo CRUD de contas/cartões, transações (entrada, saída, transferência), compartilhamento por e-mail com matriz de permissões e trilha de auditoria, usando dados mockados (MSW + JSON local) e autenticação simulada. O desenho prioriza integridade financeira (saldo principal vs projetado), validações de domínio no cliente e testabilidade em camadas (unit, integration, e2e).

## Technical Context

**Language/Version**: TypeScript 5.x (strict), React 19, Node 20 LTS

**Primary Dependencies**: React, React Router, TanStack Query, React Hook Form, Zod, MSW, decimal.js, date-fns, Zustand (escopo mínimo de UI/session)

**Storage**: N/A (frontend-only); dados em mock (fixtures JSON + handlers MSW)

**Testing**: Vitest + Testing Library (unit/integration), Playwright (e2e)

**Target Platform**: Navegadores modernos (Chrome, Edge, Firefox, Safari)

**Project Type**: Web app frontend-only (SPA)

**Performance Goals**: listagem principal de transações por carteira em <= 2s (cenário padrão mock), interações de formulário com feedback em < 100ms

**Constraints**: sem backend nesta fase; limite rígido de 2 carteiras; transferências sem recorrência; campos condicionais de período (ocultar/limpar/reexibir vazio); contas/cartões inativos não selecionáveis

**Scale/Scope**: 1 app SPA, ~10-14 telas/visões, até 2 carteiras por usuário, centenas de transações mockadas por carteira

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Financial integrity gate: PASS. Estratégia definida com `decimal.js` para cálculos monetários, datas ISO com timezone explícito, e regras de reconciliação para saldo principal/projetado e recálculo por carteira.
- React architecture gate: PASS. Ownership definido: server state via TanStack Query (mesmo com mock), formulários via RHF + Zod, estado global mínimo via Zustand (sessão/filtros/UI).
- Routing contract gate: PASS. Mapa de rotas com guard de autenticação simulada, rotas da carteira por ID, deep-links para visões de contas/cartões/transações/permissões e boundary de erro por árvore de rotas.
- Quality gate: PASS. Estratégia com unit para regras financeiras, integration para fluxos de formulário/estado/roteamento e e2e para jornadas críticas da spec.
- Security/a11y/observability gate: PASS. Sem segredos no cliente, validação de entrada em formulários/schemas, baseline WCAG 2.2 AA e eventos de auditoria/telemetria estruturados para ações críticas.

## Phase 0: Research Plan

Research tasks derivados do contexto técnico:

1. Práticas de `decimal.js` para saldo principal/projetado e recálculo determinístico por carteira.
2. Estratégia de mock com MSW + fixtures para simular contratos de API e estados de erro.
3. Padrão de modelagem de permissões de colaboração por carteira em frontend-only.
4. Boas práticas de roteamento com guards/autorização em React Router.
5. Estratégia de testes para regra de período condicional e exclusões com recálculo financeiro.

Saída desta fase: `research.md` com decisões e alternativas.

## Phase 1: Design & Contracts Plan

1. Derivar entidades, relacionamentos, validações e transições em `data-model.md`.
2. Definir contratos de interface consumidos pela SPA em `contracts/frontend-api.yaml`.
3. Publicar fluxo de execução local com mocks e testes em `quickstart.md`.
4. Atualizar referência de contexto do agente em `.github/copilot-instructions.md` para este plano.
5. Revalidar Constitution Check após os artefatos de design.

Saídas desta fase: `data-model.md`, `contracts/*`, `quickstart.md`, contexto do agente atualizado.

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
│   ├── router/
│   └── providers/
├── pages/
│   ├── wallets/
│   ├── transactions/
│   ├── accounts/
│   ├── cards/
│   └── collaborators/
├── components/
├── features/
│   ├── wallets/
│   ├── transactions/
│   ├── accounts/
│   ├── cards/
│   ├── permissions/
│   └── audit/
├── services/
│   ├── api/
│   └── mock/
├── schemas/
├── hooks/
├── store/
└── utils/

tests/
├── unit/
├── integration/
└── e2e/
```

**Structure Decision**: Aplicação frontend única no root do repositório, com separação por feature + camadas de serviço/esquema para manter fronteiras de estado e facilitar testes.

## Post-Design Constitution Re-Check

- Financial integrity gate: PASS após modelagem de entidades e contratos (saldo principal/projetado + recálculo por carteira explicitados).
- React architecture gate: PASS após definição de ownership no plano e no quickstart.
- Routing contract gate: PASS com rotas e guards definidos no quickstart e contratos.
- Quality gate: PASS com matriz de testes alinhada ao quickstart.
- Security/a11y/observability gate: PASS com eventos auditáveis e baseline de acessibilidade descritos.

## Complexity Tracking

Sem violações da constitution nesta fase de planejamento.
