export interface CwdNeeded {
  cwd: string;
}

export interface ResolvePluginsArgs extends CwdNeeded {
  plugins: KitPlugin[];
}

export interface KitPlugin {
  namespace: string;
  options?: object;
  apply: (api: any, options?: object) => void;
}
