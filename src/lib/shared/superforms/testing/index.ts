import type { SuperValidated, ZodValidation } from 'sveltekit-superforms';
import type { AnyZodObject } from 'zod';

export function getMockFormValue<
  T extends ZodValidation<AnyZodObject>,
  M = App.Superforms.Message,
>(overrides?: Partial<SuperValidated<T, M>>): SuperValidated<T, M> {
  const defaultValue = {
    id: 'mock-superform-id',
    constraints: {},
    data: {},
    errors: {},
    posted: true,
    valid: false,
  } as SuperValidated<T, M>;

  let value = { ...defaultValue };
  if (overrides) {
    value = Object.assign(value, overrides);
  }

  return value;
}
