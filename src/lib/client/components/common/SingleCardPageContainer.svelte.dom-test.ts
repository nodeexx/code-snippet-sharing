import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import { SlotTest } from '../testing';
import Component from './SingleCardPageContainer.svelte';

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
