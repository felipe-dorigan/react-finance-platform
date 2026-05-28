# Research: Gestao de Carteiras, Contas e Transacoes

## 1) Calculo monetario e reconciliacao de saldos

Decision: Usar `decimal.js` para toda operacao monetaria e armazenar valores como string decimal no estado/apis mock.

Rationale: Evita erros de ponto flutuante em somas/subtracoes repetidas, especialmente no recalculo apos hard-delete.

Alternatives considered: `number` nativo (rejeitado por imprecisao), `bigint` (rejeitado por complexidade com casas decimais), `dinero.js` (viavel, mas excede escopo inicial).

## 2) Modelagem de saldo principal vs saldo projetado

Decision: Manter dois agregadores por carteira: `mainBalance` (somente `effective`) e `projectedBalance` (`effective` + `pending`).

Rationale: Reflete FR-016/017/018 com regra deterministica por status.

Alternatives considered: Um unico saldo com filtros dinamicos (rejeitado por ambiguidade e risco de inconsistencia).

## 3) Estrategia de auditoria transversal por dominio

Decision: Adotar um contrato unico de `AuditEvent` para cinco dominios: conta, cartao, transacao, convite e permissao.

Rationale: Garante cobertura uniforme de FR-014/FR-014A e reduz lacunas entre modulos.

Alternatives considered: Logs independentes por dominio (rejeitado por dificuldade de consulta consolidada e risco de schema divergente).

Escopo minimo de acoes auditadas:

- Conta: criar, editar, arquivar, reativar, excluir.
- Cartao: criar, editar, arquivar, reativar, excluir, alterar conta de debito.
- Transacao: criar, editar, excluir, alterar status `effective`/`pending`.
- Convite: enviar, reenviar, revogar, aceitar.
- Permissao: alterar nivel de acesso.

Campos obrigatorios por evento:

- `walletId`
- autoria (`actorUserId` ou email)
- `actorRole`
- `action`
- `entityType` + `entityId`
- `timestamp`
- `changedFields` estruturado quando aplicavel

## 4) Terminologia de permissoes (unificada)

Decision: Canonizar nomenclatura de produto em portugues e manter enum tecnico interno.

Rationale: Evita ambiguidade entre UX, regra de negocio e contrato de API.

Alternatives considered: Expor apenas nomes tecnicos (`read/edit/operate`) na UI (rejeitado por baixa clareza para usuario final).

Mapa oficial:

- `leitura` -> `read`
- `leitura+edicao` -> `edit`
- `acesso_total_operacional` -> `operate`

## 5) Roteamento e protecao de rotas

Decision: Rotas por carteira (`/wallets/:walletId/...`) com guardas de autenticacao, autorizacao por papel e error boundaries por segmento.

Rationale: Suporta deep-link estavel e bloqueios de acesso previsiveis.

Alternatives considered: Checagem de permissao apenas no carregamento inicial (rejeitado por fragilidade em navegacao interna).

## 6) Formularios e validacao de dominio

Decision: RHF + Zod com validacao condicional de transacao: `transfer` sempre sem `period`; alternancia para `income/expense` reexibe `period` vazio.

Rationale: Atende FR-019/FR-020/FR-020B e impede payload inconsistente.

Alternatives considered: Validacao apenas no submit (rejeitado por UX inconsistente e maior risco de regressao).

## 7) Estrategia de testes minima de interface

Decision: Adotar baseline minimo com sete frentes obrigatorias de teste de interface: (1) renderizacao de telas criticas, (2) validacao de formulario, (3) fluxo feliz de criacao de transacao, (4) regra visual de transferencia, (5) estados loading/empty/error, (6) protecao basica de permissao na UI, (7) regressao de calculo exibido em resumo/lista.

Rationale: Alinha spec e constitution 2.1.0 com um gate enxuto de qualidade focado no que o usuario percebe em tela.

Alternatives considered: Suite ampla por camadas (unit/integration/contract/E2E) como obrigatoria de merge (rejeitado por custo de execucao e por nao refletir a decisao atual de escopo minimo).

Plano de evidencia:

- Testes de interface cobrindo as sete frentes minimas em componentes/telas criticas.
- Assert de validacao por campo com bloqueio de submit invalido.
- Assert de atualizacao visual de resumo/lista apos mutacao.

## 8) Acessibilidade e observabilidade fora do gate minimo

Decision: Manter acessibilidade e observabilidade como diretrizes de implementacao e boas praticas de produto, sem torná-las parte obrigatoria do gate minimo de testes definido nesta fase.

Rationale: Preserva qualidade arquitetural sem conflitar com a decisao de baseline de testes minimo.

Alternatives considered: Tornar a11y/observabilidade obrigatorias no gate desta fase (rejeitado por desalinhamento com a clarificacao recente da spec).

## 9) Arquitetura de observabilidade

Decision: Separar observabilidade em dois fluxos distintos: telemetria estruturada para eventos de uso e desempenho, e sinais de erro para falhas recuperáveis e não recuperáveis. Ambos carregam contexto de rota, carteira e sessão, mas nunca misturam payload operacional de negócio com trilha de auditoria.

Rationale: Telemetria e auditoria têm finalidades diferentes. A telemetria mede comportamento e saúde do fluxo; a auditoria prova responsabilidade sobre mutações de negócio. Separar esses fluxos reduz ruído, facilita retenção e evita acoplamento entre métricas operacionais e histórico financeiro imutável.

Alternatives considered: Auditoria única para tudo (rejeitada por excesso de ruído e dificuldade de retenção), console logging ad hoc (rejeitado por baixa rastreabilidade) e sinais de erro sem contexto de carteira/rota (rejeitado por diagnóstico fraco).

Contrato mínimo proposto:

- `TelemetryEvent`: `eventName`, `category`, `walletId?`, `route`, `sessionId`, `correlationId`, `occurredAt`, `properties` sanitizadas.
- `ErrorSignal`: `source`, `errorCode`, `message`, `severity`, `walletId?`, `route`, `sessionId`, `correlationId`, `occurredAt`, `stack?` sanitizado.

Regras:

- Nunca registrar segredo, token ou dado sensível em telemetria.
- Toda falha que aciona UI de erro deve gerar sinal observável correlacionável.
- Os logs de auditoria permanecem separados e imutáveis.

## 10) Persistência e imutabilidade

Decision: Adotar modelo híbrido: hard-delete remove registros de negócio vinculados das coleções operacionais da carteira (conforme FR-025/FR-026), enquanto journal, auditoria e observabilidade permanecem append-only e imutáveis.

Rationale: O domínio precisa cumprir exclusão definitiva de negócio sem perder trilha de responsabilidade e diagnóstico. Separar estado operacional (mutável para hard-delete) de trilhas técnicas (imutáveis) resolve a ambiguidade entre FR-025/FR-026 e FR-014A.

Alternatives considered: Atualização in-place de tabelas mutáveis (rejeitada por perda de rastreabilidade), soft-delete como única estratégia (rejeitada porque não cobre hard-delete exigido), e guardar apenas o estado final atual (rejeitado por não permitir recálculo confiável).

Modelo mínimo de persistência:

- `WalletMutationJournal`: registro append-only de mutações de conta, cartão, transação, convite e permissão.
- `WalletSnapshot`: projeção derivada de saldos e totais por carteira.
- `AuditEvent`: trilha imutável de responsabilidade sobre ações auditáveis.

Regras:

- Nenhum evento de auditoria, telemetria ou erro é apagado por exclusão de registros de negócio.
- Hard-delete remove registros vinculados de conta/cartão/transação/refund na camada operacional e registra mutação de exclusão no journal.
- Recalcular a carteira atual significa recompor as projeções a partir do journal e do estado operacional remanescente, sem alterar fatos técnicos anteriores.
- Snapshot é derivado, não fonte de verdade.
