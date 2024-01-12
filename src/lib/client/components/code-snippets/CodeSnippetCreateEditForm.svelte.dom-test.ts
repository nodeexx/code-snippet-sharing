import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Component from './CodeSnippetCreateEditForm.svelte';
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

  it('should not display errors', () => {
    const renderResult = render(Component, {
      props: {
        form: getMockFormValue<CreateEditCodeSnippetFormSchema>({
          ...getMockCreateCodeSnippetFormConstraints(),
          data: {
            name: '',
            code: '',
          },
        }),
        type: 'create',
      },
    });

    expect(renderResult.component).toBeTruthy();
    expect(renderResult.getByTestId('name-error-message')).not.toBeVisible();
    expect(renderResult.getByTestId('code-error-message')).not.toBeVisible();
  });

  it('should display errors', () => {
    const renderResult = render(Component, {
      props: {
        form: getMockFormValue<CreateEditCodeSnippetFormSchema>({
          ...getMockCreateCodeSnippetFormConstraints(),
          data: {
            name: '',
            code: '',
          },
          errors: {
            code: ['Code is required'],
            name: ['Name is required'],
          },
        }),
        type: 'create',
      },
    });

    expect(renderResult.getByTestId('name-error-message')).toBeVisible();
    expect(renderResult.getByTestId('name-error-message').textContent).toEqual(
      'Name is required',
    );
    expect(renderResult.getByTestId('code-error-message')).toBeVisible();
    expect(renderResult.getByTestId('code-error-message').textContent).toEqual(
      'Code is required',
    );
  });

  it('should render form with a default id', () => {
    const renderResult = render(Component, {
      props: {
        form: getMockFormValue<CreateEditCodeSnippetFormSchema>({
          ...getMockCreateCodeSnippetFormConstraints(),
          data: {
            name: '',
            code: '',
          },
        }),
        type: 'create',
      },
    });

    expect(
      renderResult.getByTestId('code-snippet-create-edit-form'),
    ).toHaveAttribute('id', 'code-snippet-create-edit-form');
  });

  it('should render form with a custom id', () => {
    const renderResult = render(Component, {
      props: {
        form: getMockFormValue<CreateEditCodeSnippetFormSchema>({
          ...getMockCreateCodeSnippetFormConstraints(),
          data: {
            name: '',
            code: '',
          },
        }),
        type: 'create',
        id: 'mock-custom-id',
      },
    });

    expect(
      renderResult.getByTestId('code-snippet-create-edit-form'),
    ).toHaveAttribute('id', 'mock-custom-id');
  });

  it('should render form with a create form action', () => {
    const renderResult = render(Component, {
      props: {
        form: getMockFormValue<CreateEditCodeSnippetFormSchema>({
          ...getMockCreateCodeSnippetFormConstraints(),
          data: {
            name: '',
            code: '',
          },
        }),
        type: 'create',
      },
    });

    expect(
      renderResult.getByTestId('code-snippet-create-edit-form'),
    ).toHaveAttribute('action', '?/create');
  });

  it('should render form with an edit form action', () => {
    const renderResult = render(Component, {
      props: {
        form: getMockFormValue<CreateEditCodeSnippetFormSchema>({
          ...getMockCreateCodeSnippetFormConstraints(),
          data: {
            name: '',
            code: '',
          },
        }),
        type: 'edit',
      },
    });

    expect(
      renderResult.getByTestId('code-snippet-create-edit-form'),
    ).toHaveAttribute('action', '?/edit');
  });

  it('should render edit form with preset field values', () => {
    const renderResult = render(Component, {
      props: {
        form: getMockFormValue<CreateEditCodeSnippetFormSchema>({
          ...getMockCreateCodeSnippetFormConstraints(),
          data: {
            name: 'mock-name',
            code: 'mock-code',
          },
        }),
        type: 'edit',
      },
    });

    expect(
      renderResult.getByPlaceholderText('Code snippet name'),
    ).toHaveDisplayValue('mock-name');
    expect(
      renderResult.getByPlaceholderText('Code snippet'),
    ).toHaveDisplayValue('mock-code');
  });
});
