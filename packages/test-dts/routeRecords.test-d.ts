import { describe, it } from 'vitest'
import type { RouteLocationNormalized, RouteRecordRaw } from '../../nx-workspace/libs/router'
// import { defineComponent } from 'vue'
import { Div } from '../../nx-workspace/libs/framework';

// const component = defineComponent({})
const component = new Div();
const components = { default: component }

const routes: any[] = []

describe('RouteRecords', () => {
  // TODO: split into multiple test-dts
  it('works', () => {
    routes.push({ path: '/', redirect: '/foo' })

    routes.push({ path: '/', components, component })

    // a redirect record with children to point to a child
    routes.push({
      path: '/',
      redirect: '/foo',
      children: [
        {
          path: 'foo',
          component,
        },
      ],
    })

    // same but with a nested route
    routes.push({
      path: '/',
      component,
      redirect: '/foo',
      children: [
        {
          path: 'foo',
          component,
        },
      ],
    })

    routes.push({ path: '/a/b', component, props: true })
    routes.push({
      path: '/a/b',
      component,
      props: (to: RouteLocationNormalized<'/[id]+'>) => to.params.id,
    })

    routes.push({ path: '/a/b', components, props: to => to.params.id })
    routes.push({
      path: '/a/b',
      components,
      props: {
        default: (to: RouteLocationNormalized<'/[id]+'>) => to.params.id,
      },
    })
    routes.push({ path: '/', components, props: true })

    // let r: RouteRecordRaw = {
    //   path: '/',
    //   component,
    //   components,
    // }

    function filterNestedChildren(children: RouteRecordRaw[]) {
      return children.filter(r => {
        if (r.redirect) {
          r.children?.map(() => {/*nothing*/})
        }
        if (r.children) {
          r.children = filterNestedChildren(r.children)
        }
      })
    }
    filterNestedChildren(routes)
  })
})
