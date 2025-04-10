// import { inject } from 'vue'
import { Ref } from '@type-dom/signals';
import { routerKey, routeLocationKey } from './injectionSymbols';
import { Router } from './router/router.interface';
import { RouteMap } from './typed-routes/route-map';
import { RouteLocationNormalizedLoaded } from './typed-routes';
import { inject } from '@type-dom/framework';

/**
 * Returns the router instance. Equivalent to using `$router` inside
 * templates.
 */
export function useRouter(): Router {
  return inject(routerKey)!;
}

/**
 * Returns the current route location. Equivalent to using `$route` inside
 * templates.
 */
export function useRoute<Name extends keyof RouteMap = keyof RouteMap>(
  _name?: Name
): Ref<RouteLocationNormalizedLoaded<Name>> {
  return inject(routeLocationKey)!;
}
