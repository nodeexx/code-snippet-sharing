import type { ToastStore } from '@skeletonlabs/skeleton';
import * as skeletonlabsSkeletonModule from '@skeletonlabs/skeleton';
import { cleanup, render } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CreateEditCodeSnippetFormSchema } from '$lib/shared/code-snippets/dtos';
import { getMockCreateCodeSnippetFormConstraints } from '$lib/shared/code-snippets/testing';
import { getMockFormValue } from '$lib/shared/superforms/testing';

import Component from './+page.svelte';

describe(Component.name, () => {
  beforeEach(() => {
    vi.spyOn(skeletonlabsSkeletonModule, 'getToastStore').mockReturnValue({
      trigger: vi.fn(),
    } as Partial<ToastStore> as ToastStore);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render component', () => {
    const renderResult = render(Component, {
      props: {
        data: {
          authUser: null,
          form: getMockFormValue<CreateEditCodeSnippetFormSchema>({
            ...getMockCreateCodeSnippetFormConstraints(),
            data: {
              name: '',
              code: '',
            },
          }),
        },
      },
    });

    expect(renderResult.component).toBeTruthy();
  });
});
