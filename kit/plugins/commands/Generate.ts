import { KitPlugin, ProxyPluginAPI } from '../../types';
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
        if (api.Assets$) {
          await emptyDir(api.config!.destination);
          api.Assets$.subscribe({
            next: async ({ path, content }) => {
              await ensureDir(dirname(path));
              const writeStream = createWriteStream(path, 'utf8');
              writeStream.write(content);
              writeStream.end();
            },
            complete: () => {
              signale.success(`Process file(s) completed.`);
            }
          });
        }
      },
      options
    );
  }
}
