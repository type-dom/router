# TypeDom Router

基于 TypeScript 的轻量级前端路由库，支持声明式路由配置和客户端路由管理，实现单页应用（SPA）的无刷新导航。

## 安装

    bash npm install @type-dom/router
    或
    yarn add @type-dom/router

## 核心功能

- 声明式路由配置
- 动态路由匹配与组件渲染
- 路由参数 & 查询参数解析
- 路由守卫（导航拦截/过渡钩子）
- HTML5 History 模式支持
- 类型安全的 TypeScript 支持

## 快速上手

### 1. 定义路由

```ts
    import { RouteRecordRaw, createRouter, createHashHistory } from "type-dom/router";
    import { HomeView } from './HomeView.ts'
    import { AboutView } from './AboutView.ts'
    import { UserView } from './UserView.ts'
    import { RootApp } from './RootApp.ts'
    const routes: RouteRecordRaw[] = [
        { path: "/", component: HomeView, name: "home" },
        { path: "/about", component: AboutView, name: "about" },
        { path: "/user/:id",
          component: UserView,
          name: "user",
          props: (params) => ({ userId: params.id }) // 参数传递
        }
    ];

    const router = createRouter({
        history: createHashHistory(),
        routes,
    })
    
```
### 2. 启动路由

```ts
    import { RootApp } from './RootApp.ts';
    const app = new RootApp().mount('body');
    router.install(app);
    
```

---

## 贡献指南

1. Fork 仓库并提交 PR
2. 确保 TypeScript 类型完备
3. 新增功能需配套测试用例

---

## License

MIT License
