import { expect } from 'vitest';
import { ZodError } from 'zod';

export function expectZodErrorMessages(
  callback: () => any,
  messages: string[],
) {
  try {
    callback();
  } catch (e) {
    const error = e as ZodError;
    if (!(error instanceof ZodError)) {
      throw e;
    }

    const errorMessages = error.issues.map((issue) => issue.message).sort();
    expect(errorMessages).toEqual(messages);
  }
}
