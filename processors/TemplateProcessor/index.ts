import { KitProcessor, Asset } from '@kit';

export interface TemplateProcessorOptions {}

export default class TemplateProcessor implements KitProcessor {
  namespace = 'template-processor';
  options: TemplateProcessorOptions;

  constructor(options: TemplateProcessorOptions) {
    this.options = options;
  }

  async transform({ path, content }: Asset) {
    return {
      path,
      content
    };
  }
}
