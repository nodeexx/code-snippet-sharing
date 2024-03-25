import type { CodeSnippet } from '@prisma/client';

import { prisma } from '$lib/server/prisma';
import type { FindCodeSnippetsQuery } from '$lib/shared/code-snippets/dtos';

export class CodeSnippetsService {
  async getAll(): Promise<CodeSnippet[]> {
    const codeSnippets = await prisma.codeSnippet.findMany({
      where: {
        is_deleted: false,
      },
    });

    return codeSnippets;
  }

  async getOneById(id: number): Promise<CodeSnippet> {
    const codeSnippet = await prisma.codeSnippet.findUniqueOrThrow({
      where: {
        id,
        is_deleted: false,
      },
    });

    return codeSnippet;
  }

  async getTotalItemCountByQuery(
    query?: FindCodeSnippetsQuery,
  ): Promise<number> {
    const itemCount = await prisma.codeSnippet.count({
      where: {
        is_deleted: false,
        ...(query?.filterBy === 'author' &&
          query.filterValue && { user_id: query.filterValue }),
      },
    });

    return itemCount;
  }

  async getTotalPageCountByQuery(
    query?: FindCodeSnippetsQuery,
  ): Promise<number> {
    const itemCount = await this.getTotalItemCountByQuery(query);
    let pageCount = 1;
    if (query?.count != null && query.count > 0) {
      pageCount = Math.ceil(itemCount / query.count);
    }

    return pageCount;
  }

  async findManyByQuery(query?: FindCodeSnippetsQuery): Promise<CodeSnippet[]> {
    let skip: number | undefined;
    if (query?.page != null && query.page > 1 && query.count != null) {
      skip = (query.page - 1) * query.count;
    }

    let take: number | undefined;
    if (query?.count != null) {
      take = query.count;
    }

    const codeSnippets = await prisma.codeSnippet.findMany({
      where: {
        is_deleted: false,
        ...(query?.filterBy === 'author' &&
          query.filterValue && { user_id: query.filterValue }),
      },
      ...(skip && { skip }),
      ...(take && { take }),
      ...(query?.sortBy && {
        orderBy: {
          [query.sortBy]: query.sortOrder || 'asc',
        },
      }),
    });

    return codeSnippets;
  }

  async create(
    data: Omit<
      CodeSnippet,
      'id' | 'is_deleted' | 'created_at' | 'updated_at' | 'deleted_at'
    >,
  ): Promise<CodeSnippet> {
    const codeSnippet = await prisma.codeSnippet.create({
      data,
    });

    return codeSnippet;
  }

  async update(
    id: number,
    data: Partial<Omit<CodeSnippet, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<CodeSnippet> {
    const codeSnippet = await prisma.codeSnippet.update({
      where: {
        id,
      },
      data,
    });

    return codeSnippet;
  }

  async softDelete(id: number): Promise<CodeSnippet> {
    const codeSnippet = await prisma.codeSnippet.update({
      where: {
        id,
      },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });

    return codeSnippet;
  }
}
