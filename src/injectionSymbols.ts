// import type { InjectionKey, ComputedRef, Ref } from 'vue'
import { Computed, Ref } from '@type-dom/signals';
import { InjectionKey } from '@type-dom/framework';
import type { RouteLocationNormalizedLoaded } from './typed-routes';
import { RouteRecordNormalized } from './matcher/types';
import type { Router } from './router/router.interface';

/**
 * RouteRecord being rendered by the closest ancestor Router View. Used for
 * `onBeforeRouteUpdate` and `onBeforeRouteLeave`. rvlm stands for Router View
 * Location Matched
 *
 * @internal
 */
export const matchedRouteKey = Symbol(
  'router view location matched'
) as InjectionKey<Computed<RouteRecordNormalized | undefined>>;

/**
 * Allows overriding the router view depth to control which component in
 * `matched` is rendered. rvd stands for Router View Depth
 *
 * @internal
 */
export const viewDepthKey = Symbol('router view depth') as InjectionKey<
  Ref<number> | number
>;

/**
 * Allows overriding the router instance returned by `useRouter` in tests. r
 * stands for router
 *
 * @internal
 */
export const routerKey = Symbol('router') as InjectionKey<Router>;

/**
 * Allows overriding the current route returned by `useRoute` in tests. rl
 * stands for route location
 *
 * @internal
 */
export const routeLocationKey = Symbol('route location') as InjectionKey<
  Ref<RouteLocationNormalizedLoaded>
>;

/**
 * Allows overriding the current route used by router-view. Internally this is
 * used when the `route` prop is passed.
 *
 * @internal
 */
export const routerViewLocationKey = Symbol(
  'router view location'
) as InjectionKey<Ref<RouteLocationNormalizedLoaded>>;
