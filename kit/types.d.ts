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
  registerCommand: typeof KitService.prototype.registerCommand;
}
