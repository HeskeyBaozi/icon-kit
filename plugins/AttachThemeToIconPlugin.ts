import { KitPlugin, ProxyPluginAPI } from '@kit';
import { getIdentifierAccordingToNameAndDir } from '../utils';
import { resolve, parse } from 'path';

export interface AttachThemeToIconPluginOptions {
  ext: string;
}

export default class AttachThemeToIconPlugin implements KitPlugin {
  namespace = 'attach-theme-to-icon-plugin';
  options: AttachThemeToIconPluginOptions;
  constructor(o: AttachThemeToIconPluginOptions) {
    this.options = o;
  }
  apply(api: ProxyPluginAPI) {
    api.asyncHooks.postProcessors.tapPromise(
      this.namespace,
      async ({ from, content }) => {
        const identifier = getIdentifierAccordingToNameAndDir(from);
        const filename = identifier + this.options.ext;
        const absolute = resolve(api.config!.destination, filename);
        return {
          from,
          to: {
            ...parse(absolute),
            absolute
          },
          content
        };
      }
    );
  }
}
