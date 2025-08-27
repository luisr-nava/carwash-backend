export function buildDateRangeFilter(dateFrom?: string, dateTo?: string) {
  const filter: Record<string, any> = {};
  if (dateFrom) filter['>='] = new Date(dateFrom);
  if (dateTo) filter['<='] = new Date(dateTo);
  return Object.keys(filter).length > 0 ? filter : null;
}
