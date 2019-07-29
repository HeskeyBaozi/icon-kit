import { AsyncSeriesHook } from 'tapable';
import resolveUserConfig from './resolvers/resolveUserConfig';
import { CwdNeeded, KitPlugin } from './types';
import buildInPlugins from './plugins';
import signale = require('signale');
import PluginAPI from './PluginAPI';

export default class KitService {
  context: CwdNeeded;
  config: any | null = null;
  plugins: KitPlugin[] = [];
  constructor({ cwd }: CwdNeeded) {
    this.context = { cwd };
  }

  async initialize() {
    // base config
    this.config = await resolveUserConfig(this.context);

    // resolve & initialize plugins
    if (this.config) {
      this.plugins = [...buildInPlugins, ...this.config.plugins];
      this.plugins.forEach(({ namespace, apply, options }) => {
        try {
          const api = new PluginAPI(namespace, this);
          apply(api, options);
        } catch (e) {
          signale.error(e);
        }
      });
    }
  }

  async run(command: string, args: object) {
    await this.initialize();
    // console.log(`command = ${command}`);
    console.log(`generate!!`);
  }
}
