import {
  KitPlugin,
  ProxyPluginAPI,
  EnsuredAsset,
  ExtraAsset
} from '../../types';
import { createWriteStream, ensureDir, emptyDir } from 'fs-extra';
import * as signale from 'signale';
import chalk from 'chalk';
import { dirname } from 'path';
import { concat } from 'rxjs/operators';

export default class GenerateCommandPlugin implements KitPlugin {
  namespace = 'build-in:generate-command';
  options?: object;
  constructor(options?: object) {
    this.options = options;
  }
  apply(api: ProxyPluginAPI, options?: object) {
    api.registerCommand(
      'generate',
      async (args: object) => {
        if (api.assets$ && api.extraAssets$) {
          await emptyDir(api.config!.destination);
          api.assets$.pipe(concat(api.extraAssets$)).subscribe({
            next: async (asset: EnsuredAsset | ExtraAsset) => {
              const { to, content } = asset;
              api.syncHooks.beforeEmit.call(asset);
              const noEmitFlag = api.syncHooks.noEmitFlag.call(asset);
              if (noEmitFlag) {
                // no emit
              } else {
                // omit
                await ensureDir(dirname(to.absolute));
                const writeStream = createWriteStream(to.absolute, 'utf8');
                writeStream.write(content);
                writeStream.end();
              }
            },
            complete: () => {
              api.syncHooks.afterEmit.call();
              signale.success(
                `Process file(s) finshied, from the sources: ${chalk.underline.cyan(
                  '[ ' + api.config!.sources + ' ]'
                )}.`
              );
            }
          });
        }
      },
      options
    );
  }
}
