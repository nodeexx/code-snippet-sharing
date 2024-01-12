<script lang="ts">
export let component: any;
export let text: string = 'mock-slot-text';
</script>

<svelte:component this="{component}">
  <div data-testid="slot-content">{text}</div>
</svelte:component>
