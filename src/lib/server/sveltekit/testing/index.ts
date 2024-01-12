import type { Cookies, RequestEvent, ServerLoad } from '@sveltejs/kit';

export function getMockCookies(partial: Partial<Cookies> = {}): Cookies {
  return partial as Cookies;
}

export function getMockLocals(partial: Partial<App.Locals> = {}): App.Locals {
  return partial as App.Locals;
}

export function getMockRequest(partial: Partial<Request> = {}): Request {
  return partial as Request;
}

/**
 * Use `PageServerLoadEvent` type from `./$types.ts` as `T`
 */
export function getMockPageServerLoadEvent<T extends Parameters<ServerLoad>[0]>(
  partial: Partial<T> = {},
): T {
  return partial as T;
}

/**
 * Use `RequestEvent` type from `./$types.ts` as `T`
 */
export function getMockRequestEvent<T extends RequestEvent>(
  partial: Partial<T> = {},
): T {
  return partial as T;
}
