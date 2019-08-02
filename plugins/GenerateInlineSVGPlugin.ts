import { KitPlugin, ProxyPluginAPI, Asset } from '@kit';
import { HelperRenderOptions } from '../utils';

export interface GenerateInlineSVGPluginOptions extends HelperRenderOptions {
  objectLikeSourceProcessorName: string;
  destination: string;
}

export default class GenerateInlineSVGPlugin implements KitPlugin {
  namespace = 'generate-inline-svg-plugin';
  options: GenerateInlineSVGPluginOptions;
  constructor(o: GenerateInlineSVGPluginOptions) {
    this.options = o;
  }

  apply(api: ProxyPluginAPI) {
    api.syncHooks.afterProcessor
      .for(this.options.objectLikeSourceProcessorName)
      .tap(this.namespace, (asset: Asset) => {});
  }
}
