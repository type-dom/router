import { A, inject, TypeFragment } from '@type-dom/framework';
import { computed, signal } from '@type-dom/signals';
import {
  IRouterLink,
  RouterLinkProps,
  UseLinkOptions,
  UseLinkReturn,
} from './router-link.interface';
import { getLinkClass, useLink } from './utils';
import { routerKey } from '../injectionSymbols';
import { RouteMap } from '../typed-routes';

export class RouterLink extends TypeFragment implements IRouterLink {
  className: 'RouterLink';
  override props: RouterLinkProps;
  useLink: typeof useLink;

  constructor(params: RouterLinkProps) {
    super();
    this.className = 'RouterLink';
    this.assignProps<RouterLinkProps>({
      ariaCurrentValue: 'page',
    });
    this.props = this.useParams(params);
    this.useLink = useLink;
  }

  override setup() {
    const props = this.props;

    const link = signal(useLink(props as UseLinkOptions<string | symbol>));
    const { options } = inject(routerKey)!;

    const elClass = computed(() => ({
      [getLinkClass(
        props.activeClass,
        options.linkActiveClass,
        'router-link-active'
      )]: link.get().isActive,
      // [getLinkClass(
      //   props.inactiveClass,
      //   options.linkInactiveClass,
      //   'router-link-inactive'
      // )]: !link.isExactActive,
      [getLinkClass(
        props.exactActiveClass,
        options.linkExactActiveClass,
        'router-link-exact-active'
      )]: link.get().isExactActive,
    }));

    if (props.custom) {
      this.slotChild(props.slot?.(link.get()));
    } else {
      this.addChild(
        new A({
          class: elClass.get().value,
          slot: props.slot?.(link.get()),
          attrObj: {
            'aria-current': link.get().isExactActive
              ? props.ariaCurrentValue
              : null,
            href: link.get().href,
          },
          events: {
            click: link.get().navigate,
          },
        })
      );
    }
    // const children = (props.slot ?? props.slots?.default) && preferSingleVNode(props.slots.default(link));
    // return props.custom
    //   ? children
    //   : h(
    //       'a',
    //       {
    //         'aria-current': link.get().isExactActive
    //           ? props.ariaCurrentValue
    //           : null,
    //         href: link.get().href,
    //         // this would override user added attrs but Vue will still add
    //         // the listener, so we end up triggering both
    //         onClick: link.get().navigate,
    //         class: elClass.get().value,
    //       },
    //       children
    //     );
  }
}

// compatConfig: { MODE: 3 },
