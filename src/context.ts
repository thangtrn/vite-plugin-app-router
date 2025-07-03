import type { ViteDevServer } from "vite";
import type { Node } from "./types";
import { findAllTsxFiles } from "./fileUtils";
import { buildRouteTree } from "./treeBuilder";
import { generateRoutesVirtualModule } from "./virtualModule";
import path from "path";

export class AppRouterContext {
  private _server: ViteDevServer | undefined;
  private _virtualModuleCode = "";
  private _tree: Node | null = null;

  constructor(private root: string) {}

  setupServer(server: ViteDevServer) {
    if (this._server === server) return;
    this._server = server;
    this.setupWatcher(server.watcher);
  }

  setupWatcher(watcher: ViteDevServer["watcher"]) {
    watcher.on("add", this.onFileChanged.bind(this));
    watcher.on("unlink", this.onFileChanged.bind(this));
    watcher.on("change", this.onFileChanged.bind(this));
  }

  async onFileChanged(file: string) {
    if (!file.endsWith(".tsx") || !file.includes(path.join("src", "app")))
      return;

    await this.rebuild();

    const module = this._server?.moduleGraph.getModuleById(
      "~react-virtual-router"
    );
    if (module) {
      this._server?.moduleGraph.invalidateModule(module);
    }

    this._server?.ws.send({
      type: "full-reload",
    });
  }

  async rebuild() {
    const appDir = path.join(this.root, "src", "app");
    const files = findAllTsxFiles(appDir, this.root);
    this._tree = buildRouteTree(files);
    this._virtualModuleCode = generateRoutesVirtualModule(this._tree);
  }

  get virtualModuleCode() {
    return this._virtualModuleCode;
  }

  get tree() {
    return this._tree;
  }
}
