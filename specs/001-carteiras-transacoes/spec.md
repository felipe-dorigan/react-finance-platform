# Feature Specification: Gestão de Carteiras, Contas e Transações

**Feature Branch**: `001-carteiras-transacoes`

**Created**: 2026-05-26

**Status**: Pronto para implementação

**Input**: User description: "quero coinstruir uma interface para gerenciar, transações (entradas, saídas, transferencia), contas (crud), quero que o usuario possa incluir mais de uma carteira (nome que irei chamar. A carteira é onde ele vai visualizar toda a operação financeira daquela carteira, ele poderá ter apenas duas carteiras. Ele pode definir um email de outra pessoa, que terá acesso a carteira especifica), vai ter cadastros de cartões. Cada transação vai ter um status (Efetivada, Pendente), vai ter um periodo(Diário, Semanal, Mensal e Anual)."

## Clarifications

### Session 2026-05-27

- Q: Como transações pendentes impactam o saldo? -> A: Transações pendentes alteram somente o saldo projetado; o saldo principal é alterado apenas quando a transação for efetivada.
- Q: Quais ações cada nível de permissão do convidado pode executar? -> A: Leitura só visualiza; Leitura+edição cria/edita transações, contas e cartões sem exclusão; Acesso total inclui exclusão de transações/contas/cartões e gestão de convites/permissões, mas nunca exclusão da carteira.
- Q: Recorrência deve se aplicar também a transferências? -> A: Não. Recorrência aplica-se somente a entradas e saídas; transferências são sempre pontuais e o campo de período deve ficar oculto no formulário ao selecionar transferência.
- Q: Como deve funcionar arquivamento e exclusão de contas/cartões? -> A: Contas e cartões podem ficar inativos (arquivados) para sair das telas principais e aparecer em aba de configurações com status ativo/inativo. Enquanto inativos, mantêm histórico e valores, mas não podem ser usados em novas transações. Exclusão é definitiva e remove registros vinculados, com recálculo financeiro.
- Q: Quais regras adicionais de vínculo entre conta e cartão? -> A: Cartão precisa de conta de débito vinculada; o usuário pode alterar a conta de débito. Conta com cartão vinculado não pode ser excluída. Ao excluir cartão, removem-se despesas e estornos vinculados. Ao excluir conta, removem-se entradas, saídas e transferências vinculadas e o sistema recalcula os saldos.
- Q: Quais ações entram em auditoria? -> A: Todas as ações de CRUD de conta/cartão, criação/edição/exclusão de transações, mudanças de status Efetivada/Pendente, convites de colaboração e alterações de permissão devem gerar auditoria.
- Q: Como o campo de período deve reagir ao alternar o tipo de transação? -> A: Para transferência, o campo fica oculto e limpo. Ao voltar para entrada/saída, o campo é exibido vazio para nova definição.
- Q: Qual escopo do recálculo após exclusão definitiva? -> A: O recálculo afeta somente a carteira atual, abrangendo todos os pontos que dependiam da conta/cartão excluído, incluindo saldos das contas e consolidado geral da carteira, sem interferir em outras carteiras.
- Q: Qual regra final para arquivamento versus exclusão? -> A: Opção B confirmada. Arquivamento preserva histórico; exclusão definitiva remove registros vinculados e recalcula a carteira afetada.
- Q: O que acontece com logs de auditoria quando registros de negócio são excluídos? -> A: Logs de auditoria permanecem imutáveis e não são excluídos junto com os registros de negócio.
- Q: Ao excluir conta definitivamente, como tratar transferências vinculadas? -> A: Opção B confirmada. Excluir entradas, saídas e transferências em que a conta era origem ou destino.
- Q: Qual critério formal de desempenho para SC-005? -> A: Opção B confirmada. Aprovar se p90 <= 2s em 50 execuções no ambiente padrão.
- Q: Qual escopo mínimo obrigatório da visualização consolidada (FR-015)? -> A: Opção B confirmada. Exibir saldo principal, saldo projetado, total de entradas, total de saídas e total de transferências no período selecionado.
- Q: Como resolver a duplicação entre FR-020 e FR-020A? -> A: Opção A confirmada. Consolidar em um único requisito: ao selecionar transferência, o campo de período deve ser limpo e oculto.
- Q: Como definir formalmente a consistência de histórico financeiro no FR-002? -> A: Opção B confirmada. Arquivamento não altera lançamentos históricos; hard-delete remove vínculos permitidos e dispara recálculo completo da carteira atual.
- Q: Qual detalhamento mínimo obrigatório deve constar em cada evento de auditoria? -> A: Cada evento de auditoria deve registrar walletId, autor (actorUserId ou e-mail), papel do autor (owner/read/edit/operate), ação exata, entidade afetada (entityType + entityId), timestamp e resumo estruturado das mudanças (changedFields) quando houver edição, mudança de status ou alteração de permissão.
- Q: Qual cobertura mínima de acessibilidade deve ser obrigatória nas jornadas US1, US2 e US3? -> A: US1, US2 e US3 devem garantir navegação 100% por teclado, ordem de foco visível e lógica, labels programáticos em todos os campos e ações, mensagens de erro associadas ao campo e anunciadas, contraste mínimo WCAG 2.2 AA e, quando houver modais ou confirmações, aprisionamento de foco com retorno ao elemento de origem ao fechar.

### Session 2026-05-28

- Q: Qual identificador canônico deve ser usado para referência de branch/feature na documentação? -> A: Canonicalizar como 001-carteiras-transacoes em spec/plan/tasks e referências documentais.
- Q: Em edição de transação/despesa, como aplicar a regra de duplicidade? -> A: Aplicar detector em edição somente quando valor, data, tipo ou vínculo principal (conta/cartão) forem alterados; se houver possível duplicidade, bloquear salvamento automático e exigir confirmação explícita.
- Q: Qual baseline mínimo de testes de interface deve ser adotado para a feature? -> A: Adotar sete frentes mínimas: renderização de telas críticas, validação de formulário, fluxo feliz de criação de transação, regra visual de transferência, estados de loading/empty/error, proteção básica de permissão na UI e regressão de cálculo exibido na tela.
- Q: A validação de formulário continua obrigatória dentro do baseline mínimo? -> A: Sim. A validação de formulário permanece obrigatória, incluindo campos obrigatórios, formato de e-mail, valor numérico válido, datas válidas, mensagens de erro por campo e bloqueio de envio inválido.
- Q: Como alinhar o critério formal de desempenho após a redefinição do SC-005? -> A: O critério de p90 <= 2s em 50 execuções passa a ser rastreado por NFR-005 e SC-008; SC-005 permanece reservado aos estados de loading, empty state e erro de API.
- Q: Como explicitar a visualização de vínculo entre transações, contas e cartões? -> A: Ao abrir transação de transferência, a interface deve mostrar claramente a conta de origem e a conta de destino. Transações são permitidas apenas para contas; na tela do cartão devem ser listados todos os registros vinculados ao cartão, incluindo despesas e créditos.
- Q: Qual tempo máximo para processar operações de vínculo? -> A: O sistema deve processar operações de vínculo em menos de 1 segundo.
- Q: Existe cobertura de testes fora do baseline mínimo a declarar como fora de escopo? -> A: Não. Todos os critérios de cobertura desta rodada devem ser aplicados na spec atual.
- Q: Qual regra oficial de timezone deve valer para cálculo de período, vencimento/recorrência e timestamp de auditoria? -> A: Usar timezone da carteira (IANA) para regras de negócio; armazenar timestamps em UTC e converter na exibição.
- Q: Como a plataforma deve modelar despesas de cartão sem violar o FR-004A (cartão não é origem/destino direto)? -> A: Despesas de cartão aparecem na listagem de despesas geral, podem ser filtradas por cartão, e quando pagas ficam com status paga, debitam a conta escolhida pelo usuário e permanecem no histórico.
- Q: Quando o sistema detectar possível transação/despesa duplicada (mesmo valor, data, tipo e vínculo de conta/cartão em curto intervalo), qual comportamento padrão deve adotar? -> A: Bloquear criação automática e exigir confirmação explícita do usuário, mantendo ambos os registros apenas se o usuário confirmar.

## User Scenarios _(mandatory)_

### User Story 1 - Operar uma carteira financeira (Priority: P1)

Como dono da carteira, quero criar e gerenciar minhas transações (entrada, saída e transferência) para controlar o saldo e acompanhar meu fluxo financeiro.

**Why this priority**: Este é o núcleo de valor da plataforma, sem o qual não há controle financeiro.

**Teste mínimo de interface (US1)**: A UI de transações MUST carregar sem erro (dashboard, lista e formulários), validar dados de formulário, permitir fluxo feliz de criação (entrada e saída) com feedback visual de sucesso, aplicar regra visual de transferência (ocultar/limpar período e restaurar vazio ao voltar), exibir estados de loading/empty/error e refletir atualização de cálculos no resumo/lista após ações no formulário.

**Acceptance Scenarios**:

1. **Given** uma carteira ativa com pelo menos uma conta cadastrada, **When** o usuário registra uma entrada efetivada, **Then** o sistema atualiza o saldo da conta e exibe a transação no histórico da carteira.
2. **Given** uma carteira ativa com duas contas, **When** o usuário registra uma transferência entre contas da mesma carteira, **Then** o sistema debita a conta de origem, credita a conta de destino e mantém rastreabilidade do vínculo da transferência.
3. **Given** uma transação de entrada pendente com recorrência mensal, **When** o usuário visualiza o histórico por período, **Then** a transação aparece com status pendente e metadados de recorrência corretos.
4. **Given** o formulário de nova transação com tipo transferência selecionado, **When** o usuário preenche os dados da operação, **Then** o campo de período não é exibido e a operação é tratada como pontual.
5. **Given** uma transação de transferência registrada, **When** o usuário abre os detalhes da transação, **Then** a interface mostra de forma explícita a conta de origem e a conta de destino.

---

### User Story 2 - Estruturar contas, cartões e limite de carteiras (Priority: P2)

Como dono da carteira, quero gerenciar contas e cartões para organizar melhor onde minhas transações acontecem, respeitando o limite de até duas carteiras por usuário.

**Why this priority**: Sem contas e cartões, o controle financeiro fica incompleto e menos realista.

**Teste mínimo de interface (US2)**: A UI de contas/cartões MUST validar dados de formulário e manter estados de carregamento, vazio e erro em listagens e formulários sem quebra de renderização.

**Acceptance Scenarios**:

1. **Given** um usuário com duas carteiras existentes, **When** ele tenta criar uma terceira carteira, **Then** o sistema bloqueia a ação e informa o limite permitido.
2. **Given** uma conta ou cartão ativo, **When** o usuário arquiva esse registro, **Then** ele deixa de aparecer nas telas principais, continua visível na aba de configurações com status inativo e não pode ser usado em novas transações.
3. **Given** uma conta ou cartão arquivado, **When** o usuário visualiza o histórico financeiro, **Then** transações e valores já registrados são preservados sem alteração retroativa.
4. **Given** um cartão com conta de débito vinculada, **When** o usuário altera a conta de débito do cartão, **Then** o sistema salva o novo vínculo e passa a usar a nova conta para pagamento do cartão.
5. **Given** uma conta com cartão vinculado, **When** o usuário tenta excluir a conta, **Then** o sistema bloqueia a exclusão até que não haja cartões vinculados.
6. **Given** um cartão sem necessidade de preservação, **When** o usuário exclui o cartão definitivamente, **Then** o sistema exclui as despesas e estornos vinculados e recalcula os saldos afetados.
7. **Given** uma conta com cartão vinculado, **When** o sistema bloqueia a exclusão da conta, **Then** a interface orienta troca ou desvinculação do cartão antes de concluir a exclusão.
8. **Given** um cartão cadastrado, **When** o usuário acessa a tela do cartão, **Then** o sistema lista todos os registros vinculados a ele, incluindo despesas e créditos.

---

### User Story 3 - Compartilhar carteira com outro usuário por e-mail (Priority: P3)

Como dono da carteira, quero convidar outra pessoa por e-mail para acessar uma carteira específica com permissões configuráveis e alteráveis a qualquer momento.

**Why this priority**: A colaboração é um diferencial, mas pode ser entregue após o fluxo principal de operação financeira.

**Teste mínimo de interface (US3)**: A UI de convite/permissão MUST validar dados de formulário e aplicar proteção básica de permissão na interface (ocultar ações restritas ou exibir bloqueio visual claro quando o usuário não tiver acesso).

**Acceptance Scenarios**:

1. **Given** uma carteira do usuário dono, **When** ele envia convite para um e-mail com permissão de leitura, **Then** o convidado só visualiza os dados e não consegue alterar registros.
2. **Given** um convidado já ativo, **When** o dono altera a permissão para leitura e edição, **Then** o convidado passa a conseguir criar e atualizar dados permitidos.
3. **Given** um convidado com acesso total operacional, **When** ele gerencia convites/permissões e exclui transações/contas/cartões, **Then** o sistema permite a operação dentro da carteira sem conceder poderes estruturais da carteira.
4. **Given** qualquer configuração de permissão do convidado, **When** o convidado tenta excluir a carteira ou alterar sua configuração estrutural, **Then** o sistema bloqueia a ação e mantém essa capacidade exclusiva do dono.
5. **Given** uma ação auditável em carteira, **When** o usuário executa a operação, **Then** o sistema registra evento de auditoria com autoria, data/hora, ação e entidade afetada.

### Edge Cases

- Transferência para a mesma conta de origem deve ser bloqueada com mensagem de validação.
- Exclusão definitiva (hard-delete) de conta ou cartão remove todos os registros vinculados e dispara recálculo financeiro; apenas o arquivamento (soft-delete/inativação) preserva histórico sem alterar transações existentes.
- Alteração de permissão de convidado durante sessão ativa deve refletir imediatamente as novas restrições.
- Criação de transação recorrente sem data inicial válida deve ser bloqueada.
- Convite para e-mail já convidado na mesma carteira deve ser tratado como atualização de permissão e não duplicação.
- Tentativa de configurar recorrência para transferência deve ser bloqueada em validação de domínio, mesmo com manipulação indevida de payload.
- Ao alternar tipo de transação para transferência, o campo de período deve ser limpo e não reaproveitar valor anterior.
- Ao retornar para entrada/saída, o campo de período deve voltar vazio para seleção explícita do usuário.
- Conta ou cartão inativo não pode ser selecionado em novos lançamentos, transferências ou pagamentos de cartão.
- Exclusão definitiva de conta deve falhar quando existir cartão vinculado à conta.
- Exclusão definitiva de conta deve remover entradas, saídas e transferências em que a conta era origem ou destino, disparando recálculo completo dos indicadores financeiros da carteira.
- Exclusão definitiva de cartão deve remover despesas e estornos vinculados e disparar recálculo completo dos indicadores financeiros da carteira.
- Estorno parcial não pode exceder o valor líquido ainda estornável da despesa original do cartão.
- Em edição de transação/despesa, o detector de duplicidade só deve ser acionado se houver mudança de valor, data, tipo ou vínculo principal (conta/cartão).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: O sistema MUST permitir ao usuário criar até duas carteiras financeiras por conta de usuário.
- **FR-002**: O sistema MUST permitir CRUD de contas dentro de cada carteira, garantindo consistência de histórico financeiro da seguinte forma: arquivamento não altera lançamentos históricos; hard-delete remove vínculos permitidos e dispara recálculo completo da carteira atual.
- **FR-003**: O sistema MUST permitir cadastro e manutenção de cartões vinculados à carteira.
- **FR-003A**: Na tela de cartão, o sistema MUST listar todos os registros vinculados ao cartão, incluindo despesas e créditos (estornos).
- **FR-004**: O sistema MUST permitir criar transações dos tipos entrada, saída e transferência.
- **FR-004A**: Toda transação MUST ser vinculada a conta financeira; cartão MUST NOT ser origem ou destino direto de transação. Despesas de cartão MAY referenciar cartão para classificação e filtro, mantendo a movimentação financeira vinculada exclusivamente a conta.
- **FR-005**: O sistema MUST restringir transferências para contas pertencentes à mesma carteira ativa.
- **FR-006**: Cada transação MUST possuir status válido entre Efetivada e Pendente.
- **FR-007**: Transações dos tipos entrada e saída MUST permitir configuração de período de recorrência entre Diário, Semanal, Mensal e Anual.
- **FR-008**: O sistema MUST permitir convidar outro usuário por e-mail para acesso a uma carteira específica.
- **FR-009**: O dono da carteira MUST poder definir e alterar permissões do convidado entre leitura, leitura+edição e acesso total operacional da carteira.
- **FR-010**: Permissão de leitura MUST permitir somente visualização de dados da carteira.
- **FR-011**: Permissão de leitura+edição MUST permitir criar e editar transações, contas e cartões, sem permitir exclusão desses registros.
- **FR-012**: Permissão de acesso total operacional MUST permitir criar, editar e excluir transações/contas/cartões, além de gerenciar convites e permissões da carteira.
- **FR-013**: Independentemente da permissão concedida, convidados MUST NOT excluir carteira nem alterar configuração estrutural da carteira.
- **FR-014**: O sistema MUST auditar todas as ações de CRUD de conta/cartão, criação/edição/exclusão de transações, mudanças de status Efetivada/Pendente, convites e alterações de permissão, distinguindo operações do dono e de convidados. Cada evento MUST registrar `walletId`, autor (`actorUserId` ou e-mail), papel do autor (`owner`, `read`, `edit`, `operate`), ação exata, entidade afetada (`entityType` + `entityId`), timestamp e `changedFields` estruturado quando houver edição, mudança de status ou alteração de permissão.
- **FR-014A**: Registros de auditoria MUST ser imutáveis e MUST NOT ser removidos por exclusão de contas, cartões ou transações de negócio.
- **FR-015**: O sistema MUST oferecer visualização consolidada das operações financeiras por carteira com, no mínimo, saldo principal, saldo projetado, total de entradas, total de saídas e total de transferências no período selecionado.
- **FR-016**: O sistema MUST manter dois indicadores distintos de saldo por carteira: saldo principal e saldo projetado.
- **FR-017**: Transações com status Pendente MUST impactar somente o saldo projetado.
- **FR-018**: O saldo principal MUST ser atualizado apenas por transações com status Efetivada.
- **FR-019**: Transações do tipo transferência MUST ser sempre pontuais e MUST NOT aceitar configuração de recorrência.
- **FR-020**: No formulário de transação, ao selecionar o tipo transferência, o campo de período MUST ser limpo e oculto.
- **FR-020B**: Ao alternar de transferência para entrada ou saída, o campo de período MUST ser exibido vazio.
- **FR-021**: Contas e cartões MUST suportar status ativo e inativo (arquivado).
- **FR-022**: Registros inativos (arquivados) MUST ficar ocultos nas telas operacionais principais e MUST aparecer em aba de configurações com indicação de status.
- **FR-023**: Contas e cartões inativos MUST NOT poder ser usados em novos cadastros de transações.
- **FR-024**: Arquivamento de conta ou cartão MUST preservar o histórico financeiro e MUST NOT alterar retroativamente transações e valores já registrados.
- **FR-025**: Exclusão definitiva de cartão MUST remover todas as despesas e estornos vinculados ao cartão.
- **FR-026**: Exclusão definitiva de conta MUST remover todas as entradas, saídas e transferências vinculadas à conta como origem ou destino.
- **FR-027**: Após exclusão definitiva de conta ou cartão, o sistema MUST recalcular saldos e agregados financeiros afetados somente da carteira atual, incluindo saldo das contas e consolidado geral da carteira.
- **FR-028**: Conta com cartão vinculado MUST NOT ser excluída enquanto o vínculo existir.
- **FR-028A**: Quando a exclusão da conta for bloqueada por cartão vinculado, o sistema MUST orientar troca ou desvinculação prévia do cartão.
- **FR-029**: Cartão MUST possuir conta de débito vinculada para pagamento da fatura.
- **FR-030**: O usuário MUST poder alterar a conta de débito vinculada ao cartão.
- **FR-030A**: Operações de criação e alteração de vínculo entre entidades financeiras (conta-cartão e registro-cartão) MUST ser processadas em menos de 1 segundo no ambiente padrão.
- **FR-031**: O sistema MUST permitir cadastro de estorno parcial e total em despesas de cartão, registrando o estorno como entrada vinculada à despesa original.
- **FR-032**: Cada carteira MUST possuir um identificador de timezone IANA; cálculos de período, recorrência, vencimento e fechamento diário MUST usar o timezone da carteira, enquanto timestamps persistidos MUST ser armazenados em UTC para auditoria e integração.
- **FR-033**: A listagem de despesas MUST exibir despesas de cartão junto das demais despesas quando não houver filtro específico.
- **FR-034**: Ao aplicar filtro por cartão na listagem de despesas, o sistema MUST retornar somente despesas vinculadas ao cartão selecionado.
- **FR-035**: Quando uma despesa de cartão for marcada como paga, o sistema MUST atualizar o status para paga, debitar o valor na conta escolhida pelo usuário e manter o registro visível no histórico.
- **FR-036**: O sistema MUST detectar possível duplicidade de transação/despesa quando houver coincidência de valor, data, tipo e vínculo principal (conta ou cartão) dentro da janela de 5 minutos, tanto na criação quanto na edição.
- **FR-037**: Na edição, o detector de duplicidade MUST ser acionado apenas quando houver alteração de valor, data, tipo ou vínculo principal (conta ou cartão).
- **FR-038**: Ao detectar possível duplicidade, o sistema MUST bloquear o salvamento automático e MUST solicitar confirmação explícita do usuário para manter ambos os registros.
- **FR-039**: Se o usuário não confirmar, o sistema MUST cancelar a criação ou edição em andamento, sem alterar o registro já persistido.

### Key Entities _(include if feature involves data)_

- **Usuário**: Representa a pessoa autenticada no sistema, podendo ser dono de carteiras e/ou convidado em carteiras de terceiros.
- **Carteira**: Unidade de organização financeira que agrega contas, cartões, permissões de acesso, histórico de transações e configuração de timezone IANA para regras temporais.
- **Permissão de Carteira**: Regra de acesso associada ao e-mail convidado dentro de uma carteira específica.
- **Conta Financeira**: Origem/destino de valores dentro da carteira, utilizada em entradas, saídas e transferências.
- **Cartão**: Instrumento financeiro cadastrado para associar gastos e organizar transações, sempre vinculado a uma conta de débito.
- **Transação**: Registro financeiro com tipo, status, recorrência (quando aplicável), valor, data e relacionamento com conta/carteira/cartão.
- **Estorno**: Crédito parcial ou total vinculado a uma despesa de cartão, usado para reversão financeira.

## Non-Functional Requirements _(mandatory)_

- **NFR-001 Financial Integrity**: Cálculos de saldo e transferência devem manter precisão decimal e rastreabilidade de origem/destino por carteira.
- **NFR-002 Security & Privacy**: Convites por e-mail e permissões devem ser aplicados por carteira, sem expor dados de outras carteiras do mesmo usuário.
- **NFR-003 Form Validation**: Formulários da feature MUST validar dados de entrada antes do envio e exibir mensagens de erro por campo quando houver inconsistência, cobrindo no mínimo campos obrigatórios, formato de e-mail, valor numérico válido e datas válidas.
- **NFR-004 Minimum UI Test Coverage**: A feature MUST manter cobertura mínima de testes de interface para: renderização de telas críticas, fluxo feliz de criação de transação, regra visual de transferência, estados de loading/empty/error, proteção básica de permissão na UI e regressão de cálculo exibido na tela.
- **NFR-005 Performance Budget**: As jornadas principais da feature MUST atender p90 <= 2s em 50 execuções no ambiente padrão, sem degradar a recomputação local de agregados da carteira.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% dos formulários da feature bloqueiam envio de dados inválidos e exibem mensagens de erro por campo para correção.
- **SC-002**: 100% das telas críticas da feature (dashboard, lista de transações e formulários) renderizam sem erro em testes de interface.
- **SC-003**: 100% dos fluxos felizes de criação de entrada e saída exibem feedback visual de sucesso.
- **SC-004**: 100% das alternâncias para transferência ocultam e limpam o campo de período; 100% das alternâncias de volta para entrada/saída exibem o campo vazio.
- **SC-005**: 100% das listagens da feature cobrem e exibem corretamente estados de loading, empty state e erro de API.
- **SC-006**: 100% dos cenários de usuário sem permissão na UI ocultam ações restritas ou exibem bloqueio visual claro.
- **SC-007**: 100% dos cenários de atualização via formulário refletem os novos cálculos no resumo e na lista exibida.
- **SC-008**: As jornadas principais da feature aprovam com p90 <= 2s em 50 execuções no ambiente padrão.
- **SC-009**: 100% das operações de criação ou alteração de vínculo entre conta-cartão e registro-cartão completam em menos de 1 segundo no ambiente padrão.
- **SC-010**: 100% dos cenários de exclusão de registros de negócio preservam os logs de auditoria sem alteração nem remoção.
- **SC-011**: 100% dos cenários de arquivamento de conta/cartão preservam histórico e totais já registrados sem alteração retroativa.
- **SC-012**: 100% das exclusões definitivas de conta removem entradas, saídas e transferências vinculadas (origem/destino) e disparam recálculo completo apenas da carteira atual.

## Assumptions

- O usuário possui autenticação ativa antes de acessar os fluxos de carteira.
- O identificador canônico da feature para referências documentais e automações é `001-carteiras-transacoes`.
- O sistema considera no máximo duas carteiras por usuário como regra de negócio da versão atual.
- Transferências entre carteiras diferentes estão fora de escopo desta feature.
- O período (Diário, Semanal, Mensal, Anual) é tratado como recorrência apenas para transações de entrada e saída.
- O dono da carteira é o único ator autorizado a excluir a carteira e alterar sua configuração estrutural.
- O modelo de permissão segue três níveis fixos: leitura, leitura+edição e acesso total operacional.
- Não há cobertura adicional de testes declarada como fora de escopo nesta rodada; todo o baseline e critérios definidos nesta spec devem ser aplicados.
