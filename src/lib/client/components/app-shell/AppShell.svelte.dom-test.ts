import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Component from './AppShell.svelte';
import { SlotTest } from '../testing';

describe(Component.name, () => {
  afterEach(() => {
    cleanup();
  });

  it('should render with navigation bar', () => {
    const renderResult = render(Component);

    expect(renderResult.queryByTestId('app-bar')).toBeTruthy();
  });

  it('should render without navigation bar', () => {
    const renderResult = render(Component, {
      props: { appBar: false },
    });

    expect(renderResult.queryByTestId('app-bar')).toBeFalsy();
  });

  it('should render slot contents', () => {
    const renderResult = render(SlotTest, { props: { component: Component } });

    expect(renderResult.queryByText('mock-slot-text')).toBeTruthy();
  });
});
