import {
  cleanup,
  queries,
  render,
  type RenderResult,
} from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SlotTest } from '../testing';
import Component from './Card.svelte';

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
