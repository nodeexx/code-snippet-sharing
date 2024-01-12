import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Component from './+page.svelte';
import * as skeletonlabsSkeletonModule from '@skeletonlabs/skeleton';
import type { ToastStore } from '@skeletonlabs/skeleton';
import * as sveltekitSuperformsClientModule from 'sveltekit-superforms/client';
import { writable } from 'svelte/store';
import type { SuperForm } from 'sveltekit-superforms/client';
import type { UnwrapEffects, ZodValidation } from 'sveltekit-superforms';
import type { AnyZodObject } from 'zod';
import { getMockFormValue } from '$lib/shared/superforms/testing';
import { getMockCodeSnippet } from '$lib/shared/code-snippets/testing';
import type { CodeSnippet } from '@prisma/client';

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
