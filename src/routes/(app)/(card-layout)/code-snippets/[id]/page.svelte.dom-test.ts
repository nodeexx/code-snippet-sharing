import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Component from './+page.svelte';
import type { FormSchema } from './+page.server';
import * as skeletonlabsSkeletonModule from '@skeletonlabs/skeleton';
import type { ToastStore } from '@skeletonlabs/skeleton';
import { getMockFormValue } from '$lib/shared/superforms/testing';
import type { CodeSnippet } from '@prisma/client';
import { getMockCodeSnippet } from '$lib/shared/code-snippets/testing';

describe(Component.name, () => {
  let mockCodeSnippet: CodeSnippet;

  beforeEach(() => {
    mockCodeSnippet = getMockCodeSnippet();
    vi.spyOn(skeletonlabsSkeletonModule, 'getToastStore').mockReturnValue({
      trigger: vi.fn(),
    } as Partial<ToastStore> as ToastStore);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should not display action buttons for a non-author', () => {
    const renderResult = render(Component, {
      props: {
        data: {
          authUser: null,
          codeSnippet: mockCodeSnippet,
          isCodeSnippetAuthor: false,
          form: getMockFormValue<FormSchema>({
            constraints: {},
            data: {},
          }),
        },
      },
    });

    expect(renderResult.getByText('mock-name')).toBeTruthy();
    expect(renderResult.getByText('mock-code')).toBeTruthy();
    expect(renderResult.queryByRole('button', { name: 'Delete' })).toBeFalsy();
    expect(renderResult.queryByRole('button', { name: 'Edit' })).toBeFalsy();
  });

  it('should display action buttons for an author', () => {
    const renderResult = render(Component, {
      props: {
        data: {
          authUser: null,
          codeSnippet: mockCodeSnippet,
          isCodeSnippetAuthor: true,
          form: getMockFormValue<FormSchema>({
            constraints: {},
            data: {},
          }),
        },
      },
    });

    expect(renderResult.getByText('mock-name')).toBeTruthy();
    expect(renderResult.getByText('mock-code')).toBeTruthy();
    expect(renderResult.queryByRole('button', { name: 'Delete' })).toBeTruthy();
    expect(renderResult.queryByRole('button', { name: 'Edit' })).toBeTruthy();
  });
});
