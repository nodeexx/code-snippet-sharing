import { cleanup, render } from '@testing-library/svelte';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';

import * as appNavigationModule from '$app/navigation';

import Component from './Error.svelte';

describe(Component.name, () => {
  let invalidateAllSpy: MockInstance;

  beforeEach(() => {
    invalidateAllSpy = vi.spyOn(appNavigationModule, 'invalidateAll');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should show navigation bar and call invalidateAll', () => {
    const renderResult = render(Component);

    expect(renderResult.queryByTestId('app-bar')).toBeTruthy();
    expect(invalidateAllSpy).toHaveBeenCalled();
  });

  it('should not show navigation bar and not call invalidateAll', () => {
    const renderResult = render(Component, {
      showAppBar: false,
    });

    expect(renderResult.queryByTestId('app-bar')).toBeFalsy();
    expect(invalidateAllSpy).not.toHaveBeenCalled();
  });

  it('should show custom text and message', () => {
    const title = 'Test Title';
    const message = 'Test Message';
    const renderResult = render(Component, {
      title,
      message,
    });

    expect(renderResult.getByText(title)).toBeTruthy();
    expect(renderResult.getByText(message)).toBeTruthy();
  });
});
