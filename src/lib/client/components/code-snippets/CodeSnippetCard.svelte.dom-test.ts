import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Component from './CodeSnippetCard.svelte';
import * as skeletonlabsSkeletonModule from '@skeletonlabs/skeleton';
import type { ToastStore } from '@skeletonlabs/skeleton';
import { getMockCodeSnippet } from '$lib/shared/code-snippets/testing';
import type { SuperForm } from 'sveltekit-superforms/client';
import type { DeleteCodeSnippetFormSchema } from '$lib/shared/code-snippets/dtos';
import { getMockAuthUser } from '$lib/shared/lucia/testing';
import type { CodeSnippet } from '@prisma/client';
import type { UnwrapEffects } from 'sveltekit-superforms';

type DeleteCodeSnippetSuperForm = SuperForm<
  UnwrapEffects<DeleteCodeSnippetFormSchema>,
  App.Superforms.Message
>;

describe(Component.name, () => {
  let codeSnippet: CodeSnippet;
  let codeSnippetDeletionSuperForm: DeleteCodeSnippetSuperForm;

  beforeEach(() => {
    codeSnippet = getMockCodeSnippet();
    codeSnippetDeletionSuperForm = {
      enhance: vi.fn(),
    } as Partial<DeleteCodeSnippetSuperForm> as DeleteCodeSnippetSuperForm;
    vi.spyOn(skeletonlabsSkeletonModule, 'getToastStore').mockReturnValue({
      trigger: vi.fn(),
    } as Partial<ToastStore> as ToastStore);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should not display action buttons to an unauthenticated user', () => {
    const renderResult = render(Component, {
      props: {
        codeSnippet,
        codeSnippetDeletionSuperForm,
        authUser: null,
      },
    });

    expect(renderResult.queryByTestId('edit-button-1')).toBeFalsy();
    expect(renderResult.queryByTestId('delete-button-1')).toBeFalsy();
  });

  it('should not display action buttons to a non-author', () => {
    const renderResult = render(Component, {
      props: {
        codeSnippet,
        codeSnippetDeletionSuperForm,
        authUser: getMockAuthUser({
          userId: 'mock-other-user-id',
        }),
      },
    });

    expect(renderResult.queryByTestId('edit-button-1')).toBeFalsy();
    expect(renderResult.queryByTestId('delete-button-1')).toBeFalsy();
  });

  it('should display action buttons to an author', () => {
    const renderResult = render(Component, {
      props: {
        codeSnippet,
        codeSnippetDeletionSuperForm,
        authUser: getMockAuthUser({}),
      },
    });

    expect(renderResult.queryByTestId('edit-button-1')).toBeTruthy();
    expect(renderResult.queryByTestId('delete-button-1')).toBeTruthy();
  });
});
