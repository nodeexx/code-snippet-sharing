import { z } from 'zod';

export const findCodeSnippetsDto = z
  .object({
    page: z.number().positive('Page number must be > 0').optional(),
    count: z.number().nonnegative('Count must be >= 0').optional(),
    filterBy: z.enum(['author']).optional(),
    filterValue: z.any().optional(),
    sortBy: z.enum(['created_at']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .refine(
    (data) => {
      if (data.page && data.page > 1) {
        return data.count == null || data.count > 0;
      }

      return true;
    },
    {
      message: 'Count cannot be 0 if page is greater than 1',
      path: ['count'],
    },
  );
export type FindCodeSnippetsDto = typeof findCodeSnippetsDto;
export type FindCodeSnippetsQuery = z.infer<typeof findCodeSnippetsDto>;
