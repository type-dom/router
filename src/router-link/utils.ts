import {
  getCurrentInstance,
  inject,
  nextFrame,
  TypeNode,
} from '@type-dom/framework';
// import { UseLinkDevtoolsContext, UseLinkOptions, UseLinkReturn } from '../RouterLink';
import { RouteLocation, RouteMap } from '../typed-routes';
import { routeLocationKey, routerKey } from '../injectionSymbols';
import { computed, effect, unref } from '@type-dom/signals';
import { isRouteLocation } from '../types';
import { RouteRecord } from '../matcher/types';
import { isSameRouteLocationParams, isSameRouteRecord } from '../location';
import { isArray, isBrowser, noop } from '../utils';
import { NavigationFailure } from '../errors';
import { warn } from '../warning';
import {
  UseLinkDevtoolsContext,
  UseLinkOptions,
  UseLinkReturn,
} from './router-link.interface';

// TODO: we could allow currentRoute as a prop to expose `isActive` and
//  `isExactActive` behavior should go through an RFC
/**
 * Returns the internal behavior of a {@link RouterLink} without the rendering part.
 *
 * @param props - a `to` location and an optional `replace` flag
 */
export function useLink<Name extends keyof RouteMap = keyof RouteMap>(
  props: UseLinkOptions<Name>
): UseLinkReturn<Name> {
  const router = inject(routerKey)!;
  const currentRoute = inject(routeLocationKey)!.get()!;

  // let hasPrevious = false
  // let previousTo: unknown = null

  const route = computed(() => {
    const to = unref(props.toPath);

    // if (__DEV__ && (!hasPrevious || to !== previousTo)) {
    //   if (!isRouteLocation(to)) {
    //     if (hasPrevious) {
    //       warn(
    //         `Invalid value for prop "to" in useLink()\n- to:`,
    //         to,
    //         `\n- previous to:`,
    //         previousTo,
    //         `\n- props:`,
    //         props
    //       )
    //     } else {
    //       warn(
    //         `Invalid value for prop "to" in useLink()\n- to:`,
    //         to,
    //         `\n- props:`,
    //         props
    //       )
    //     }
    //   }
    //
    //   previousTo = to
    //   hasPrevious = true
    // }

    return router.resolve(to);
  });

  const activeRecordIndex = computed<number>(() => {
    const { matched } = route.get();
    const { length } = matched;
    const routeMatched: RouteRecord | undefined = matched[length - 1];
    const currentMatched = currentRoute.matched;
    if (!routeMatched || !currentMatched.length) return -1;
    const index = currentMatched.findIndex(
      isSameRouteRecord.bind(null, routeMatched)
    );
    if (index > -1) return index;
    // possible parent record
    const parentRecordPath = getOriginalPath(
      matched[length - 2] as RouteRecord | undefined
    );
    return (
      // we are dealing with nested routes
      length > 1 &&
        // if the parent and matched route have the same path, this link is
        // referring to the empty child. Or we currently are on a different
        // child of the same parent
        getOriginalPath(routeMatched) === parentRecordPath &&
        // avoid comparing the child with its parent
        currentMatched[currentMatched.length - 1].path !== parentRecordPath
        ? currentMatched.findIndex(
            isSameRouteRecord.bind(null, matched[length - 2])
          )
        : index
    );
  });

  const isActive = computed<boolean>(
    () =>
      activeRecordIndex.get() > -1 &&
      includesParams(currentRoute.params, route.get().params)
  );
  const isExactActive = computed<boolean>(
    () =>
      activeRecordIndex.get() > -1 &&
      activeRecordIndex.get() === currentRoute.matched.length - 1 &&
      isSameRouteLocationParams(currentRoute.params, route.get().params)
  );

  function navigate(
    e: MouseEvent = {} as MouseEvent
  ): Promise<void | NavigationFailure> {
    if (guardEvent(e)) {
      const p = router[unref(props.replace) ? 'replace' : 'push'](
        unref(props.toPath)
        // avoid uncaught errors are they are logged anyway
      ).catch(noop);
      if (
        props.viewTransition &&
        typeof document !== 'undefined' &&
        'startViewTransition' in document
      ) {
        document.startViewTransition(() => p);
      }
      return p;
    }
    return Promise.resolve();
  }

  // devtools only
  // if ((__DEV__ || __FEATURE_PROD_DEVTOOLS__) && isBrowser) {
  //   const instance = getCurrentInstance()
  //   if (instance) {
  //     const linkContextDevtools: UseLinkDevtoolsContext = {
  //       route: route.get(),
  //       isActive: isActive.get(),
  //       isExactActive: isExactActive.get(),
  //       error: null,
  //     }
  //
  //     // @ts-expect-error: this is internal
  //     instance.__vrl_devtools = instance.__vrl_devtools || []
  //     // @ts-expect-error: this is internal
  //     instance.__vrl_devtools.push(linkContextDevtools)
  //     effect(
  //       () => {
  //         nextFrame(()=> {
  //           linkContextDevtools.route = route.get()
  //           linkContextDevtools.isActive = isActive.get()
  //           linkContextDevtools.isExactActive = isExactActive.get()
  //           linkContextDevtools.error = isRouteLocation(unref(props.toPath))
  //             ? null
  //             : 'Invalid "to" value'
  //         })
  //       },
  //       // { flush: 'post' } // todo DOM update
  //     )
  //   }
  // }

  /**
   * NOTE: update {@link _RouterLinkI}'s `$slots` type when updating this
   */
  return {
    route,
    href: computed(() => route.get().href),
    isActive,
    isExactActive,
    navigate,
  };
}

function preferSingleVNode(vnodes: TypeNode[]) {
  return vnodes.length === 1 ? vnodes[0] : vnodes;
}

function guardEvent(e: MouseEvent) {
  // don't redirect with control keys
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
  // don't redirect when preventDefault called
  if (e.defaultPrevented) return;
  // don't redirect on right click
  if (e.button !== undefined && e.button !== 0) return;
  // don't redirect if `target="_blank"`
  // @ts-expect-error getAttribute does exist
  if (e.currentTarget && e.currentTarget.getAttribute) {
    // @ts-expect-error getAttribute exists
    const target = e.currentTarget.getAttribute('target');
    if (/\b_blank\b/i.test(target)) return;
  }
  // this may be a Weex event which doesn't have this method
  if (e.preventDefault) e.preventDefault();

  return true;
}

function includesParams(
  outer: RouteLocation['params'],
  inner: RouteLocation['params']
): boolean {
  for (const key in inner) {
    const innerValue = inner[key];
    const outerValue = outer[key];
    if (typeof innerValue === 'string') {
      if (innerValue !== outerValue) return false;
    } else {
      if (
        !isArray(outerValue) ||
        outerValue.length !== innerValue.length ||
        innerValue.some((value, i) => value !== outerValue[i])
      )
        return false;
    }
  }

  return true;
}

/**
 * Get the original path value of a record by following its aliasOf
 * @param record
 */
function getOriginalPath(record: RouteRecord | undefined): string {
  return record ? (record.aliasOf ? record.aliasOf.path : record.path) : '';
}

/**
 * Utility class to get the active class based on defaults.
 * @param propClass
 * @param globalClass
 * @param defaultClass
 */
export const getLinkClass = (
  propClass: string | undefined,
  globalClass: string | undefined,
  defaultClass: string
): string =>
  propClass != null
    ? propClass
    : globalClass != null
    ? globalClass
    : defaultClass;
