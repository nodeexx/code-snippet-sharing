import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  render,
  cleanup,
  type RenderResult,
  queries,
} from '@testing-library/svelte';
import Component from './Card.svelte';
import { SlotTest } from '../testing';

describe(Component.name, () => {
  let renderResult: RenderResult<Component, typeof queries>;

  beforeEach(() => {
    renderResult = render(Component);
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the component', () => {
    expect(renderResult.component).toBeTruthy();
  });

  it('should render default slot contents', () => {
    const renderResult = render(SlotTest, { props: { component: Component } });

    expect(renderResult.queryByText('mock-slot-text')).toBeTruthy();
  });
});
