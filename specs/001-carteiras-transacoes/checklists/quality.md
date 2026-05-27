# Quality Checklist: Gestão de Carteiras, Contas e Transações

**Purpose**: Validar a qualidade dos requisitos antes de seguir para o plan
**Created**: 2026-05-27
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [ ] CHK001 As regras de carteira deixam explícito o limite máximo de duas carteiras por usuário? [Completeness, Spec §FR-001]
- [ ] CHK002 O modelo de conta financeira descreve claramente o que acontece com o histórico quando a conta é desativada ou excluída? [Completeness, Spec §FR-002]
- [ ] CHK003 O cadastro de cartões define de forma suficiente como o cartão se relaciona com carteira, conta e transação? [Completeness, Spec §FR-003]
- [ ] CHK004 As três operações principais de transação, entrada, saída e transferência, estão cobertas em cenários e requisitos? [Completeness, Spec §FR-004]
- [ ] CHK005 A regra de transferência entre contas da mesma carteira está totalmente especificada, incluindo o que acontece quando a conta de origem e destino são iguais? [Completeness, Spec §FR-005]
- [ ] CHK006 Os estados Efetivada e Pendente têm comportamento explícito em todos os fluxos relevantes? [Completeness, Spec §FR-006]
- [ ] CHK007 A recorrência está definida apenas para entrada e saída, e a exclusão de recorrência para transferência está documentada sem lacunas? [Completeness, Spec §FR-007, FR-019]
- [ ] CHK008 O fluxo de convite por e-mail cobre criação, atualização e alterações de permissão sem omitir passos importantes? [Completeness, Spec §FR-008]
- [ ] CHK009 A matriz de permissões do convidado cobre leitura, leitura+edição e acesso total operacional de forma completa? [Completeness, Spec §FR-009 a FR-013]
- [ ] CHK010 O modelo de saldo define com clareza saldo principal e saldo projetado, incluindo a atualização por status? [Completeness, Spec §FR-016 a FR-018]
- [ ] CHK011 As regras de arquivamento de conta/cartão especificam claramente status ativo/inativo e seus efeitos? [Completeness, Spec §FR-021 a FR-024]
- [ ] CHK012 As regras de exclusão definitiva de conta/cartão e recálculo financeiro estão completas? [Completeness, Spec §FR-025 a FR-027]
- [ ] CHK013 A restrição de exclusão de conta com cartão vinculado está explicitamente definida? [Completeness, Spec §FR-028]
- [ ] CHK014 O vínculo obrigatório entre cartão e conta de débito, incluindo alteração do vínculo, está completo? [Completeness, Spec §FR-029, FR-030]
- [ ] CHK015 O comportamento de estorno parcial e total em despesas de cartão está completo e sem lacunas? [Completeness, Spec §FR-031]

## Requirement Clarity

- [ ] CHK016 O termo "saldo projetado" está definido de forma inequívoca para evitar interpretação dupla? [Clarity, Spec §FR-016 a FR-018]
- [ ] CHK017 O termo "acesso total operacional" está suficientemente claro para diferenciar de acesso estrutural à carteira? [Clarity, Spec §FR-012, FR-013]
- [ ] CHK018 O texto deixa explícito que convidados nunca podem excluir carteira nem alterar sua configuração estrutural? [Clarity, Spec §FR-013]
- [ ] CHK019 O comportamento do formulário ao selecionar transferência está claro ao ponto de justificar o campo de período oculto? [Clarity, Spec §FR-020]
- [ ] CHK020 O significado de "periodo" na spec é consistente com recorrência e não com classificação visual? [Clarity, Spec §FR-007, FR-019]
- [ ] CHK021 O status Pendente está descrito sem ambiguidade quanto ao impacto no saldo principal? [Clarity, Spec §FR-006, FR-017, FR-018]
- [ ] CHK022 O que constitui uma "ação relevante" para autoria está claro o suficiente para auditoria? [Clarity, Spec §FR-014]
- [ ] CHK023 O termo "arquivado/inativo" está claro quanto a visibilidade, uso em novas transações e preservação histórica? [Clarity, Spec §FR-021 a FR-024]
- [ ] CHK024 O texto diferencia claramente "arquivar" de "excluir definitivamente" para conta e cartão? [Clarity, Spec §FR-022 a FR-027]
- [ ] CHK025 O conceito de estorno parcial/total está claro e mensurável no contexto de cartão? [Clarity, Spec §FR-031]

## Requirement Consistency

- [ ] CHK026 As regras de carteira, conta e transação não entram em conflito com o limite máximo de duas carteiras? [Consistency, Spec §FR-001, FR-002]
- [ ] CHK027 A matriz de permissões é consistente com a restrição de que apenas o dono altera a estrutura da carteira? [Consistency, Spec §FR-009 a FR-013]
- [ ] CHK028 O comportamento de recorrência é consistente entre os cenários, requisitos e assumptions? [Consistency, Spec §FR-007, FR-019, Assumptions]
- [ ] CHK029 Os cenários de saldo principal e saldo projetado estão alinhados com os critérios de sucesso? [Consistency, Spec §FR-016 a FR-018, SC-006]
- [ ] CHK030 As regras de transferência não contradizem a regra de que transferência é sempre pontual? [Consistency, Spec §FR-004, FR-019, SC-008]
- [ ] CHK031 As regras de arquivamento/exclusão são consistentes com os cenários de histórico preservado e recálculo após exclusão? [Consistency, Spec §FR-024 a FR-027, SC-010]
- [ ] CHK032 A regra de bloqueio de exclusão de conta com cartão vinculado é consistente com a obrigatoriedade de conta de débito do cartão? [Consistency, Spec §FR-028, FR-029, SC-011]

## Scenario Coverage

- [ ] CHK033 Os cenários cobrem criação, edição, desativação e exclusão lógica de contas sem quebrar saldo? [Coverage, Spec §FR-002]
- [ ] CHK034 Os cenários cobrem associação de transações a cartões e a visualização desse vínculo? [Coverage, Spec §FR-003]
- [ ] CHK035 Os cenários cobrem a tentativa de criar terceira carteira e o bloqueio correspondente? [Coverage, Spec §FR-001, SC-003]
- [ ] CHK036 Os cenários cobrem mudança de permissão de convidado em sessão ativa? [Coverage, Spec Edge Cases]
- [ ] CHK037 Os cenários cobrem transferência com origem e destino iguais como erro de validação? [Coverage, Spec Edge Cases]
- [ ] CHK038 Os cenários cobrem convite duplicado para o mesmo e-mail na mesma carteira? [Coverage, Spec Edge Cases]
- [ ] CHK039 Os cenários cobrem visualização de transações por período com recorrência válida? [Coverage, Spec Story 1]
- [ ] CHK040 Os cenários cobrem arquivamento e visualização em aba de configurações com status ativo/inativo? [Coverage, Spec Story 2]
- [ ] CHK041 Os cenários cobrem bloqueio de uso de conta/cartão inativo em novos lançamentos? [Coverage, Spec §FR-023, SC-009]
- [ ] CHK042 Os cenários cobrem exclusão definitiva de cartão e remoção de despesas/estornos vinculados? [Coverage, Spec §FR-025, FR-031]
- [ ] CHK043 Os cenários cobrem bloqueio de exclusão de conta com cartão vinculado? [Coverage, Spec §FR-028, SC-011]

## Edge Case Coverage

- [ ] CHK044 A spec define o que acontece se o usuário tentar configurar recorrência em uma transferência por manipulação de payload? [Gap, Spec Edge Cases, FR-019]
- [ ] CHK045 A spec define o que acontece com transações associadas quando uma conta ou cartão é excluído ou desativado? [Gap, Spec Edge Cases, FR-002, FR-003]
- [ ] CHK046 A spec define o efeito de uma transação pendente na listagem consolidada da carteira? [Gap, Spec §FR-016 a FR-018]
- [ ] CHK047 A spec define explicitamente como o formulário deve se comportar ao alternar entre tipos de transação? [Gap, Spec §FR-020]
- [ ] CHK048 A spec define o comportamento de exclusão definitiva em relação a recálculo completo dos indicadores da carteira? [Gap, Spec §FR-027, SC-010]
- [ ] CHK049 A spec define validação de limite para estorno parcial em despesa de cartão? [Gap, Spec Edge Cases, FR-031]

## Non-Functional Requirements

- [ ] CHK050 Os requisitos de integridade financeira especificam precisão e rastreabilidade de forma mensurável? [NFR, Spec §NFR-001]
- [ ] CHK051 Os requisitos de segurança e privacidade cobrem visibilidade por carteira e isolamento entre carteiras? [NFR, Spec §NFR-002]
- [ ] CHK052 Os requisitos de acessibilidade cobrem teclado, labels e navegação nos fluxos principais? [NFR, Spec §NFR-003]
- [ ] CHK053 Os eventos auditáveis estão ligados aos fluxos críticos corretos? [NFR, Spec §NFR-004]
- [ ] CHK054 O requisito de performance está formulado com alvo verificável e sem termos vagos? [NFR, Spec §NFR-005]

## Success Criteria Quality

- [ ] CHK055 Os critérios de sucesso são mensuráveis e podem ser verificados sem ambiguidade? [Acceptance Criteria, Spec §SC-001 a SC-012]
- [ ] CHK056 Os critérios de sucesso cobrem o bloqueio da terceira carteira e o bloqueio de exclusão por convidados? [Coverage, Spec §SC-003, SC-004]
- [ ] CHK057 Os critérios de sucesso cobrem o comportamento de saldo projetado versus saldo principal? [Coverage, Spec §SC-006]
- [ ] CHK058 Os critérios de sucesso cobrem o tratamento de transferência como operação pontual? [Coverage, Spec §SC-008]

## Traceability

- [ ] CHK059 A spec mantém rastreabilidade suficiente entre clarificações, requisitos, cenários e critérios de sucesso? [Traceability]
- [ ] CHK060 Cada regra nova adicionada por clarificação aparece refletida em pelo menos um requisito funcional e um critério de sucesso? [Traceability]
- [ ] CHK061 As assumptions não entram em conflito com os requisitos funcionais ou cenários de aceitação? [Traceability, Assumptions]

## Notes

- Checklist gerado para revisar qualidade do texto da spec, não a implementação.
- Itens com [ ] devem ser marcados conforme a spec evoluir.

## Review Status (2026-05-27)

- Resolvidos nesta rodada: CHK001-CHK049, CHK055-CHK061.
- Pendentes para detalhamento objetivo no plan: CHK050-CHK054.
- Motivo dos pendentes: decisão explícita de postergar métricas e critérios detalhados de NFR (acessibilidade, observabilidade, integridade e performance) para a fase de planejamento técnico.
