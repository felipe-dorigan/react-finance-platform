# Quickstart: Frontend React com Mock de Dados

## Pré-requisitos

- Node.js 20+
- npm 10+

## Setup inicial (quando iniciar implementação)

1. Criar app React + TypeScript strict (Vite).
2. Instalar dependências base:
   - react-router-dom
   - @tanstack/react-query
   - react-hook-form
   - zod
   - msw
   - decimal.js
   - date-fns
   - zustand
3. Configurar lint/typecheck/testes:
   - ESLint + Prettier
   - Vitest + Testing Library
   - Playwright

4. Configurar a persistência mockada em modelo híbrido: hard-delete em registros de negócio da carteira + trilhas técnicas append-only (journal, auditoria, telemetria e erro).

## Estrutura mínima esperada

- src/app/router
- src/features/{wallets,transactions,accounts,cards,permissions,audit}
- src/services/{api,mock}
- src/schemas
- tests/{unit,integration,e2e}

## Fluxo de execução local

1. Iniciar MSW no bootstrap da aplicação.
2. Carregar sessão mock autenticada.
3. Navegar em rota padrão de carteira (`/wallets/:walletId/dashboard`).
4. Validar jornadas críticas:
   - Cadastro de conta/cartão
   - Entrada, saída e transferência
   - Convite por e-mail e troca de permissão
   - Bloqueios de exclusão e recálculo
   - Emissão de telemetria estruturada e sinais de erro em falhas simuladas

## Validacao minima obrigatoria de interface

Executar e registrar evidencias para os sete testes minimos obrigatorios:

1. Renderizacao das telas criticas

- dashboard, lista de transacoes e formularios carregam sem erro.

2. Validacao de formulario

- campos obrigatorios, formato de e-mail, valor numerico valido e datas validas;
- mensagens de erro por campo;
- bloqueio de envio invalido.

3. Fluxo feliz de criacao de transacao

- criar entrada e saida com sucesso;
- exibir feedback visual de sucesso.

4. Regra visual de transferencia

- ao selecionar transferencia, `period` deve ser ocultado e limpo;
- ao voltar para entrada/saida, `period` deve voltar vazio.

5. Estados loading/empty/error

- lista exibe carregamento;
- empty state quando sem dados;
- mensagem de erro quando API falha.

6. Protecao basica de permissao na UI

- usuario sem permissao nao deve ver acao restrita ou deve receber bloqueio visual claro.

7. Regressao de calculo exibido

- apos submissao valida no formulario, resumo e lista devem refletir os novos calculos.

## Validacao complementar de auditoria (FR-014)

1. Confirmar para cada acao auditavel principal:
   - evento emitido com `walletId`, autoria, `actorRole`, `action`, `entityType`, `entityId`, `occurredAt`;
   - `changedFields` presente quando houver edicao, mudanca de status ou mudanca de permissao.
2. Validar que hard-delete de negocio nao remove registros de auditoria ja emitidos.

## Validacao complementar de observabilidade e imutabilidade

1. Simular eventos de uso nos fluxos principais e confirmar que a telemetria e separada da auditoria.
2. Forcar erros para verificar emissao de `ErrorSignal` com contexto minimo.
3. Confirmar que hard-delete e arquivamento nao removem trilhas tecnicas ja emitidas.
4. Reexecutar projecao da carteira apos hard-delete e validar saldos.

## Validacao complementar de acessibilidade

Executar verificacoes de teclado/foco/semantica como qualidade adicional recomendada, sem bloquear o gate minimo definido para esta fase.

## Terminologia oficial de permissao

- leitura (interno: `read`)
- leitura+edicao (interno: `edit`)
- acesso_total_operacional (interno: `operate`)

## Critérios de pronto para implementação

- Contrato de API mock definido em `contracts/frontend-api.yaml`.
- Data model aprovado em `data-model.md`.
- Estrategia de testes alinhada ao baseline minimo de interface da constitution 2.1.0.
- Cobertura minima de interface definida e validavel.
- Estrategia de auditoria e observabilidade definida como validacao complementar.
- Regras de hard-delete operacional e trilhas tecnicas append-only definidas para exclusao/arquivamento.

## Comandos esperados (alvo)

- `npm run dev`
- `npm run test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
