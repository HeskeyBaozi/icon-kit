import { KitProcessor, Asset } from '@kit';

export default class SVGOProcessor implements KitProcessor {
  namespace = 'svgo-processor';
  options: any;
  constructor(options: object) {
    this.options = options;
  }

  async transform({ path, content }: Asset) {
    return {
      path,
      content: String(this.options.value)
    };
  }
}
