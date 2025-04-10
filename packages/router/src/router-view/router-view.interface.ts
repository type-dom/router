import {
  TypeNode,
  ISlotRaw,
  ITypeDiv,
  TypeDivProps,
} from '@type-dom/framework';
import {
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
} from '../typed-routes';
import { RouteLocationMatched } from '../types';

export interface IRouterView extends ITypeDiv {
  className: 'RouterView';
}

export interface RouterViewProps extends TypeDivProps {
  name?: string; // default: 'default'
  // allow looser type for user facing api
  route?: RouteLocationNormalized;

  slot?: ({
    Component,
    route,
  }: {
    Component?: TypeNode | false;
    route: RouteLocationNormalizedLoaded;
  }) => ISlotRaw;
}

export interface RouterViewDevtoolsContext
  extends Pick<RouteLocationMatched, 'path' | 'name' | 'meta'> {
  depth: number;
}
