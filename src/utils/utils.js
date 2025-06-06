export function formatNumberWithThousandsSeparator(number) {
  let numStr = String(number);
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatDate(date) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(date).toLocaleDateString('es-ES', options);
}