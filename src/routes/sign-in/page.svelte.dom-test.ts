import type { ToastStore } from '@skeletonlabs/skeleton';
import * as skeletonlabsSkeletonModule from '@skeletonlabs/skeleton';
import {
  cleanup,
  queries,
  render,
  type RenderResult,
} from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getMockFormValue } from '$lib/shared/superforms/testing';

import type { FormSchema } from './+page.server';
import Component from './+page.svelte';

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
