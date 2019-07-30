import PluginAPI from './PluginAPI';
import KitService from './Service';

export interface CwdNeeded {
  cwd: string;
}

export interface ResolvePluginsArgs extends CwdNeeded {
  plugins: KitPlugin[];
}

export interface KitPlugin {
  namespace: string;
  options?: object;
  apply: (api: ProxyPluginAPI, options?: object) => void;
}

export interface KitProcessor {
  namespace: string;
  options?: object;
  transform: (asset: Asset) => Promise<Asset>;
}

export interface ProxyPluginAPI extends PluginAPI {
  config: typeof KitService.prototype.config;
  registerCommand: typeof KitService.prototype.registerCommand;
  readonly Assets$: typeof KitService.prototype.Assets$;
}

export interface KitConfig {
  context?: string;
  sources: string[];
  flow?: KitProcessor[];
  destination: string;
  plugins?: KitPlugin[];
}

export interface KitFullConfig extends KitConfig {
  context: string;
  flow: KitProcessor[];
  plugins: KitPlugin[];
}

export interface Asset {
  path: string;
  content: string;
}
