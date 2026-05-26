<!--
Sync Impact Report
- Version change: 1.1.0 -> 1.2.0
- Modified principles:
	- I. Integridade Financeira como Regra Central -> I. Integridade Financeira como Regra Central
	- II. Arquitetura React com Fronteiras Claras de Estado -> II. Arquitetura React com Fronteiras Claras de Estado
	- III. Roteamento e Navegação como Contratos do Produto -> III. Roteamento e Navegação como Contratos do Produto
	- IV. Qualidade com Testes e CI como Gate Inegociável -> IV. Qualidade com Testes e CI como Gate Inegociável
	- V. Segurança, Acessibilidade e Observabilidade por Padrão -> V. Segurança, Acessibilidade e Observabilidade por Padrão
- Added sections:
	- Baseline Tecnológica Aprovada
	- Fluxo de Entrega e Gates de Qualidade
- Removed sections:
	- None
- Templates requiring updates:
	- ⚠ pending: .specify/templates/spec-template.md
	- ⚠ pending: .specify/templates/plan-template.md
	- ⚠ pending: .specify/templates/tasks-template.md
	- ⚠ pending: .github/prompts/speckit.constitution.prompt.md
	- ⚠ pending: .github/prompts/speckit.specify.prompt.md
	- ⚠ pending: .github/prompts/speckit.plan.prompt.md
- Follow-up TODOs:
	- Alinhar os templates do spec-kit para refletir a constitution em português.
-->

# React Finance Platform Constitution

## Core Principles

### I. Integridade Financeira como Regra Central

Todo cálculo monetário, saldo e orçamento MUST ser determinístico, reproduzível e auditável.
Valores financeiros MUST usar aritmética decimal-safe, nunca ponto flutuante binário para
cálculos persistidos ou críticos. Datas MUST ser tratadas com fuso horário explícito.
Qualquer feature que altere saldo MUST declarar invariantes, regras de reconciliação e
comportamento esperado em erro.
Rationale: confiança financeira depende de precisão numérica e rastreabilidade.

### II. Arquitetura React com Fronteiras Claras de Estado

O frontend MUST usar TypeScript em modo strict e separar o estado por responsabilidade:
server state em TanStack Query, form state em React Hook Form e estado global/UI de sessão
em um store mínimo (por exemplo Zustand ou Context quando suficiente). Validação em fronteiras
MUST usar schemas compartilhados, preferencialmente Zod. Componentes MUST permanecer focados
em apresentação sempre que possível, com regras de negócio em hooks ou services.
Rationale: fronteiras explícitas reduzem bugs, simplificam testes e melhoram manutenção.

### III. Roteamento e Navegação como Contratos do Produto

A aplicação MUST usar React Router para toda navegação e orquestração de rotas.
Rotas, parâmetros, guards e error boundaries MUST ser declarados explicitamente e testados.
Visões financeiras protegidas MUST exigir autenticação/autorização antes de renderizar.
Semântica de navegação, incluindo deep links, back/forward e tratamento de 404, MUST permanecer
estável entre versões, salvo nota de migração versionada.
Rationale: navegação previsível é base de confiança e consistência do produto.

### IV. Qualidade com Testes e CI como Gate Inegociável

O trabalho MUST seguir ciclo red-green-refactor para fluxos críticos: escrever teste falhando,
implementar, refatorar. Toda feature MUST incluir testes unitários para lógica de negócio,
testes de integração para interações de estado/roteamento e cobertura end-to-end para jornadas
primárias. CI MUST bloquear merge em falha de typecheck, lint, testes ou build.
Rationale: gates rígidos evitam regressões em fluxos financeiros sensíveis.

### V. Segurança, Acessibilidade e Observabilidade por Padrão

Dados sensíveis MUST ser minimizados no cliente e nunca codificados como segredo. Entradas MUST
ser validadas e sanitizadas nas fronteiras de confiança. Features visíveis ao usuário MUST
atender uma base WCAG 2.2 AA, incluindo navegação por teclado e labels semânticos. Eventos
críticos do usuário e do sistema MUST gerar telemetria estruturada e sinais de erro.
Rationale: software financeiro precisa ser seguro, inclusivo e observável.

## Baseline Tecnológica Aprovada

- Framework: React 19+ com TypeScript strict.
- Roteamento: React Router, com data APIs quando fizer sentido.
- Estado assíncrono: TanStack Query.
- Formulários e validação: React Hook Form + Zod.
- Testes: Vitest + Testing Library para unit/integration, Playwright para end-to-end.
- Qualidade: ESLint + Prettier com configuração compartilhada no repositório.
- UI opcional: Tailwind CSS e bibliotecas headless são permitidas quando reduzirem complexidade
  sem comprometer acessibilidade.
- Qualquer desvio dessa baseline MUST ser justificado no Constitution Check do plano.

## Fluxo de Entrega e Gates de Qualidade

1. Specification-first: toda feature começa com spec, plan e tasks.
2. Design before implementation: contratos de dados, mapa de rotas e ownership de estado MUST
   ser definidos no plan.
3. Vertical slices: priorizar jornadas independentes e testáveis.
4. Mandatory checks before merge: lint, typecheck, tests, build e revisão de compliance com a
   constitution.
5. Release readiness: quickstart e jornadas críticas MUST ser validadas antes de publicar.

## Governance

Esta constitution supersede preferências locais de código para este repositório.
Emendas exigem: (a) proposta explícita em documentação, (b) justificativa e impacto de migração,
e (c) aprovação dos mantenedores do projeto.

Política de versionamento:

- MAJOR para mudanças incompatíveis de governança ou remoções/redefinições de princípios.
- MINOR para novos princípios/seções ou requisitos materialmente expandidos.
- PATCH para clarificações, redação e refinamentos não semânticos.

Expectativas de revisão de compliance:

- Todo plan MUST documentar os gates da constitution e como cada um é satisfeito.
- Todo pull request MUST incluir evidências de que os quality gates obrigatórios passaram.
- Exceções MUST ser temporárias, documentadas e ligadas a follow-up tasks.

**Version**: 1.2.0 | **Ratified**: 2026-05-26 | **Last Amended**: 2026-05-26
