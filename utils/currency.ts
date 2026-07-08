export function formatCurrency(amount: number, currency: string): string {
  const prefix = currency.toLowerCase() === 'crc' ? 'CRC ' : `${currency.toUpperCase()} `;
  return `${prefix}${amount.toLocaleString('es-CR')}`;
}