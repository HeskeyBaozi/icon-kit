import { KitPlugin, ProxyPluginAPI } from '@kit';
import { getIdentifierAccordingToNameAndDir } from '../utils';
import { resolve, parse } from 'path';

export default class AttachThemeToIconPlugin implements KitPlugin {
  namespace = 'attach-theme-to-icon';
  options: { ext: string };
  constructor(o: { ext: string }) {
    this.options = o;
  }
  apply(api: ProxyPluginAPI, { ext }: { ext: string }) {
    api.registerPostProcessor({
      namespace: this.namespace,
      transform: async ({ from, content }) => {
        const identifier = getIdentifierAccordingToNameAndDir(
          from.name,
          from.dir
        );
        const filename = identifier + ext;
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
    });
  }
}
