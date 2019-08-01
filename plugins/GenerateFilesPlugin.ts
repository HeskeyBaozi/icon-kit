import { KitPlugin, ProxyPluginAPI } from '@kit';
import { parse } from 'path';
import { readFileSync } from 'fs-extra';

export type GenerateFilesPluginOptions = Array<{
  output: string;
  data?: string;
  dataSource?: string;
}>;

export default class GenerateFilesPlugin implements KitPlugin {
  namespace = 'generate-files-plugin';
  options: GenerateFilesPluginOptions;
  constructor(o: GenerateFilesPluginOptions) {
    this.options = o;
  }

  apply(api: ProxyPluginAPI) {
    this.options.forEach(({ output, data, dataSource }) => {
      const content =
        data || (dataSource && readFileSync(dataSource, 'utf8')) || '';
      api.extraAssets$.next({
        to: {
          ...parse(output),
          absolute: output
        },
        content
      });
    });
  }
}
