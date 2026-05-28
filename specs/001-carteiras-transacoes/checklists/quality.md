# Quality Checklist: Gestão de Carteiras, Contas e Transações

**Purpose**: Validar a qualidade dos requisitos antes de seguir para o plan
**Created**: 2026-05-27
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [x] CHK001 As regras de carteira deixam explícito o limite máximo de duas carteiras por usuário? [Completeness, Spec §FR-001]
- [x] CHK002 O modelo de conta financeira descreve claramente o que acontece com o histórico quando a conta é desativada ou excluída? [Completeness, Spec §FR-002]
- [x] CHK003 O cadastro de cartões define de forma suficiente como o cartão se relaciona com carteira, conta e transação? [Completeness, Spec §FR-003]
- [x] CHK004 As três operações principais de transação, entrada, saída e transferência, estão cobertas em cenários e requisitos? [Completeness, Spec §FR-004]
- [x] CHK005 A regra de transferência entre contas da mesma carteira está totalmente especificada, incluindo o que acontece quando a conta de origem e destino são iguais? [Completeness, Spec §FR-005]
- [x] CHK006 Os estados Efetivada e Pendente têm comportamento explícito em todos os fluxos relevantes? [Completeness, Spec §FR-006]
- [x] CHK007 A recorrência está definida apenas para entrada e saída, e a exclusão de recorrência para transferência está documentada sem lacunas? [Completeness, Spec §FR-007, FR-019]
- [x] CHK008 O fluxo de convite por e-mail cobre criação, atualização e alterações de permissão sem omitir passos importantes? [Completeness, Spec §FR-008]
- [x] CHK009 A matriz de permissões do convidado cobre leitura, leitura+edição e acesso total operacional de forma completa? [Completeness, Spec §FR-009 a FR-013]
- [x] CHK010 O modelo de saldo define com clareza saldo principal e saldo projetado, incluindo a atualização por status? [Completeness, Spec §FR-016 a FR-018]
- [x] CHK011 As regras de arquivamento de conta/cartão especificam claramente status ativo/inativo e seus efeitos? [Completeness, Spec §FR-021 a FR-024]
- [x] CHK012 As regras de exclusão definitiva de conta/cartão e recálculo financeiro estão completas? [Completeness, Spec §FR-025 a FR-027]
- [x] CHK013 A restrição de exclusão de conta com cartão vinculado está explicitamente definida? [Completeness, Spec §FR-028]
- [x] CHK014 O vínculo obrigatório entre cartão e conta de débito, incluindo alteração do vínculo, está completo? [Completeness, Spec §FR-029, FR-030]
- [x] CHK015 O comportamento de estorno parcial e total em despesas de cartão está completo e sem lacunas? [Completeness, Spec §FR-031]

## Requirement Clarity

- [x] CHK016 O termo "saldo projetado" está definido de forma inequívoca para evitar interpretação dupla? [Clarity, Spec §FR-016 a FR-018]
- [x] CHK017 O termo "acesso total operacional" está suficientemente claro para diferenciar de acesso estrutural à carteira? [Clarity, Spec §FR-012, FR-013]
- [x] CHK018 O texto deixa explícito que convidados nunca podem excluir carteira nem alterar sua configuração estrutural? [Clarity, Spec §FR-013]
- [x] CHK019 O comportamento do formulário ao selecionar transferência está claro ao ponto de justificar o campo de período oculto? [Clarity, Spec §FR-020]
- [x] CHK020 O significado de "periodo" na spec é consistente com recorrência e não com classificação visual? [Clarity, Spec §FR-007, FR-019]
- [x] CHK021 O status Pendente está descrito sem ambiguidade quanto ao impacto no saldo principal? [Clarity, Spec §FR-006, FR-017, FR-018]
- [x] CHK022 O que constitui uma "ação relevante" para autoria está claro o suficiente para auditoria? [Clarity, Spec §FR-014]
- [x] CHK023 O termo "arquivado/inativo" está claro quanto a visibilidade, uso em novas transações e preservação histórica? [Clarity, Spec §FR-021 a FR-024]
- [x] CHK024 O texto diferencia claramente "arquivar" de "excluir definitivamente" para conta e cartão? [Clarity, Spec §FR-022 a FR-027]
- [x] CHK025 O conceito de estorno parcial/total está claro e mensurável no contexto de cartão? [Clarity, Spec §FR-031]

## Requirement Consistency

- [x] CHK026 As regras de carteira, conta e transação não entram em conflito com o limite máximo de duas carteiras? [Consistency, Spec §FR-001, FR-002]
- [x] CHK027 A matriz de permissões é consistente com a restrição de que apenas o dono altera a estrutura da carteira? [Consistency, Spec §FR-009 a FR-013]
- [x] CHK028 O comportamento de recorrência é consistente entre os cenários, requisitos e assumptions? [Consistency, Spec §FR-007, FR-019, Assumptions]
- [x] CHK029 Os cenários de saldo principal e saldo projetado estão alinhados com os critérios de sucesso? [Consistency, Spec §FR-016 a FR-018, SC-006]
- [x] CHK030 As regras de transferência não contradizem a regra de que transferência é sempre pontual? [Consistency, Spec §FR-004, FR-019, SC-008]
- [x] CHK031 As regras de arquivamento/exclusão são consistentes com os cenários de histórico preservado e recálculo após exclusão? [Consistency, Spec §FR-024 a FR-027, SC-010]
- [x] CHK032 A regra de bloqueio de exclusão de conta com cartão vinculado é consistente com a obrigatoriedade de conta de débito do cartão? [Consistency, Spec §FR-028, FR-029, SC-011]

## Scenario Coverage

- [x] CHK033 Os cenários cobrem criação, edição, desativação e exclusão lógica de contas sem quebrar saldo? [Coverage, Spec §FR-002]
- [x] CHK034 Os cenários cobrem associação de transações a cartões e a visualização desse vínculo? [Coverage, Spec §FR-003]
- [x] CHK035 Os cenários cobrem a tentativa de criar terceira carteira e o bloqueio correspondente? [Coverage, Spec §FR-001, SC-003]
- [x] CHK036 Os cenários cobrem mudança de permissão de convidado em sessão ativa? [Coverage, Spec Edge Cases]
- [x] CHK037 Os cenários cobrem transferência com origem e destino iguais como erro de validação? [Coverage, Spec Edge Cases]
- [x] CHK038 Os cenários cobrem convite duplicado para o mesmo e-mail na mesma carteira? [Coverage, Spec Edge Cases]
- [x] CHK039 Os cenários cobrem visualização de transações por período com recorrência válida? [Coverage, Spec Story 1]
- [x] CHK040 Os cenários cobrem arquivamento e visualização em aba de configurações com status ativo/inativo? [Coverage, Spec Story 2]
- [x] CHK041 Os cenários cobrem bloqueio de uso de conta/cartão inativo em novos lançamentos? [Coverage, Spec §FR-023, SC-009]
- [x] CHK042 Os cenários cobrem exclusão definitiva de cartão e remoção de despesas/estornos vinculados? [Coverage, Spec §FR-025, FR-031]
- [x] CHK043 Os cenários cobrem bloqueio de exclusão de conta com cartão vinculado? [Coverage, Spec §FR-028, SC-011]

## Edge Case Coverage

- [x] CHK044 A spec define o que acontece se o usuário tentar configurar recorrência em uma transferência por manipulação de payload? [Gap, Spec Edge Cases, FR-019]
- [x] CHK045 A spec define o que acontece com transações associadas quando uma conta ou cartão é excluído ou desativado? [Gap, Spec Edge Cases, FR-002, FR-003]
- [x] CHK046 A spec define o efeito de uma transação pendente na listagem consolidada da carteira? [Gap, Spec §FR-016 a FR-018]
- [x] CHK047 A spec define explicitamente como o formulário deve se comportar ao alternar entre tipos de transação? [Gap, Spec §FR-020]
- [x] CHK048 A spec define o comportamento de exclusão definitiva em relação a recálculo completo dos indicadores da carteira? [Gap, Spec §FR-027, SC-010]
- [x] CHK049 A spec define validação de limite para estorno parcial em despesa de cartão? [Gap, Spec Edge Cases, FR-031]

## Non-Functional Requirements

- [x] CHK050 Os requisitos de integridade financeira especificam precisão e rastreabilidade de forma mensurável? [NFR, Spec §NFR-001]
- [x] CHK051 Os requisitos de segurança e privacidade cobrem visibilidade por carteira e isolamento entre carteiras? [NFR, Spec §NFR-002]
- [x] CHK052 Os requisitos de acessibilidade cobrem teclado, labels e navegação nos fluxos principais? [NFR, Spec §NFR-003]
- [x] CHK053 Os eventos auditáveis estão ligados aos fluxos críticos corretos? [NFR, Spec §NFR-004]
- [x] CHK054 O requisito de performance está formulado com alvo verificável e sem termos vagos? [NFR, Spec §NFR-005]

## Success Criteria Quality

- [x] CHK055 Os critérios de sucesso são mensuráveis e podem ser verificados sem ambiguidade? [Acceptance Criteria, Spec §SC-001 a SC-012]
- [x] CHK056 Os critérios de sucesso cobrem o bloqueio da terceira carteira e o bloqueio de exclusão por convidados? [Coverage, Spec §SC-003, SC-004]
- [x] CHK057 Os critérios de sucesso cobrem o comportamento de saldo projetado versus saldo principal? [Coverage, Spec §SC-006]
- [x] CHK058 Os critérios de sucesso cobrem o tratamento de transferência como operação pontual? [Coverage, Spec §SC-008]

## Traceability

- [x] CHK059 A spec mantém rastreabilidade suficiente entre clarificações, requisitos, cenários e critérios de sucesso? [Traceability]
- [x] CHK060 Cada regra nova adicionada por clarificação aparece refletida em pelo menos um requisito funcional e um critério de sucesso? [Traceability]
- [x] CHK061 As assumptions não entram em conflito com os requisitos funcionais ou cenários de aceitação? [Traceability, Assumptions]

## Notes

- Checklist gerado para revisar qualidade do texto da spec, não a implementação.

- Itens com [ ] devem ser marcados conforme a spec evoluir.

## Review Status (2026-05-27)

- Resolvidos nesta rodada: CHK001-CHK033, CHK035-CHK059, CHK061-CHK073.
- Pendentes após revisão da spec atual: nenhum.
- Motivo dos pendentes: não se aplica; checklist integralmente coberto pela spec atual.

## Constitution 2.1.0 Alignment Update (2026-05-28)

### Requirement Completeness

- [x] CHK062 A spec explicita todos os sete grupos do baseline mínimo de testes de interface exigidos pela constituição? [Completeness, Spec §NFR-004, Constitution §IV]
- [x] CHK063 Os critérios de sucesso cobrem integralmente o baseline mínimo (renderização, validação, fluxo feliz, regra visual, estados, permissão e regressão de cálculo) sem lacunas? [Completeness, Spec §SC-001 a SC-007]
- [x] CHK064 A validação de formulário inclui explicitamente obrigatoriedade, formato de e-mail, valor numérico válido, datas válidas, erro por campo e bloqueio de envio inválido? [Completeness, Spec §NFR-003]

### Requirement Clarity

- [x] CHK065 O termo baseline mínimo de testes de interface está definido de forma inequívoca para evitar interpretação divergente entre spec, plan e constitution? [Clarity, Spec §NFR-004, Plan §Technical Context, Constitution §IV]
- [x] CHK066 O escopo de proteção básica de permissão na UI está especificado com critérios observáveis no texto de requisitos (ocultar ação ou bloquear visualmente)? [Clarity, Spec §NFR-004, SC-006]
- [x] CHK067 A noção de regressão de cálculo exibido diferencia claramente atualização visual de tela versus regras de cálculo de domínio? [Clarity, Spec §NFR-004, SC-007, FR-016 a FR-018]

### Requirement Consistency

- [x] CHK068 O requisito de testes mínimos (NFR-004) é consistente com os critérios de sucesso SC-001 a SC-007 sem duplicidade conflitante ou omissão? [Consistency, Spec §NFR-004, SC-001 a SC-007]
- [x] CHK069 A atualização da constitution 2.1.0 permanece consistente com o Constitution Check no plano para qualidade e gates de merge? [Consistency, Constitution §IV, Constitution §Fluxo de Entrega, Plan §Constitution Check]
- [x] CHK070 A mudança para baseline mínimo não conflita com requisitos funcionais já definidos para transações, permissões e consolidação financeira? [Consistency, Spec §FR-004 a FR-020B, FR-009 a FR-013, FR-015 a FR-018]

### Acceptance Criteria Quality

- [x] CHK071 Cada critério SC-001 a SC-007 é objetivo e verificável sem depender de interpretação subjetiva do revisor? [Measurability, Spec §SC-001 a SC-007]
- [x] CHK072 Os critérios de sucesso descrevem evidência mínima observável para estados loading/empty/error e para regra visual de transferência? [Acceptance Criteria, Spec §SC-004, SC-005]

### Dependencies & Assumptions

- [x] CHK073 A spec e o plan documentam de forma clara a dependência de CI para bloquear merge quando o baseline mínimo de testes falhar? [Dependency, Constitution §Fluxo de Entrega, Plan §Constitution Check]
- [x] CHK074 Há algum pressuposto implícito de cobertura de testes além do baseline mínimo que precise ser declarado explicitamente como fora de escopo desta rodada? [Assumption, Gap]
