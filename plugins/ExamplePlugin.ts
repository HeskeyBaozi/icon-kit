import { KitPlugin, ProxyPluginAPI } from '@kit';

export default class ExamplePlugin implements KitPlugin {
  namespace = 'example';
  apply(api: ProxyPluginAPI) {
    // console.log(api);
    // console.log('Before ExamplePlugin', api.config);
  }
}
