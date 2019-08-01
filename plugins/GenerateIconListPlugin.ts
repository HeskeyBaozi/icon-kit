import { KitPlugin, ProxyPluginAPI, Asset } from '@kit';
import { set } from 'lodash';
import { getThemeAccordingToDir } from '../utils';
import GenerateFilesPlugin from './GenerateFilesPlugin';
import { resolve } from 'path';

export interface GenerateIconListPluginOptions {
  output: string;
}

export default class GenerateIconListPlugin implements KitPlugin {
  namespace = 'generate-icon-list-plugin';
  options: GenerateIconListPluginOptions;
  constructor(o: GenerateIconListPluginOptions) {
    this.options = o;
  }
  apply(api: ProxyPluginAPI) {
    const acc: {
      [name: string]: {
        fill?: string;
        outlint?: string;
        'two-tone'?: string;
      };
    } = {};

    api.syncHooks.beforeEmit.tap(this.namespace, (asset: Asset) => {
      if (asset.from && asset.from.dir) {
        const theme = getThemeAccordingToDir(asset.from.dir);
        const absolute = asset.from.absolute;
        const name = asset.from.name;
        set(acc, [name, theme], `![${name}](${absolute})`);
      }
    });

    api.registerPlugin(
      new GenerateFilesPlugin([
        {
          output: this.options.output,
          dataSource: resolve(__dirname, '../templates/icons-list.md')
        }
      ])
    );

    api.syncHooks.beforeExtraAssetsTakingEffect.tap(this.namespace, () => {
      console.log(acc);
    });
  }
}
