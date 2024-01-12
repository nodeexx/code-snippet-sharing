// Skeleton Popup required middleware
import {
  computePosition,
  autoUpdate,
  offset,
  shift,
  flip,
  arrow,
  type Middleware,
} from '@floating-ui/dom';
// Skeleton Popup optional middleware
import { size, autoPlacement, hide, inline } from '@floating-ui/dom';
import { storePopup, initializeStores } from '@skeletonlabs/skeleton';

type SkeletonPopupMiddlewareFactory = () => Middleware;

export function setupSkeletonPopup() {
  let floatingUiDomOptionalMiddleware: SkeletonPopupMiddlewareFactory[] = [];
  floatingUiDomOptionalMiddleware = [size, autoPlacement, hide, inline];

  // For Skeleton Popup
  storePopup.set({
    computePosition,
    autoUpdate,
    offset,
    // @ts-ignore
    shift,
    flip,
    arrow,
    ...floatingUiDomOptionalMiddleware,
  });
}

export function setupSkeletonModalToastDrawer(): void {
  initializeStores();
}
