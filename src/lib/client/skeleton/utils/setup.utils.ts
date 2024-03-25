// Skeleton Popup required middleware
import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  type Middleware,
  offset,
  shift,
} from '@floating-ui/dom';
// Skeleton Popup optional middleware
import { autoPlacement, hide, inline, size } from '@floating-ui/dom';
import { initializeStores, storePopup } from '@skeletonlabs/skeleton';

type SkeletonPopupMiddlewareFactory = () => Middleware;

export function setupSkeletonPopup() {
  let floatingUiDomOptionalMiddleware: SkeletonPopupMiddlewareFactory[] = [];
  floatingUiDomOptionalMiddleware = [size, autoPlacement, hide, inline];

  // For Skeleton Popup
  storePopup.set({
    computePosition,
    autoUpdate,
    offset,
    // @ts-expect-error
    shift,
    flip,
    arrow,
    ...floatingUiDomOptionalMiddleware,
  });
}

export function setupSkeletonModalToastDrawer(): void {
  initializeStores();
}
