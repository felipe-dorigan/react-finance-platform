# react-finance-platform

Frontend de uma plataforma financeira construido com React, TypeScript e Vite, guiado por spec-kit.

O foco do projeto e organizar carteiras, contas, cartoes e transacoes com regras de negocio claras, validacao de formularios e cobertura de testes para os fluxos principais.

## Comecar

### Requisitos

- Node.js 20 ou superior
- npm 10 ou superior

### Instalacao

```bash
npm install
```

### Executar localmente

```bash
npm run dev
```

O app fica disponivel em `http://127.0.0.1:5173`.

### Comandos uteis

```bash
npm run build
npm run lint
npm run typecheck
npm run test
```

## Estrutura

- [src/main.tsx](src/main.tsx) inicializa a aplicacao
- [src/app/providers/AppProviders.tsx](src/app/providers/AppProviders.tsx) concentra os providers base
- [specs/001-carteiras-transacoes/plan.md](specs/001-carteiras-transacoes/plan.md) descreve o plano tecnico
- [specs/001-carteiras-transacoes/tasks.md](specs/001-carteiras-transacoes/tasks.md) lista as tarefas por fase

## Documentacao do feature

- [spec.md](specs/001-carteiras-transacoes/spec.md)
- [plan.md](specs/001-carteiras-transacoes/plan.md)
- [research.md](specs/001-carteiras-transacoes/research.md)
- [data-model.md](specs/001-carteiras-transacoes/data-model.md)
- [quickstart.md](specs/001-carteiras-transacoes/quickstart.md)
- [tasks.md](specs/001-carteiras-transacoes/tasks.md)

## Status atual

O scaffold inicial do projeto ja esta pronto. A proxima etapa e a fase foundational, com dominio compartilhado, schemas e base de rotas.
