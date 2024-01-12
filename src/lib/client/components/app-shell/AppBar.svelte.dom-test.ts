import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
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
