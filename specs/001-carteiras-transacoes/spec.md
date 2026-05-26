# Feature Specification: Gestão de Carteiras, Contas e Transações

**Feature Branch**: `[001-carteiras-transacoes]`

**Created**: 2026-05-26

**Status**: Draft

**Input**: User description: "quero coinstruir uma interface para gerenciar, transações (entradas, saídas, transferencia), contas (crud), quero que o usuario possa incluir mais de uma carteira (nome que irei chamar. A carteira é onde ele vai visualizar toda a operação financeira daquela carteira, ele poderá ter apenas duas carteiras. Ele pode definir um email de outra pessoa, que terá acesso a carteira especifica), vai ter cadastros de cartões. Cada transação vai ter um status (Efetivada, Pendente), vai ter um periodo(Diário, Semanal, Mensal e Anual)."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Operar uma carteira financeira (Priority: P1)

Como dono da carteira, quero criar e gerenciar minhas transações (entrada, saída e transferência) para controlar o saldo e acompanhar meu fluxo financeiro.

**Why this priority**: Este é o núcleo de valor da plataforma, sem o qual não há controle financeiro.

**Independent Test**: Pode ser testado de ponta a ponta criando uma carteira, registrando transações de tipos diferentes e validando saldo, status e período de recorrência.

**Acceptance Scenarios**:

1. **Given** uma carteira ativa com pelo menos uma conta cadastrada, **When** o usuário registra uma entrada efetivada, **Then** o sistema atualiza o saldo da conta e exibe a transação no histórico da carteira.
2. **Given** uma carteira ativa com duas contas, **When** o usuário registra uma transferência entre contas da mesma carteira, **Then** o sistema debita a conta de origem, credita a conta de destino e mantém rastreabilidade do vínculo da transferência.
3. **Given** uma transação pendente com recorrência mensal, **When** o usuário visualiza o histórico por período, **Then** a transação aparece com status pendente e metadados de recorrência corretos.

---

### User Story 2 - Estruturar contas, cartões e limite de carteiras (Priority: P2)

Como dono da carteira, quero gerenciar contas e cartões para organizar melhor onde minhas transações acontecem, respeitando o limite de até duas carteiras por usuário.

**Why this priority**: Sem contas e cartões, o controle financeiro fica incompleto e menos realista.

**Independent Test**: Pode ser testado com CRUD de contas e cartões, além da tentativa de criar uma terceira carteira para validar bloqueio de regra.

**Acceptance Scenarios**:

1. **Given** um usuário com duas carteiras existentes, **When** ele tenta criar uma terceira carteira, **Then** o sistema bloqueia a ação e informa o limite permitido.
2. **Given** uma carteira existente, **When** o usuário cria, edita e desativa uma conta, **Then** o sistema reflete as alterações sem perder histórico das transações associadas.
3. **Given** uma carteira com cartões cadastrados, **When** o usuário associa uma transação a um cartão, **Then** o vínculo é exibido no detalhe da transação.

---

### User Story 3 - Compartilhar carteira com outro usuário por e-mail (Priority: P3)

Como dono da carteira, quero convidar outra pessoa por e-mail para acessar uma carteira específica com permissões configuráveis e alteráveis a qualquer momento.

**Why this priority**: A colaboração é um diferencial, mas pode ser entregue após o fluxo principal de operação financeira.

**Independent Test**: Pode ser testado convidando um e-mail, atribuindo permissão, alterando permissão depois e validando as restrições de dono.

**Acceptance Scenarios**:

1. **Given** uma carteira do usuário dono, **When** ele envia convite para um e-mail com permissão de leitura, **Then** o convidado só visualiza os dados e não consegue alterar registros.
2. **Given** um convidado já ativo, **When** o dono altera a permissão para leitura e edição, **Then** o convidado passa a conseguir criar e atualizar dados permitidos.
3. **Given** qualquer configuração de permissão do convidado, **When** o convidado tenta excluir a carteira ou alterar sua configuração estrutural, **Then** o sistema bloqueia a ação e mantém essa capacidade exclusiva do dono.

### Edge Cases

- Transferência para a mesma conta de origem deve ser bloqueada com mensagem de validação.
- Exclusão de conta ou cartão com transações associadas deve preservar histórico e impedir inconsistência de saldo.
- Alteração de permissão de convidado durante sessão ativa deve refletir imediatamente as novas restrições.
- Criação de transação recorrente sem data inicial válida deve ser bloqueada.
- Convite para e-mail já convidado na mesma carteira deve ser tratado como atualização de permissão e não duplicação.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: O sistema MUST permitir ao usuário criar até duas carteiras financeiras por conta de usuário.
- **FR-002**: O sistema MUST permitir CRUD de contas dentro de cada carteira, preservando consistência de histórico financeiro.
- **FR-003**: O sistema MUST permitir cadastro e manutenção de cartões vinculados à carteira.
- **FR-004**: O sistema MUST permitir criar transações dos tipos entrada, saída e transferência.
- **FR-005**: O sistema MUST restringir transferências para contas pertencentes à mesma carteira ativa.
- **FR-006**: Cada transação MUST possuir status válido entre Efetivada e Pendente.
- **FR-007**: Cada transação MUST possuir configuração de período de recorrência entre Diário, Semanal, Mensal e Anual.
- **FR-008**: O sistema MUST permitir convidar outro usuário por e-mail para acesso a uma carteira específica.
- **FR-009**: O dono da carteira MUST poder definir e alterar permissões do convidado entre leitura, leitura+edição e acesso total operacional da carteira.
- **FR-010**: Independentemente da permissão concedida, convidados MUST NOT excluir carteira nem alterar configuração estrutural da carteira.
- **FR-011**: O sistema MUST registrar autoria de ações relevantes para distinguir operações do dono e de convidados.
- **FR-012**: O sistema MUST oferecer visualização consolidada das operações financeiras por carteira.

### Key Entities _(include if feature involves data)_

- **Usuário**: Representa a pessoa autenticada no sistema, podendo ser dono de carteiras e/ou convidado em carteiras de terceiros.
- **Carteira**: Unidade de organização financeira que agrega contas, cartões, permissões de acesso e histórico de transações.
- **Permissão de Carteira**: Regra de acesso associada ao e-mail convidado dentro de uma carteira específica.
- **Conta Financeira**: Origem/destino de valores dentro da carteira, utilizada em entradas, saídas e transferências.
- **Cartão**: Instrumento financeiro cadastrado para associar gastos e organizar transações.
- **Transação**: Registro financeiro com tipo, status, recorrência, valor, data e relacionamento com conta/carteira/cartão.

## Non-Functional Requirements _(mandatory)_

- **NFR-001 Financial Integrity**: Cálculos de saldo e transferência devem manter precisão decimal e rastreabilidade de origem/destino por carteira.
- **NFR-002 Security & Privacy**: Convites por e-mail e permissões devem ser aplicados por carteira, sem expor dados de outras carteiras do mesmo usuário.
- **NFR-003 Accessibility**: Fluxos de cadastro e gestão de transações, contas, cartões e permissões devem ser operáveis por teclado e com rótulos semânticos claros.
- **NFR-004 Observability**: Ações críticas (criação/edição/exclusão lógica, convite e mudança de permissão) devem gerar eventos auditáveis.
- **NFR-005 Performance**: A listagem principal de transações por carteira deve carregar em até 2 segundos em condições normais de uso.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 95% dos usuários conseguem criar uma carteira, cadastrar ao menos uma conta e registrar uma transação em menos de 5 minutos.
- **SC-002**: 100% das transferências válidas entre contas da mesma carteira atualizam saldos de origem e destino sem divergência.
- **SC-003**: 100% das tentativas de criação de terceira carteira são bloqueadas com mensagem clara de regra de limite.
- **SC-004**: 100% das tentativas de convidado excluir carteira são bloqueadas com retorno explícito de permissão insuficiente.
- **SC-005**: 90% das consultas do histórico de transações por carteira respondem em até 2 segundos em cenário padrão.

## Assumptions

- O usuário possui autenticação ativa antes de acessar os fluxos de carteira.
- O sistema considera no máximo duas carteiras por usuário como regra de negócio da versão atual.
- Transferências entre carteiras diferentes estão fora de escopo desta feature.
- O período (Diário, Semanal, Mensal, Anual) é tratado como recorrência da transação.
- O dono da carteira é o único ator autorizado a excluir a carteira e alterar sua configuração estrutural.
