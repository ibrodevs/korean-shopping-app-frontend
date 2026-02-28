export function formatSom(value: number): string {
  return `${new Intl.NumberFormat('ru-KG').format(value)} сом`;
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}
