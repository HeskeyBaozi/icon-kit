import { KitPlugin } from '../types';

export default class ExamplePlugin implements KitPlugin {
  namespace = 'example';
  apply(api: any) {
    console.log(api);
  }
}
