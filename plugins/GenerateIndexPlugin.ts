import { KitPlugin, ProxyPluginAPI, Asset } from '../kit';
import {
  getIdentifierAccordingToNameAndDir,
  getAssetPathFromAbsolute
} from '../utils';
import { readFileSync } from 'fs-extra';
import { template } from 'lodash';

export interface GenerateIndexPluginOptions {
  output: string;
  template: string;
}

export default class GenerateIndexPlugin implements KitPlugin {
  namespace = 'generate-index-plugin';
  options: GenerateIndexPluginOptions;
  constructor(o: GenerateIndexPluginOptions) {
    this.options = o;
  }
  content: string[] = [];

  apply(api: ProxyPluginAPI) {
    api.syncHooks.beforeAssetEmit.tap(this.namespace, (asset: Asset) => {
      const identifier = getIdentifierAccordingToNameAndDir(asset.from);
      this.content.push(
        `export { default as ${identifier} } from './ast/${identifier}';`
      );
    });

    api.syncHooks.onAssetsComplete.tap(this.namespace, () => {
      const tpl = readFileSync(this.options.template, 'utf8');
      api.extraAssets$.next({
        to: getAssetPathFromAbsolute(this.options.output),
        content: template(tpl)({ content: this.content.join('\n') })
      });
    });
  }
}
