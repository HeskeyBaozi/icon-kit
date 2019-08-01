import {
  KitPlugin,
  ProxyPluginAPI,
  EnsuredAsset,
  ExtraAsset,
  Asset
} from '../../types';
import { createWriteStream, ensureDir, emptyDir } from 'fs-extra';
import * as signale from 'signale';
import chalk from 'chalk';
import { dirname } from 'path';

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
          if (api.config!.destination) {
            await emptyDir(api.config!.destination);
          }
          api.assets$.subscribe({
            next: async (asset: Asset) => {
              if (api.config!.destination && asset.to) {
                const { to, content } = asset;
                api.syncHooks.beforeEmit.call(asset);
                await ensureDir(dirname(to.absolute));
                const writeStream = createWriteStream(to.absolute, 'utf8');
                writeStream.write(content);
                writeStream.end();
              }
            },
            complete: () => {
              api.syncHooks.afterEmit.call();
              if (api.config!.destination) {
                signale.success(
                  `Done. The sources: ${chalk.underline.cyan(
                    '[ ' + api.config!.sources + ' ]'
                  )}.`
                );
              } else {
                signale.success(
                  `Done. There is no file emitted. The sources: ${chalk.underline.cyan(
                    '[ ' + api.config!.sources + ' ]'
                  )}.`
                );
              }
            }
          });

          api.extraAssets$.subscribe({
            next: async (asset: ExtraAsset) => {
              const { to, content } = asset;
              api.syncHooks.beforeEmit.call(asset);
              await ensureDir(dirname(to.absolute));
              const writeStream = createWriteStream(to.absolute, 'utf8');
              writeStream.write(content);
              writeStream.end();
              signale.success(
                `Generate extra file: ${chalk.underline.cyan(to.base)}.`
              );
            },
            complete: () => {
              api.syncHooks.afterEmit.call();
            }
          });
        }
      },
      options
    );
  }
}
