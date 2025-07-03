import type { Plugin } from "vite";
import { AppRouterContext } from "./context";

export function vitePluginAppRouter(): Plugin {
  let context: AppRouterContext;

  return {
    name: "vite-plugin-app-router",

    configResolved(config) {
      context = new AppRouterContext(config.root);
      context.rebuild(); // initial build
    },

    configureServer(server) {
      context.setupServer(server);
    },

    resolveId(id) {
      if (id === "~react-virtual-router") return id;
    },

    load(id) {
      if (id === "~react-virtual-router") {
        return context.virtualModuleCode;
      }
    },
  };
}
