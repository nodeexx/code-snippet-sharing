import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import Component from './AppBar.svelte';

describe(Component.name, () => {
  afterEach(() => {
    cleanup();
  });

  it('should render', () => {
    const renderResult = render(Component);

    expect(renderResult.component).toBeTruthy();
  });
});
