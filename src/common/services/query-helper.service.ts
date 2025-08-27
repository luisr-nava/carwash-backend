import { Injectable } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { GetParamsDto } from '../dtos/params.dto';
import { buildDateRangeFilter } from 'src/utils/date-filters';

@Injectable()
export class QueryHelperService {
  async findAllWithFilters<T extends ObjectLiteral>(
    repo: Repository<T>,
    alias: string,
    shopId: string,
    query: GetParamsDto,
    options?: {
      dateField?: string;
      searchField?: string;
      joins?: { relation: string; alias: string }[];
    },
  ) {
    const { limit = 10, page = 0, search, dateFrom, dateTo } = query;
    const dateFilter = buildDateRangeFilter(
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined,
    );

    const qb = repo.createQueryBuilder(alias);

    options?.joins?.forEach((j) => {
      qb.leftJoinAndSelect(j.relation, j.alias);
    });

    qb.where(`${alias}.shop_id = :shopId`, { shopId });

    if (search && options?.searchField) {
      qb.andWhere(
        `LOWER(${alias}.${options?.searchField}) LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      );
    }

    if (dateFilter?.['>='] && options?.dateField) {
      qb.andWhere(`${alias}.${options.dateField} >= :dateFrom`, {
        dateFrom: dateFilter['>='],
      });
    }
    if (dateFilter?.['<='] && options?.dateField) {
      qb.andWhere(`${alias}.${options.dateField} <= :dateTo`, {
        dateTo: dateFilter['<='],
      });
    }
    const skip = Math.max(0, (page - 1) * limit);
    qb.orderBy(`${alias}.${options?.dateField ?? 'created_at'}`, 'DESC')
      .skip(skip)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
