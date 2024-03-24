import type { CodeSnippet } from '@prisma/client';
import type { ToastStore } from '@skeletonlabs/skeleton';
import * as skeletonlabsSkeletonModule from '@skeletonlabs/skeleton';
import { cleanup, render } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import type { UnwrapEffects, ZodValidation } from 'sveltekit-superforms';
import type { SuperForm } from 'sveltekit-superforms/client';
import * as sveltekitSuperformsClientModule from 'sveltekit-superforms/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AnyZodObject } from 'zod';

import { getMockCodeSnippet } from '$lib/shared/code-snippets/testing';
import { getMockFormValue } from '$lib/shared/superforms/testing';

import Component from './+page.svelte';

type SuperFormReturnType = SuperForm<
  UnwrapEffects<ZodValidation<AnyZodObject>>,
  unknown
>;

vi.mock('$lib/client/components/code-snippets', async () => {
  return {
    CodeSnippetCard: (await import('./page.CodeSnippetCard.mock.svelte'))
      .default,
  };
});

describe(Component.name, () => {
  let codeSnippets: CodeSnippet[];

  beforeEach(() => {
    vi.spyOn(skeletonlabsSkeletonModule, 'getToastStore').mockReturnValue({
      trigger: vi.fn(),
    } as Partial<ToastStore> as ToastStore);
    vi.spyOn(sveltekitSuperformsClientModule, 'superForm').mockReturnValue({
      message: writable({ type: 'success', message: 'mock-message' }),
    } as Partial<SuperFormReturnType> as SuperFormReturnType);
  });

  afterEach(() => {
    cleanup();
  });

  it('should render default text when there are no code snippets', () => {
    codeSnippets = [];
    const renderResult = render(Component, {
      props: {
        data: {
          authUser: null,
          deleteForm: getMockFormValue(),
          codeSnippets,
          query: {
            filterBy: '',
          },
          previousPageUrlPath: undefined,
          nextPageUrlPath: undefined,
        },
      },
    });

    expect(
      renderResult.queryAllByText('mock-code-snippet-card').length,
    ).toEqual(0);
    expect(renderResult.getByText('No code snippets found')).toBeTruthy();
  });

  it('should render multiple code snippets', () => {
    codeSnippets = [
      getMockCodeSnippet({ id: 1 }),
      getMockCodeSnippet({ id: 2 }),
    ];
    const renderResult = render(Component, {
      props: {
        data: {
          authUser: null,
          deleteForm: getMockFormValue(),
          codeSnippets,
          query: {
            filterBy: '',
          },
          previousPageUrlPath: undefined,
          nextPageUrlPath: undefined,
        },
      },
    });

    expect(
      renderResult.queryAllByText('mock-code-snippet-card').length,
    ).toEqual(2);
  });
});
