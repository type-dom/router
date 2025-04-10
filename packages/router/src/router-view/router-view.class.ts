import {
  TypeElement,
  TypeNode,
  XElement,
  TypeDiv,
  inject,
  provide,
  onMounted,
} from '@type-dom/framework';
import Module from 'module';
import { computed, reaction, signal, unref, watch } from '@type-dom/signals';

import {
  matchedRouteKey,
  routerViewLocationKey,
  viewDepthKey,
} from '../injectionSymbols';
import {
  RouteLocationNormalizedLoaded,
  RouteLocationNormalizedLoadedGeneric,
} from '../typed-routes';
import { RouteLocationMatched } from '../types';
import { isSameRouteRecord } from '../location';
import { assign, isRouteComponent } from '../utils';
import { IRouterView, RouterViewProps } from './router-view.interface';
import { getClassFromModule } from '../navigationGuards';
// import { RouterViewDevtoolsContext } from './RouterView';

let routerViewDepth = 1;

/**
 * 路由视图组件
 * 是个伪节点
 * @author <xjf> <<xjf7711@qq.com>>
 * @create-date 2024-04-24 09:06:03
 * @example
 *
 */
export class RouterView extends TypeDiv implements IRouterView {
  className: 'RouterView';
  override props: RouterViewProps;
  private routerViewNumber: number;

  constructor(params = {} as RouterViewProps) {
    super();
    this.className = 'RouterView';
    this.routerViewNumber = routerViewDepth++;
    this.attr.addObj({
      name: 'router-view-' + this.routerViewNumber,
    });
    this.assignProps({ name: 'default' });
    this.props = this.useParams(params);
  }

  override setup() {
    // console.warn('RouterView setup ');
    // __DEV__ && warnDeprecatedUsage()
    const props = this.props;
    // 嵌套路由时，Layout ---> ButtonWrapper, 对应多个RouterView
    const injectedRoute = inject(routerViewLocationKey)!;
    // console.warn('injectedRoute is ', injectedRoute);
    const routeToDisplay = computed<RouteLocationNormalizedLoaded>(
      () =>
        (props.route as RouteLocationNormalizedLoaded) ||
        (injectedRoute.get() as RouteLocationNormalizedLoaded)
    );
    const injectedDepth = inject(viewDepthKey, 0);
    // The depth changes based on empty components option, which allows passthrough routes e.g. routes with children
    // that are used to reuse the `path` property
    const depth = computed<number>(() => {
      // console.warn('depth . ');
      let initialDepth = unref(injectedDepth);
      const { matched } = routeToDisplay.get();
      let matchedRoute: RouteLocationMatched | undefined;
      while (
        (matchedRoute = matched[initialDepth]) &&
        !matchedRoute.components
      ) {
        initialDepth++;
      }
      // console.warn('depth . initialDepth is ', initialDepth);
      return initialDepth;
    });
    const matchedRouteRef = computed<RouteLocationMatched | undefined>(() => {
      // console.warn('matchedRouteRef computed . ');
      // console.warn('matchedRouteRef . routeToDisplay.get() is ', routeToDisplay.get());
      // console.warn('matchedRouteRef . depth.get() is ', depth.get());
      return routeToDisplay.get().matched[depth.get()];
    });

    provide(
      viewDepthKey,
      computed(() => depth.get() + 1)
    );
    provide(matchedRouteKey, matchedRouteRef);
    provide(routerViewLocationKey, routeToDisplay);

    const viewRef = signal<TypeElement>();

    // watch at the same time the component instance, the route record we are
    // rendering, and the name
    watch(
      () => [viewRef.get(), matchedRouteRef.get(), props.name] as const, // todo viewRef的监听有问题
      (newValues, oldValues) => {
        // console.log('watch viewRef.get() .... , this.routerViewNumber is ', this.routerViewNumber);
        const [instance, toRoute, name] = newValues || [];
        const [oldInstance, fromRoute] = oldValues || [];
        // console.warn('instance, to, name  is ', instance, toRoute, name);
        // console.warn('oldInstance from  is ', oldInstance, fromRoute);
        // copy reused instances
        if (toRoute) {
          // this will update the instance for new instances as well as reused
          // instances when navigating to a new route
          toRoute.instances[name!] = instance; // Layout 层会不触发
          // the component instance is reused for a different route or name, so
          // we copy any saved update or leave guards. With async setup, the
          // mounting component will mount before the matchedRoute changes,
          // making instance === oldInstance, so we check if guards have been
          // added before. This works because we remove guards when
          // unmounting/deactivating components
          if (
            fromRoute &&
            fromRoute !== toRoute &&
            instance &&
            instance === oldInstance
          ) {
            if (!toRoute.leaveGuards.size) {
              toRoute.leaveGuards = fromRoute.leaveGuards;
            }
            if (!toRoute.updateGuards.size) {
              toRoute.updateGuards = fromRoute.updateGuards;
            }
          }
        }

        // trigger beforeRouteEnter next callbacks
        if (
          instance &&
          toRoute &&
          // if there is no instance but to and from are the same this might be
          // the first visit
          (!fromRoute || !isSameRouteRecord(toRoute, fromRoute) || !oldInstance)
        ) {
          // console.warn('then callback(instance)  to.enterCallbacks is ', to.enterCallbacks);
          (toRoute.enterCallbacks[name!] || []).forEach((callback) =>
            callback(instance)
          );
        }
      },
      { flush: 'post' }
    );

    onMounted(() => {
      // 如果没有，加载的组件，会被加载2次；如何Checkbox会被创建2次；
      // return () => { //setup返回的函数是Vue组件的render渲染函数，负责生成虚拟DOM节点并控制组件渲染逻辑。
      // const fromRoute = matchedRouteRef.get();
      // effect(() => {
      // todo 如果加载的component中有嵌套的RouterView,如何处理 ？？？
      //      模拟vuejs中的render函数；
      reaction(
        () => [routeToDisplay.get(), matchedRouteRef.get()],
        (to, from) => {
          console.log('reaction this.routerViewNumber is ', this.routerViewNumber);
          // console.error('watch route and matchRoute  to and from is ', to, from);
          // effect(() => { // dead loop
          const route = to[0] as RouteLocationNormalizedLoadedGeneric;
          // const route = routeToDisplay.get() //
          // console.warn('route is ', route);
          const fromRoute = from?.[0] as RouteLocationNormalizedLoadedGeneric;
          if (fromRoute === route) {
            // console.warn('fromRoute === route');
            return;
          }
          // we need the value at the time we render because when we unmount, we
          // navigated to a different location so the value is different
          const currentName = props.name;
          const matchedRoute = to[1] as RouteLocationMatched | undefined;
          // const matchedRoute = matchedRouteRef.get()
          // console.warn('matchedRoute is ', matchedRoute);
          const fromMatchedRoute = from?.[1] as RouteLocationMatched;
          if (fromMatchedRoute && fromMatchedRoute === matchedRoute) {
            // console.warn('matchedRoute === fromMatchedRoute');
            return;
          }
          let component = matchedRoute?.instances[currentName!];
          if (component) {
            // 嵌套层级， Layout时，比较一下。
            viewRef.set(component);
            if (fromMatchedRoute?.instances[currentName!] === component) {
              return;
            }
            this.clearChildrenDom();
            this.addChild(component); // 必须要有，否则菜单切换会导致有页面不显示
            // useRecurseRender(component);
            this.dom?.appendChild(component!.dom!);
            // component.mount(this.dom);
            return;
          }
          /**
           * component的导入方式有3种方式：
           * 1. import { Home } from './home.ts';
           * 2. import Home from './home.ts';   Home.default = Home;
           * 3. () => import('./home.ts'); 需要 getClassFromModule处理
           * vuejs中对 .vue的文件做了处理了。
           */
          const ViewComponent =
            matchedRoute &&
            currentName !== undefined &&
            matchedRoute.components![currentName];
          // console.error('ViewComponent is ', ViewComponent);

          if (!ViewComponent) {
            // console.warn('ViewComponent is undefined , route is ', route);
            // return normalizeSlot(props.slot, { Component: ViewComponent, route })
            // this.slotChildren(normalizeSlot(props.slot, { Component: ViewComponent, route }));
            return;
          }
          const child = this.childNodes[0];
          if (child && child.constructor === ViewComponent) {
            // console.warn('child is ', child);
            return;
          }
          // props from route configuration
          // console.warn('currentName is ', currentName);
          const routePropsOption = matchedRoute?.props[currentName!];
          const routeProps = routePropsOption
            ? routePropsOption === true
              ? route.params
              : typeof routePropsOption === 'function'
              ? routePropsOption(route)
              : routePropsOption
            : null;

          const onVnodeUnmounted = (vnode: TypeNode) => {
            // remove the instance reference to prevent leak
            // if (vnode.isUnmounted) {
            //   matchedRoute.instances[currentName!] = null
            // }
            matchedRoute.instances[currentName!] = null;
          };

          // mountComponent(matchedRoute, fromRoute)
          // console.error('ViewComponent is ', ViewComponent);
          if (isRouteComponent(ViewComponent)) {
            component = new (ViewComponent as any)(
              assign({}, routeProps, {
                onVnodeUnmounted,
                // refEl: viewRef,
              })
            ) as TypeElement;
            viewRef.set(component);
            // this.slotChildren(component);
            this.clearChildren();
            this.addChild(component);
            component.mount(this.dom);
            // matchedRoute.instances[currentName] = component;
          } else {
            (ViewComponent as any)().then((module: Module) => {
              // test-dts select dead loop
              const Component = getClassFromModule(module) as typeof XElement;
              component = new Component(
                assign({}, routeProps, {
                  onVnodeUnmounted,
                  // refEl: viewRef,
                })
              );
              viewRef.set(component);
              this.clearChildren();
              this.addChild(component);
              // this.slotChildren(component);
              component.mount(this.dom);
              // matchedRoute.instances[currentName] = component;
            });
          }

          // const component = h(
          //   ViewComponent,
          //   assign({}, routeProps, attrs, {
          //     onVnodeUnmounted,
          //     ref: viewRef,
          //   })
          // )

          // if (
          //   (__DEV__ || __FEATURE_PROD_DEVTOOLS__) &&
          //   isBrowser &&
          //   component.ref
          // ) {
          //   // TODO: can display if it's an alias, its props
          //   const info: RouterViewDevtoolsContext = {
          //     depth: depth.get(),
          //     name: matchedRoute.name,
          //     path: matchedRoute.path,
          //     meta: matchedRoute.meta,
          //   }
          //   const internalInstances = isArray(component.ref)
          //     ? component.ref.map(r => r.i)
          //     : [component.ref.i]
          //   internalInstances.forEach(instance => {
          //     instance.__vrv_devtools = info
          //   })
          // }

          // return (
          //   // pass the vnode to the slot as a prop.
          //   // h and <component :is="..."> both accept vnodes
          //   normalizeSlot(props.slot, { Component: component, route }) ||
          //   component
          // )
          // })
        },
        {
          immediate: true, // 没有的话，第一次加载时不会执行，组件会不显示。
        }
      );
    });
  }
}
