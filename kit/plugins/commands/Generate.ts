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
          api.syncHooks.beforeAssetsTakingEffect.call();
          if (api.config!.destination) {
            await emptyDir(api.config!.destination);
          }
          const assets$Subscription = api.assets$.subscribe({
            next: async (asset: Asset) => {
              api.syncHooks.beforeEmit.call(asset);
              if (api.config!.destination && asset.to) {
                const { to, content } = asset;
                await ensureDir(dirname(to.absolute));
                const writeStream = createWriteStream(to.absolute, 'utf8');
                writeStream.write(content);
                writeStream.end();
              }
            },
            complete: () => {
              api.syncHooks.afterAssetsTakingEffect.call();
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

              assets$Subscription.unsubscribe();
              api.syncHooks.beforeExtraAssetsTakingEffect.call();
              const extraAssets$Subsription = api.extraAssets$.subscribe({
                next: async (asset: ExtraAsset) => {
                  api.syncHooks.beforeEmit.call(asset);
                  const { to, content } = asset;
                  await ensureDir(dirname(to.absolute));
                  const writeStream = createWriteStream(to.absolute, 'utf8');
                  writeStream.write(content);
                  writeStream.end();
                  signale.success(
                    `Generate extra file: ${chalk.underline.cyan(to.base)}.`
                  );
                },
                complete: () => {
                  api.syncHooks.afterExtraAssetsTakingEffect.call();
                  extraAssets$Subsription.unsubscribe();
                }
              });
            }
          });
        }
      },
      options
    );
  }
}
