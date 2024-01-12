import type {
  CssClasses,
  ToastSettings,
  ToastStore,
} from '@skeletonlabs/skeleton';
import type {
  SuperValidated,
  UnwrapEffects,
  ZodValidation,
} from 'sveltekit-superforms';
import type { AnyZodObject } from 'zod';
import { browser } from '$app/environment';
import type { SuperformsOnErrorResult } from '$lib/client/superforms/types';

export function showToast(
  toastStore: ToastStore,
  type: App.GlobalMessageType,
  message: string,
): void {
  const backgroundMapper: Record<App.GlobalMessageType, CssClasses> = {
    success: 'variant-filled-success',
    error: 'variant-filled-error',
  };
  const background = backgroundMapper[type];

  const t: ToastSettings = {
    message: message,
    background,
  };

  toastStore.trigger(t);
}

export function showToastIfFormMessagePresent(
  toastStore: ToastStore,
  form: SuperValidated<
    UnwrapEffects<ZodValidation<AnyZodObject>>,
    App.Superforms.Message
  >,
): void {
  if (form.message) {
    const { type, message } = form.message;
    showToast(toastStore, type, message);
  }
}

export function createFlashToastSubscriber(
  toastStore: ToastStore,
): (flashMessage: App.GlobalMessage | undefined) => void {
  return (flashMessage: App.GlobalMessage | undefined) => {
    if (!browser || !flashMessage) {
      return;
    }

    showToast(toastStore, flashMessage.type, flashMessage.message);
  };
}

export function showToastOnInternetDisconnect(
  toastStore: ToastStore,
  result: SuperformsOnErrorResult,
): void {
  if (result.error.message.startsWith('Failed to fetch')) {
    showToast(
      toastStore,
      'error',
      'Failed to connect, check your Internet connection.',
    );
  }
}
