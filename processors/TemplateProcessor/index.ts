import { KitProcessor, Asset } from '@kit';
import { template } from 'lodash';
import { readFile } from 'fs-extra';
import { resolve } from 'path';
import { getIdentifierAccordingToNameAndDir } from '../../utils';

export interface TemplateProcessorOptions {
  tplSrc: string;
  mapAssetPropsToInterpolate: (asset: Asset) => object;
}

export default class TemplateProcessor implements KitProcessor {
  namespace = 'template-processor';
  options: TemplateProcessorOptions;

  static presets: { [key: string]: TemplateProcessorOptions } = {
    icon: {
      tplSrc: resolve(__dirname, './templates/icon.ts.ejs'),
      mapAssetPropsToInterpolate: ({ from, content }: Asset) => {
        return {
          identifier: getIdentifierAccordingToNameAndDir(from),
          json: content
        };
      }
    }
  };

  constructor(options: TemplateProcessorOptions) {
    this.options = options;
  }

  async transform(asset: Asset) {
    const { content, ...rest } = asset;
    const f = template(await readFile(this.options.tplSrc, 'utf8'));
    return {
      content: f(this.options.mapAssetPropsToInterpolate(asset)),
      ...rest
    };
  }
}
