import { KitPlugin, ProxyPluginAPI } from '@kit';

export interface GenerateIconListPluginOptions {
  output: string;
}

export default class GenerateIconListPlugin implements KitPlugin {
  namespace = 'generate-icon-list-plugin';
  options: GenerateIconListPluginOptions;
  constructor(o: GenerateIconListPluginOptions) {
    this.options = o;
  }
  apply(api: ProxyPluginAPI) {}
}
