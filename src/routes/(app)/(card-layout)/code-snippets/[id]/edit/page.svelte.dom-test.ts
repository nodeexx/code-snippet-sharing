import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Component from './+page.svelte';
import type { CreateEditCodeSnippetFormSchema } from '$lib/shared/code-snippets/dtos';
import * as skeletonlabsSkeletonModule from '@skeletonlabs/skeleton';
import type { ToastStore } from '@skeletonlabs/skeleton';
import { getMockFormValue } from '$lib/shared/superforms/testing';
import { getMockCreateCodeSnippetFormConstraints } from '$lib/shared/code-snippets/testing';

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
