<script lang="ts">
import { getToastStore } from '@skeletonlabs/skeleton';
import type { SuperValidated } from 'sveltekit-superforms';
import { superForm } from 'sveltekit-superforms/client';

import { Alert } from '$lib/client/components/common';
import {
  showToastIfFormMessagePresent,
  showToastOnInternetDisconnect,
} from '$lib/client/global-messages/utils';
import type { SuperformsMessage } from '$lib/client/superforms/types';
import { createEditCodeSnippetFormSchema } from '$lib/shared/code-snippets/dtos';

export let form: SuperValidated<
  typeof createEditCodeSnippetFormSchema,
  SuperformsMessage
>;
export let type: 'create' | 'edit';
export let id = 'code-snippet-create-edit-form';

const toastStore = getToastStore();

const {
  form: formData,
  message,
  errors,
  enhance,
} = superForm(form, {
  validators: createEditCodeSnippetFormSchema,
  onUpdated({ form }) {
    showToastIfFormMessagePresent(toastStore, form);
  },
  onError({ result }) {
    showToastOnInternetDisconnect(toastStore, result);
  },
});
</script>

<form
  {id}
  method="post"
  action="{type === 'create' ? '?/create' : '?/edit'}"
  class="flex h-full flex-col items-center gap-4"
  data-testid="code-snippet-create-edit-form"
  use:enhance
>
  <label class="label flex w-full flex-shrink-0 flex-col gap-2">
    <span>Name *</span>
    <input
      type="text"
      name="name"
      placeholder="Code snippet name"
      class="input"
      aria-invalid="{$errors.name ? 'true' : undefined}"
      bind:value="{$formData.name}"
    />
    <span
      class="w-full px-3 text-xs text-error-400"
      style:visibility="{$errors.name ? 'visible' : 'hidden'}"
      data-testid="name-error-message"
    >
      {$errors.name?.at(0)}
    </span>
  </label>

  <label class="label flex w-full flex-1 flex-col gap-2">
    <span>Code *</span>
    <textarea
      name="code"
      placeholder="Code snippet"
      class="textarea flex-1 resize-none font-mono-token"
      aria-invalid="{$errors.code ? 'true' : undefined}"
      bind:value="{$formData.code}"
    ></textarea>
    <span
      class="w-full px-3 text-xs text-error-400"
      style:visibility="{$errors.code ? 'visible' : 'hidden'}"
      data-testid="code-error-message"
    >
      {$errors.code?.at(0)}
    </span>
  </label>

  {#if $message}
    <noscript class="w-full">
      <Alert type="{$message.type}" message="{$message.message}" />
    </noscript>
  {/if}
</form>
