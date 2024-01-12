import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  render,
  cleanup,
  type RenderResult,
  queries,
} from '@testing-library/svelte';
import Component from './+page.svelte';
import * as skeletonlabsSkeletonModule from '@skeletonlabs/skeleton';
import type { FormSchema } from './+page.server';
import { getMockFormValue } from '$lib/shared/superforms/testing';
import type { ToastStore } from '@skeletonlabs/skeleton';

describe(Component.name, () => {
  let renderResult: RenderResult<Component, typeof queries>;

  beforeEach(() => {
    vi.spyOn(skeletonlabsSkeletonModule, 'getToastStore').mockReturnValue({
      trigger: vi.fn(),
    } as Partial<ToastStore> as ToastStore);
    renderResult = render(Component, {
      props: {
        data: {
          authUser: null,
          form: getMockFormValue<FormSchema>(),
        },
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render the component', () => {
    expect(renderResult.component).toBeTruthy();
  });
});
