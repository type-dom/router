import {
  ITypeFragment,
  TypeFragmentProps,
  TypeNode,
} from '@type-dom/framework';
import { Computed, MaybeRef } from '@type-dom/signals';

import {
  RouteLocationAsPath,
  RouteLocationAsPathGeneric,
  RouteLocationAsRelativeGeneric,
  RouteLocationAsRelativeTyped,
  RouteLocationAsString,
  RouteLocationRaw,
  RouteLocationResolved,
  RouteMap,
  RouteMapGeneric,
} from '../typed-routes';
import { NavigationFailure } from '../errors';

/**
 * Typed version of the `RouterLink` component. Its generic defaults to the typed router, so it can be inferred
 * automatically for JSX.
 *
 * @internal
 */
export interface IRouterLink extends ITypeFragment {
  className: 'RouterLink';
}

export interface RouterLinkOptions extends TypeFragmentProps {
  /**
   * Route Location the link should navigate to when clicked on.
   *  required: true,
   */
  toPath?: MaybeRef<
    | string
    | RouteLocationAsPathGeneric
    | RouteLocationAsRelativeGeneric
    | RouteLocationAsRelativeTyped<RouteMapGeneric, string | symbol>
  >;

  // toPath?: RouteLocationRaw
  /**
   * Calls `router.replace` instead of `router.push`.
   */
  replace?: boolean;
  // TODO: refactor using extra options allowed in router.push. Needs RFC
}

export interface RouterLinkProps extends RouterLinkOptions {
  /**
   * Whether RouterLink should not wrap its content in an `a` tag. Useful when
   * using `v-slot` to create a custom RouterLink
   */
  custom?: boolean;
  /**
   * Class to apply when the link is active
   */
  activeClass?: string;
  /**
   * Class to apply when the link is exact active
   */
  exactActiveClass?: string;
  /**
   * Value passed to the attribute `aria-current` when the link is exact active.
   *
   * @defaultValue `'page'`
   */
  ariaCurrentValue?:
    | 'page'
    | 'step'
    | 'location'
    | 'date'
    | 'time'
    | 'true'
    | 'false;';

  /**
   * Pass the returned promise of `router.push()` to `document.startViewTransition()` if supported.
   */
  viewTransition?: boolean;

  slot?: ({
    route,
    href,
    isActive,
    isExactActive,
    navigate,
  }: // TODO: How do we add the name generic
  UseLinkReturn) => TypeNode[];
}

/**
 * Context passed from router-link components to devtools.
 * @internal
 */
export interface UseLinkDevtoolsContext {
  route: RouteLocationResolved;
  isActive: boolean;
  isExactActive: boolean;
  error: string | null;
}

/**
 * Options passed to {@link useLink}.
 */
export interface UseLinkOptions<Name extends keyof RouteMap = keyof RouteMap> {
  toPath: MaybeRef<
    | RouteLocationAsString
    | RouteLocationAsRelativeTyped<RouteMap, Name>
    | RouteLocationAsPath
    | RouteLocationRaw
  >;

  replace?: MaybeRef<boolean | undefined>;

  /**
   * Pass the returned promise of `router.push()` to `document.startViewTransition()` if supported.
   */
  viewTransition?: boolean;
}

/**
 * Return type of {@link useLink}.
 * @internal
 */
export interface UseLinkReturn<Name extends keyof RouteMap = keyof RouteMap> {
  route: Computed<RouteLocationResolved<Name>>;
  href: Computed<string>;
  isActive: Computed<boolean>;
  isExactActive: Computed<boolean>;

  navigate(e?: MouseEvent): Promise<void | NavigationFailure>;
}
