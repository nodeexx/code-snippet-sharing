import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import { SlotTest } from '$lib/client/components/testing';

import Component from './+layout.svelte';

describe(Component.name, () => {
  afterEach(() => {
    cleanup();
  });

  it('should render the component', () => {
    const renderResult = render(Component);

    expect(renderResult.component).toBeTruthy();
  });

  it('should render slot content', () => {
    const renderResult = render(SlotTest, { props: { component: Component } });

    expect(renderResult.getByTestId('slot-content').textContent).toBe(
      'mock-slot-text',
    );
  });
});
