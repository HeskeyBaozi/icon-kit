import PluginAPI from './PluginAPI';
import KitService from './Service';
import { Observable } from 'rxjs';
import { ParsedPath } from 'path';

export interface CwdNeeded {
  cwd: string;
}

export interface ResolvePluginsArgs extends CwdNeeded {
  plugins: KitPlugin[];
}

export interface KitPlugin<O = any> {
  namespace: string;
  options?: O;
  apply: (api: ProxyPluginAPI, options?: O) => void;
}

export interface KitProcessor {
  namespace: string;
  options?: object;
  transform: (asset: Asset) => Promise<Asset>;
}

export interface ProxyPluginAPI extends PluginAPI {
  config: typeof KitService.prototype.config;
  registerCommand: typeof KitService.prototype.registerCommand;
  asyncHooks: typeof KitService.prototype.asyncHooks;
  generateFiles: typeof KitService.prototype.generateFiles;
  assets$: typeof KitService.prototype.assets$;
  extraAssets$: typeof KitService.prototype.extraAssets$;
}

export interface KitConfig {
  context?: string;
  sources: string[];
  flow?: (KitProcessor | null)[];
  destination: string;
  plugins?: KitPlugin[];
}

export interface KitFullConfig extends KitConfig {
  context: string;
  flow: (KitProcessor | null)[];
  plugins: KitPlugin[];
}

export interface AssetPath extends ParsedPath {
  absolute: string;
}

export interface Asset {
  from: AssetPath;
  to: AssetPath | null;
  content: string;
}

export interface EnsuredAsset extends Asset {
  to: AssetPath;
}

export interface ExtraAsset {
  from?: AssetPath;
  to: AssetPath;
  content: string;
}
