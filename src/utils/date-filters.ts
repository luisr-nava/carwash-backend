import { BadRequestException } from '@nestjs/common';

export function buildDateRangeFilter(
  dateFrom?: Date,
  dateTo?: Date,
): Record<string, Date> | null {
  if (dateFrom && dateTo && dateTo < dateFrom) {
    throw new BadRequestException(
      'La fecha final no puede ser anterior a la fecha inicial',
    );
  }

  const filter: Record<string, Date> = {};

  if (dateFrom) filter['>='] = dateFrom;

  if (dateTo) {
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999); // incluye todo el día
    filter['<='] = end;
  }

  return Object.keys(filter).length > 0 ? filter : null;
}
