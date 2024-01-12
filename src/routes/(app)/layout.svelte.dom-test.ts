import { describe, it, expect, afterEach } from 'vitest';
import Component from './+layout.svelte';
import { render, cleanup } from '@testing-library/svelte';
import { SlotTest } from '$lib/client/components/testing';

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
