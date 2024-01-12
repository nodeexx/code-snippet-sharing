import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Component from './SingleCardPageContainer.svelte';
import { SlotTest } from '../testing';

describe(Component.name, () => {
  afterEach(() => {
    cleanup();
  });

  it('should render the component', () => {
    const renderResult = render(Component);
    expect(renderResult.component).toBeTruthy();
  });

  it('should render default slot contents', () => {
    const renderResult = render(SlotTest, { props: { component: Component } });

    expect(renderResult.queryByText('mock-slot-text')).toBeTruthy();
  });
});
