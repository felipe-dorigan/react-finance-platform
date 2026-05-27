# Research: Gestão de Carteiras, Contas e Transações

## 1) Cálculo monetário e reconciliação de saldos

Decision: Usar `decimal.js` para toda operação monetária e armazenar valores como string decimal no estado da aplicação.

Rationale: Evita erros de ponto flutuante em somas/subtrações repetidas, especialmente no recálculo após exclusões e em transferências com rastreabilidade.

Alternatives considered: `number` nativo (rejeitado por imprecisão); `bigint` (rejeitado por não lidar com casas decimais sem camada extra);
`dinero.js` (viável, mas com curva maior para o escopo inicial).

## 2) Modelagem de saldo principal vs saldo projetado

Decision: Manter dois agregadores por carteira: `mainBalance` (somente Efetivada) e `projectedBalance` (Efetivada + Pendente).

Rationale: Reflete diretamente FR-016/017/018 e reduz ambiguidade na UI. Regras de reconciliação ficam determinísticas por status.

Alternatives considered: Um único saldo com filtros dinâmicos (rejeitado por risco de inconsistência perceptiva e cálculos duplicados na UI).

## 3) Estratégia de mock de API

Decision: Usar MSW com fixtures JSON versionadas por cenário (`happy-path`, `permission-denied`, `validation-errors`, `recalculation`).

Rationale: Permite simular latência, erros e respostas consistentes sem backend real, mantendo contrato de API estável para futura integração.

Alternatives considered: Mock local em memória sem interceptação HTTP (mais simples, porém menos aderente ao fluxo real de integração).

## 4) Permissões colaborativas por carteira

Decision: Definir matriz de permissões no frontend com `role` por convite (`read`, `edit`, `operate`) e guardas centralizados em helpers.

Rationale: Evita regras espalhadas em componentes e facilita testes de autorização por ação.

Alternatives considered: Regras inline por componente (rejeitado por duplicação e risco de divergência de comportamento).

## 5) Roteamento e proteção de rotas

Decision: Organizar rotas por carteira (`/wallets/:walletId/...`) com autenticação simulada, guard de acesso por role e error boundaries por segmento.

Rationale: Suporta deep-link, back/forward estável e tratamento explícito de acesso negado/404.

Alternatives considered: Checagem de permissão apenas no carregamento de página (rejeitado por fragilidade em navegação interna).

## 6) Formulários e validação de domínio

Decision: RHF + Zod com validação condicional para transação: se tipo `transfer`, ocultar e limpar `period`; ao voltar para `income/expense`, exibir `period` vazio.

Rationale: Atende FR-019/020/020A/020B com previsibilidade de estado e bloqueio de payload inválido.

Alternatives considered: Apenas validação no submit sem controle de estado do campo (rejeitado por UX inconsistente).

## 7) Estratégia de testes

Decision: 
- Unit: cálculos de saldo, recálculo pós-exclusão, validações de estorno e regras de permissão.
- Integration: formulários + roteamento + store/query + handlers MSW.
- E2E: jornadas P1/P2/P3 da spec com dados mockados.

Rationale: Cobertura alinhada aos gates de qualidade da constitution para fluxos financeiros críticos.

Alternatives considered: Somente e2e (rejeitado por custo/manutenção) ou somente unit (rejeitado por baixa confiança em integrações).