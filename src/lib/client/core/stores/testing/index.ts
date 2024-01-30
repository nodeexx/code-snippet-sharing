import type { NavigationTarget } from '@sveltejs/kit';

export const mockPreviousAppPageValue: NavigationTarget = {
  params: {},
  route: {
    id: '/some/path',
  },
  url: new URL('http://localhost/some/path'),
};
