import { KitPlugin, ProxyPluginAPI } from '../../types';
import { from } from 'rxjs';

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
        api.logger.log('Run Generate');
        api.logger.warn('The args is', args);

        const test = function* Hello() {
          yield 1;
          // await new Promise((r) => {
          //   setTimeout(() => {
          //     r();
          //   }, 2000);
          // });
          yield 'test';
          // await new Promise((r) => {
          //   setTimeout(() => {
          //     r();
          //   }, 2000);
          // });
          return 'done';
        };

        from(test()).subscribe(
          (result) => {
            api.logger.info(result);
          },
          (d) => {
            console.log(d);
          },
          () => {
            console.log('dddd');
          }
        );
      },
      options
    );
  }
}
