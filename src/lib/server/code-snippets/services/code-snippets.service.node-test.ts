import type { CodeSnippet } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';

import * as libServerPrismaModule from '$lib/server/prisma';

import { CodeSnippetsService } from './code-snippets.service';

type PrismaClient = typeof libServerPrismaModule.prisma;
type CodeSnippetDelegate = PrismaClient['codeSnippet'];

describe(CodeSnippetsService.name, () => {
  let codeSnippetsService: CodeSnippetsService;
  let mockPrismaCodeSnippetUpdate: Mock;
  let mockPrismaCodeSnippetCount: Mock;

  beforeEach(() => {
    mockPrismaCodeSnippetUpdate = vi.fn();
    mockPrismaCodeSnippetCount = vi.fn();
    vi.spyOn(libServerPrismaModule, 'prisma', 'get').mockReturnValue({
      codeSnippet: {
        findMany: vi
          .fn()
          .mockResolvedValue([]) as CodeSnippetDelegate['findMany'],
        findUniqueOrThrow: vi
          .fn()
          .mockResolvedValue({}) as CodeSnippetDelegate['findFirstOrThrow'],
        create: vi.fn().mockResolvedValue({}) as CodeSnippetDelegate['create'],
        update: mockPrismaCodeSnippetUpdate.mockResolvedValue(
          {},
        ) as CodeSnippetDelegate['update'],
        count: mockPrismaCodeSnippetCount.mockResolvedValue(
          0,
        ) as CodeSnippetDelegate['count'],
      } as CodeSnippetDelegate,
    } as PrismaClient);
    codeSnippetsService = new CodeSnippetsService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe(CodeSnippetsService.prototype.getAll.name, () => {
    it('should query all not soft-deleted code snippets', async () => {
      await codeSnippetsService.getAll();

      expect(
        libServerPrismaModule.prisma.codeSnippet.findMany,
      ).toHaveBeenCalledTimes(1);
      expect(
        libServerPrismaModule.prisma.codeSnippet.findMany,
      ).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
        },
      });
    });
  });

  describe(CodeSnippetsService.prototype.getOneById.name, () => {
    it('should query a not soft-deleted code snippet', async () => {
      await codeSnippetsService.getOneById(1);

      expect(
        libServerPrismaModule.prisma.codeSnippet.findUniqueOrThrow,
      ).toHaveBeenCalledTimes(1);
      expect(
        libServerPrismaModule.prisma.codeSnippet.findUniqueOrThrow,
      ).toHaveBeenCalledWith({
        where: { id: 1, is_deleted: false },
      });
    });

    it('should throw if code snippet not found', async () => {
      vi.spyOn(
        libServerPrismaModule.prisma.codeSnippet,
        'findUniqueOrThrow',
      ).mockRejectedValue(
        new PrismaClientKnownRequestError('mock-error', {
          code: 'P2025',
          clientVersion: 'mock-version',
        }),
      );

      // NOTE: await expect().rejects.toThrow() did not catch
      // the wrong error code
      try {
        await codeSnippetsService.getOneById(1);
      } catch (e) {
        const error = e as PrismaClientKnownRequestError;
        expect(error).toBeInstanceOf(PrismaClientKnownRequestError);
        expect(error.code).toBe('P2025');
      }
    });
  });

  describe(CodeSnippetsService.prototype.getTotalItemCountByQuery.name, () => {
    it('should query total non soft-deleted item count', async () => {
      await codeSnippetsService.getTotalItemCountByQuery();

      expect(
        libServerPrismaModule.prisma.codeSnippet.count,
      ).toHaveBeenCalledTimes(1);
      expect(
        libServerPrismaModule.prisma.codeSnippet.count,
      ).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
        },
      });
    });

    it('should query total non soft-deleted item count for a specific author', async () => {
      await codeSnippetsService.getTotalItemCountByQuery({
        filterBy: 'author',
        filterValue: 1,
      });

      expect(
        libServerPrismaModule.prisma.codeSnippet.count,
      ).toHaveBeenCalledTimes(1);
      expect(
        libServerPrismaModule.prisma.codeSnippet.count,
      ).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
          user_id: 1,
        },
      });
    });
  });

  describe(CodeSnippetsService.prototype.getTotalPageCountByQuery.name, () => {
    it('should query total page count', async () => {
      mockPrismaCodeSnippetCount.mockResolvedValue(10);

      const pageCount = await codeSnippetsService.getTotalPageCountByQuery();

      expect(pageCount).toBe(1);
    });

    it('should query total page count with count', async () => {
      mockPrismaCodeSnippetCount.mockResolvedValue(100);

      const pageCount = await codeSnippetsService.getTotalPageCountByQuery({
        count: 20,
      });

      expect(pageCount).toBe(5);
    });

    it('should query total page count with count and page', async () => {
      mockPrismaCodeSnippetCount.mockResolvedValue(100);

      const pageCount = await codeSnippetsService.getTotalPageCountByQuery({
        count: 20,
        page: 2,
      });

      expect(pageCount).toBe(5);
    });
  });

  describe(CodeSnippetsService.prototype.findManyByQuery.name, () => {
    it('should query all not soft-deleted code snippets', async () => {
      await codeSnippetsService.findManyByQuery();

      expect(
        libServerPrismaModule.prisma.codeSnippet.findMany,
      ).toHaveBeenCalledTimes(1);
      expect(
        libServerPrismaModule.prisma.codeSnippet.findMany,
      ).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
        },
      });
    });

    it('should query 10 not soft-deleted items', async () => {
      await codeSnippetsService.findManyByQuery({ count: 10 });

      expect(
        libServerPrismaModule.prisma.codeSnippet.findMany,
      ).toHaveBeenCalledTimes(1);
      expect(
        libServerPrismaModule.prisma.codeSnippet.findMany,
      ).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
        },
        take: 10,
      });
    });

    it('should query 10 not soft-deleted items from the 2nd page', async () => {
      await codeSnippetsService.findManyByQuery({ page: 2, count: 10 });

      expect(
        libServerPrismaModule.prisma.codeSnippet.findMany,
      ).toHaveBeenCalledTimes(1);
      expect(
        libServerPrismaModule.prisma.codeSnippet.findMany,
      ).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
        },
        skip: 10,
        take: 10,
      });
    });

    it('should query all not soft-deleted from a specific author', async () => {
      await codeSnippetsService.findManyByQuery({
        filterBy: 'author',
        filterValue: 1,
      });

      expect(
        libServerPrismaModule.prisma.codeSnippet.findMany,
      ).toHaveBeenCalledTimes(1);
      expect(
        libServerPrismaModule.prisma.codeSnippet.findMany,
      ).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
          user_id: 1,
        },
      });
    });

    it('should query all not soft-deleted and order them by creation_date in ascending order', async () => {
      await codeSnippetsService.findManyByQuery({
        sortBy: 'created_at',
      });

      expect(
        libServerPrismaModule.prisma.codeSnippet.findMany,
      ).toHaveBeenCalledTimes(1);
      expect(
        libServerPrismaModule.prisma.codeSnippet.findMany,
      ).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
        },
        orderBy: {
          created_at: 'asc',
        },
      });
    });

    it('should query all not soft-deleted and order them by creation_date in descending order', async () => {
      await codeSnippetsService.findManyByQuery({
        sortBy: 'created_at',
        sortOrder: 'desc',
      });

      expect(
        libServerPrismaModule.prisma.codeSnippet.findMany,
      ).toHaveBeenCalledTimes(1);
      expect(
        libServerPrismaModule.prisma.codeSnippet.findMany,
      ).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    });
  });

  describe(CodeSnippetsService.prototype.create.name, () => {
    it('should create a code snippet', async () => {
      const createCodeSnippetInput: Omit<
        CodeSnippet,
        'id' | 'is_deleted' | 'created_at' | 'updated_at' | 'deleted_at'
      > = {
        name: 'mock-name',
        code: 'mock-code',
        user_id: 'mock-user-id',
      };

      await codeSnippetsService.create(createCodeSnippetInput);

      expect(
        libServerPrismaModule.prisma.codeSnippet.create,
      ).toHaveBeenCalledTimes(1);
      expect(
        libServerPrismaModule.prisma.codeSnippet.create,
      ).toHaveBeenCalledWith({
        data: {
          name: 'mock-name',
          code: 'mock-code',
          user_id: 'mock-user-id',
        },
      });
    });
  });

  describe(CodeSnippetsService.prototype.update.name, () => {
    it('should update a code snippet', async () => {
      const updateCodeSnippetInput: Partial<
        Omit<CodeSnippet, 'id' | 'created_at' | 'updated_at'>
      > = {
        name: 'mock-name',
        code: 'mock-code',
      };

      await codeSnippetsService.update(1, updateCodeSnippetInput);

      expect(
        libServerPrismaModule.prisma.codeSnippet.update,
      ).toHaveBeenCalledTimes(1);
      expect(
        libServerPrismaModule.prisma.codeSnippet.update,
      ).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          code: 'mock-code',
          name: 'mock-name',
        },
      });
    });

    it('should throw if code snippet with given id was not found', async () => {
      const updateCodeSnippetInput = {
        name: 'mock-name',
        code: 'mock-code',
      };
      mockPrismaCodeSnippetUpdate.mockRejectedValue(
        new PrismaClientKnownRequestError('mock-error', {
          code: 'P2025',
          clientVersion: 'mock-version',
        }),
      );

      // NOTE: await expect().rejects.toThrow() did not catch
      // the wrong error code
      try {
        await codeSnippetsService.update(1, updateCodeSnippetInput);
      } catch (e) {
        const error = e as PrismaClientKnownRequestError;
        expect(error).toBeInstanceOf(PrismaClientKnownRequestError);
        expect(error.code).toBe('P2025');
      }
    });
  });

  describe(CodeSnippetsService.prototype.softDelete.name, () => {
    it('should soft delete a code snippet', async () => {
      await codeSnippetsService.softDelete(1);

      expect(
        libServerPrismaModule.prisma.codeSnippet.update,
      ).toHaveBeenCalledTimes(1);
      expect(
        libServerPrismaModule.prisma.codeSnippet.update,
      ).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          is_deleted: true,
          deleted_at: expect.any(Date),
        },
      });
    });

    it('should throw if code snippet with given id was not found', async () => {
      mockPrismaCodeSnippetUpdate.mockRejectedValue(
        new PrismaClientKnownRequestError('mock-error', {
          code: 'P2025',
          clientVersion: 'mock-version',
        }),
      );

      // NOTE: await expect().rejects.toThrow() did not catch
      // the wrong error code
      try {
        await codeSnippetsService.softDelete(1);
      } catch (e) {
        const error = e as PrismaClientKnownRequestError;
        expect(error).toBeInstanceOf(PrismaClientKnownRequestError);
        expect(error.code).toBe('P2025');
      }
    });
  });
});
