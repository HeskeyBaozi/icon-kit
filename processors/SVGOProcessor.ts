import { KitProcessor, Asset } from '@kit';
import * as SVGO from 'svgo';

export interface SVGOProcessorOptions {
  svgo: SVGO.Options;
}

export default class SVGOProcessor implements KitProcessor {
  namespace = 'svgo-processor';
  options: SVGOProcessorOptions;
  optimizer: SVGO;
  constructor(options: SVGOProcessorOptions) {
    this.options = options;
    this.optimizer = new SVGO(this.options.svgo);
  }

  async transform({ path, content }: Asset) {
    const { data } = await this.optimizer.optimize(content);
    return {
      path,
      content: data
    };
  }
}
