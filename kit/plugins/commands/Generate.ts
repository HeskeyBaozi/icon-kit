import { KitPlugin, ProxyPluginAPI } from '../../types';
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
            next: async ({ to, content }) => {
              await ensureDir(dirname(to.absolute));
              const writeStream = createWriteStream(to.absolute, 'utf8');
              writeStream.write(content);
              writeStream.end();
            },
            complete: () => {
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
