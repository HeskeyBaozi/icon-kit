import { KitPlugin, ProxyPluginAPI, Asset } from '@kit';
import { set, get, template } from 'lodash';
import { getThemeAccordingToDir } from '../utils';
import { resolve, parse, relative, dirname, normalize } from 'path';
import { readFileSync } from 'fs-extra';
import { oldIcons } from '../processors/XMLProcessor';

export interface GenerateIconListPluginOptions {
  output: string;
  template: string;
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
        outline?: string;
        twotone?: string;
      };
    } = {};

    api.syncHooks.beforeAssetEmit.tap(this.namespace, (asset: Asset) => {
      if (asset.from && asset.from.dir) {
        const theme = getThemeAccordingToDir(asset.from.dir);
        const rl = relative(dirname(this.options.output), asset.from.absolute);
        let name = asset.from.name;
        if (oldIcons.includes(name)) {
          name = `${name} (< 3.9)`;
        }
        set(
          acc,
          [name, theme],
          `<img width="70" height="70" src="${normalize(rl)}" alt="${name}" />`
        );
      }
    });

    api.syncHooks.onAssetsComplete.tap(this.namespace, () => {
      let content = '';
      Object.keys(acc).forEach((name) => {
        const target = acc[name]!;
        const row = ['fill', 'outline', 'twotone'].map((theme) =>
          get(target, theme, ' - ')
        );
        row.unshift(name);
        content += row.join(' | ') + '\n';
      });

      const tpl = readFileSync(this.options.template, 'utf8');

      api.extraAssets$.next({
        to: {
          ...parse(this.options.output),
          absolute: this.options.output
        },
        content: template(tpl)({ icons: content })
      });
    });
  }
}
