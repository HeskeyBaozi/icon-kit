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
        console.log('Run Generate');
        console.log('The args is', args);
      },
      options
    );
  }
}
