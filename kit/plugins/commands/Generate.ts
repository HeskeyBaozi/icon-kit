import { KitPlugin, ProxyPluginAPI } from '../../types';

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
      },
      options
    );
  }
}
