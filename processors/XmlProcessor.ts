import { KitProcessor, Asset } from '@kit';
import * as parseXml from '@rgrove/parse-xml';

// options see:
// https://github.com/rgrove/parse-xml#parsexmlxml-string-options-object--object
export interface XmlProcessorOptions {
  parser?: {
    ignoreUndefinedEntities?: boolean;
    preserveCdata?: boolean;
    preserveComments?: boolean;
    resolveUndefinedEntity?: Function;
  };
}

export default class XmlProcessor implements KitProcessor {
  namespace = 'xml-processor';
  options?: XmlProcessorOptions;

  constructor(options?: XmlProcessorOptions) {
    this.options = options;
  }

  async transform({ path, content }: Asset) {
    const xmlTree = parseXml(content, this.options && this.options.parser);
    return {
      path: path.replace(/\.svg$/, '.json'),
      content: JSON.stringify(xmlTree.toJSON())
    };
  }
}
