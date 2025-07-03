# vite-plugin-app-router

[![npm version](https://badgen.net/npm/v/vite-plugin-app-router)](https://www.npmjs.com/package/vite-plugin-app-router)

## Getting Started With React

#### Install:

```bash
npm install -D vite-plugin-app-router
npm install react-router
```

Add to your `vite.config.js`:

```js
import { vitePluginAppRouter } from "vite-plugin-app-router";

export default {
  plugins: [
    // ...
    vitePluginAppRouter(),
  ],
};
```

## Overview

Using router look like nextjs

### React

**experimental**

```tsx
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useRoutes } from "react-router-dom";

import { routes } from "~react-virtual-router";

const App = () => {
  const element = useRoutes(routes);
  return <Suspense fallback={<div>Loading...</div>}>{element}</Suspense>;
};

const app = createRoot(document.getElementById("root")!);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

**Type**

```ts
// vite-env.d.ts
/// <reference types="vite-plugin-app-router/client" />
```

#### Example

Folder structure

```bash
└── 📁src
    └── 📁app
        └── 📁(protected)
            └── 📁dashboard
                ├── page.tsx
            └── 📁profile.tsx
                ├── page.tsx
            ├── layout.tsx
            ├── not-found.tsx
            ├── page.tsx
        └── 📁(public)
            └── 📁login
                ├── page.tsx
            └── 📁product
                └── 📁[productId]
                    ├── page.tsx
            └── 📁register
                ├── page.tsx
            └── 📁shop
                └── 📁[...slug]
                    ├── page.tsx
            ├── layout.tsx
        ├── error.tsx
        ├── layout.tsx
        ├── not-found.tsx
    └── 📁assets
        ├── react.svg
    ├── App.tsx
    ├── main.tsx
    └── vite-env.d.ts
```
