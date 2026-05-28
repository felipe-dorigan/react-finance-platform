import type { CardLinkedRecord } from '@/features/cards/cardDetailService';

type CardDetailRecordsProps = {
  records: CardLinkedRecord[];
  isLoading?: boolean;
  error?: string | null;
};

function getRecordTypeLabel(type: CardLinkedRecord['type']): string {
  if (type === 'expense') {
    return 'Despesa';
  }

  return 'Credito';
}

export function CardDetailRecords({
  records,
  isLoading = false,
  error = null,
}: CardDetailRecordsProps) {
  if (isLoading) {
    return (
      <section aria-label="Detalhe do cartao">
        <h2>Registros vinculados</h2>
        <p>Carregando registros vinculados...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-label="Detalhe do cartao">
        <h2>Registros vinculados</h2>
        <p role="alert">Nao foi possivel carregar os registros vinculados.</p>
      </section>
    );
  }

  if (records.length === 0) {
    return (
      <section aria-label="Detalhe do cartao">
        <h2>Registros vinculados</h2>
        <p>Nenhum registro vinculado encontrado para este cartao.</p>
      </section>
    );
  }

  return (
    <section aria-label="Detalhe do cartao">
      <h2>Registros vinculados</h2>
      <ul aria-label="Lista de despesas e creditos vinculados">
        {records.map((record) => (
          <li key={record.id} data-testid={`card-record-${record.id}`}>
            <span>{getRecordTypeLabel(record.type)}</span>
            {' - '}
            <span>R$ {record.amount}</span>
            {' - '}
            <time dateTime={record.occurredAt}>{record.occurredAt}</time>
          </li>
        ))}
      </ul>
    </section>
  );
}
