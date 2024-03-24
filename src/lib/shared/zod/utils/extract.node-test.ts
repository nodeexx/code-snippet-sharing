import { describe, expect, it } from 'vitest';
import { z, ZodError } from 'zod';

import { extractZodErrorPaths } from './extract';

describe(extractZodErrorPaths.name, () => {
  it('should return error path if error is thrown', () => {
    const mockError = new ZodError([
      {
        code: 'too_small',
        minimum: 0,
        type: 'number',
        inclusive: false,
        exact: false,
        message: 'Page number must be > 0',
        path: ['page'],
      },
    ]);

    const errorPaths = extractZodErrorPaths(mockError);

    expect(errorPaths).toEqual([['page']]);
  });

  it('should return error path if error is thrown', () => {
    const schema = z.object({
      name: z.string().min(1),
      age: z.number().min(18),
    });
    const result = schema.safeParse({
      name: '',
      age: 17,
    });
    if (result.success) {
      throw new Error('Expected error to be thrown');
    }

    const errorPaths = extractZodErrorPaths(result.error);

    expect(errorPaths).toEqual([['name'], ['age']]);
  });
});
