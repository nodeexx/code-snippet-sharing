import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createFlashToastSubscriber,
  showToast,
  showToastIfFormMessagePresent,
  showToastOnInternetDisconnect,
} from '.';
import type { ToastStore } from '@skeletonlabs/skeleton';
import { getMockFormValue } from '$lib/shared/superforms/testing';
import * as appEnvironmentModule from '$app/environment';
import { z } from 'zod';
import type { SuperformsOnErrorResult } from '$lib/client/superforms/types';

describe(showToast.name, () => {
  let mockToastStore: ToastStore;
  let message: string;

  beforeEach(() => {
    mockToastStore = {
      trigger: vi.fn(),
    } as Partial<ToastStore> as ToastStore;
    message = 'mock-message';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should trigger a success toast', async () => {
    const type: App.GlobalMessageType = 'success';

    showToast(mockToastStore, type, message);

    expect(mockToastStore.trigger).toHaveBeenCalledTimes(1);
    expect(mockToastStore.trigger).toHaveBeenCalledWith({
      message,
      background: 'variant-filled-success',
    });
  });

  it('should trigger an error toast', async () => {
    const type: App.GlobalMessageType = 'error';

    showToast(mockToastStore, type, message);

    expect(mockToastStore.trigger).toHaveBeenCalledTimes(1);
    expect(mockToastStore.trigger).toHaveBeenCalledWith({
      message,
      background: 'variant-filled-error',
    });
  });
});

describe(showToastIfFormMessagePresent.name, () => {
  const schema = z.object({});
  let mockToastStore: ToastStore;
  let message: string;
  let mockForm: ReturnType<
    typeof getMockFormValue<typeof schema, App.Superforms.Message>
  >;

  beforeEach(() => {
    mockToastStore = {
      trigger: vi.fn(),
    } as Partial<ToastStore> as ToastStore;
    message = 'mock-message';
    mockForm = getMockFormValue({
      message: {
        type: 'success',
        message,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should trigger a toast if message is present', async () => {
    showToastIfFormMessagePresent(mockToastStore, mockForm);

    expect(mockToastStore.trigger).toHaveBeenCalledTimes(1);
    expect(mockToastStore.trigger).toHaveBeenCalledWith({
      message,
      background: 'variant-filled-success',
    });
  });

  it('should not trigger a toast if message is not present', async () => {
    mockForm = getMockFormValue({});

    showToastIfFormMessagePresent(mockToastStore, mockForm);

    expect(mockToastStore.trigger).not.toHaveBeenCalled();
  });
});

describe(createFlashToastSubscriber.name, () => {
  let mockToastStore: ToastStore;
  let flashMessage: App.GlobalMessage | undefined;
  let subscriber: ReturnType<typeof createFlashToastSubscriber>;

  beforeEach(() => {
    mockToastStore = {
      trigger: vi.fn(),
    } as Partial<ToastStore> as ToastStore;
    flashMessage = {
      type: 'success',
      message: 'mock-message',
    } as App.GlobalMessage;
    vi.spyOn(appEnvironmentModule, 'browser', 'get').mockReturnValue(true);

    subscriber = createFlashToastSubscriber(mockToastStore);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should trigger a toast', async () => {
    subscriber(flashMessage);

    expect(mockToastStore.trigger).toHaveBeenCalledTimes(1);
    expect(mockToastStore.trigger).toHaveBeenCalledWith({
      message: flashMessage!.message,
      background: 'variant-filled-success',
    });
  });

  it('should not trigger a toast because not in browser environment', async () => {
    vi.spyOn(appEnvironmentModule, 'browser', 'get').mockReturnValue(false);

    subscriber(flashMessage);

    expect(mockToastStore.trigger).not.toHaveBeenCalled();
  });

  it('should not trigger a toast because of absent flash message', async () => {
    const flashMessage = undefined;

    const subscriber = createFlashToastSubscriber(mockToastStore);
    subscriber(flashMessage);

    expect(mockToastStore.trigger).not.toHaveBeenCalled();
  });
});

describe(showToastOnInternetDisconnect.name, () => {
  let mockToastStore: ToastStore;

  beforeEach(() => {
    mockToastStore = {
      trigger: vi.fn(),
    } as Partial<ToastStore> as ToastStore;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should trigger a toast', async () => {
    const mockResult = {
      type: 'error',
      error: new TypeError('Failed to fetch'),
    } as SuperformsOnErrorResult;

    showToastOnInternetDisconnect(mockToastStore, mockResult);

    expect(mockToastStore.trigger).toHaveBeenCalledTimes(1);
    expect(mockToastStore.trigger).toHaveBeenCalledWith({
      message: 'Failed to connect, check your Internet connection.',
      background: 'variant-filled-error',
    });
  });

  it('should not trigger a toast', async () => {
    const mockResult = {
      type: 'error',
      error: new Error('mock-error'),
    } as SuperformsOnErrorResult;

    showToastOnInternetDisconnect(mockToastStore, mockResult);

    expect(mockToastStore.trigger).toHaveBeenCalledTimes(0);
  });
});
