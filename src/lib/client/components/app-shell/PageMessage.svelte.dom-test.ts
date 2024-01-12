import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Component from './PageMessage.svelte';

describe(Component.name, () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render the error variant', () => {
    const renderResult = render(Component, {
      props: {
        type: 'error',
        message: 'Error message',
      },
    });

    expect(renderResult.queryByText('Error message')).toBeTruthy();
    expect(renderResult.queryByTestId('error-page-message')).toBeTruthy();
    expect(renderResult.queryByTestId('success-page-message')).toBeFalsy();
  });

  it('should render the success variant', () => {
    const renderResult = render(Component, {
      props: {
        type: 'success',
        message: 'Success message',
      },
    });

    expect(renderResult.queryByText('Success message')).toBeTruthy();
    expect(renderResult.queryByTestId('error-page-message')).toBeFalsy();
    expect(renderResult.queryByTestId('success-page-message')).toBeTruthy();
  });
});
