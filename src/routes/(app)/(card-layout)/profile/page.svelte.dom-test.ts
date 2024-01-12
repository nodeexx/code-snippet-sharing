import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  render,
  cleanup,
  type RenderResult,
  queries,
} from '@testing-library/svelte';
import Component from './+page.svelte';
import type { AuthUser } from '$lib/shared/lucia/types';
import * as skeletonlabsSkeletonModule from '@skeletonlabs/skeleton';
import type { ToastStore } from '@skeletonlabs/skeleton';
import type { FormSchema } from './+page.server';
import { getMockFormValue } from '$lib/shared/superforms/testing';

describe(Component.name, () => {
  let renderResult: RenderResult<Component, typeof queries>;

  beforeEach(() => {
    vi.spyOn(skeletonlabsSkeletonModule, 'getToastStore').mockReturnValue({
      trigger: vi.fn(),
    } as Partial<ToastStore> as ToastStore);
    renderResult = render(Component, {
      props: {
        data: {
          authUser: { email: 'user@example.com' } as AuthUser,
          form: getMockFormValue<FormSchema>(),
        },
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should display users email', () => {
    expect(renderResult.getByText('user@example.com')).toBeTruthy();
  });
});
