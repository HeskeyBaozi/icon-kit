import { KitPlugin } from '../kit';

export default class ExamplePlugin implements KitPlugin {
  namespace = 'example';
  apply(api: any) {
    // console.log('example', api);
  }
}
