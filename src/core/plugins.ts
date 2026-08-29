export type PluginCapability = 'import' | 'export' | 'llm' | 'storage' | 'search' | 'validation';

export interface UniversePlugin {
  readonly id: string;
  readonly version: string;
  readonly apiVersion: 1;
  readonly capabilities: ReadonlySet<PluginCapability>;
  initialize(): Promise<void>;
  dispose(): Promise<void>;
}

export class PluginRegistry {
  readonly #plugins = new Map<string, UniversePlugin>();

  async register(plugin: UniversePlugin): Promise<void> {
    if (!/^[a-z][a-z0-9.-]{2,127}$/.test(plugin.id)) throw new Error(`Invalid plugin id: ${plugin.id}`);
    if (plugin.apiVersion !== 1) throw new Error(`Unsupported plugin API version: ${plugin.apiVersion}`);
    if (this.#plugins.has(plugin.id)) throw new Error(`Plugin already registered: ${plugin.id}`);
    await plugin.initialize();
    this.#plugins.set(plugin.id, plugin);
  }

  get(id: string): UniversePlugin | undefined { return this.#plugins.get(id); }

  byCapability(capability: PluginCapability): UniversePlugin[] {
    return [...this.#plugins.values()].filter((plugin) => plugin.capabilities.has(capability));
  }

  async unregister(id: string): Promise<boolean> {
    const plugin = this.#plugins.get(id);
    if (!plugin) return false;
    await plugin.dispose();
    return this.#plugins.delete(id);
  }
}
