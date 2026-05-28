import type { CardLinkedRecord } from '@/features/cards/cardDetailService';

type CardDetailRecordsProps = {
  records: CardLinkedRecord[];
};

function getRecordTypeLabel(type: CardLinkedRecord['type']): string {
  if (type === 'expense') {
    return 'Despesa';
  }

  return 'Credito';
}

export function CardDetailRecords({ records }: CardDetailRecordsProps) {
  if (records.length === 0) {
    return <p>Nenhum registro vinculado encontrado para este cartao.</p>;
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
          </li>
        ))}
      </ul>
    </section>
  );
}
