import { KitPlugin, ProxyPluginAPI } from '../../types';
import { createWriteStream, ensureDir } from 'fs-extra';
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
      (args: object) => {
        if (api.Assets$) {
          api.Assets$.subscribe({
            next: ({ path, content }) => {
              ensureDir(dirname(path)).then(() => {
                const writeStream = createWriteStream(path, 'utf8');
                signale.info(`Write file to ${chalk.underline.cyan(path)}`);
                writeStream.write(content);
                writeStream.end();
              });
            },
            complete: () => {
              signale.success(`Completed.`);
            }
          });
        }
      },
      options
    );
  }
}
