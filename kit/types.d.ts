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

export interface ProxyPluginAPI extends PluginAPI {
  config: typeof KitService.prototype.config;
  registerCommand: typeof KitService.prototype.registerCommand;
}

export interface KitConfig {
  context?: string;
  sources: string[];
  flow?: any[];
  destination: string;
  plugins?: KitPlugin[];
}

export interface KitFullConfig extends KitConfig {
  context: string;
  flow: any[];
  plugins: KitPlugin[];
}

export interface Asset {
  path: string;
  filename: string;
  content: string;
}
