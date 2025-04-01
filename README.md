# Router

This library was generated with vue-router .

## Building

Run `nx build TypeRouter` to build the library.

## Running unit tests

Run `nx test TypeRouter` to execute the unit tests via [Jest](https://jestjs.io).

## Example

```ts
import { createHashHistory, createRouter } from '@type-router'

import HomeView from './HomeView.vue'
import AboutView from './AboutView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/about', component: AboutView },
]

const router = createRouter({
  history: createHashHistory(),
  routes,
})

const app = new RootApp().mount('body');
router.install(app);

```
