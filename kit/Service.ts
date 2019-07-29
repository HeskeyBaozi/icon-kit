import { AsyncSeriesHook } from 'tapable';
import resolveUserConfig from './resolvers/resolveUserConfig';
import { CwdNeeded, KitPlugin, ProxyPluginAPI } from './types';
import buildInPlugins from './plugins';
import * as signale from 'signale';
import PluginAPI from './PluginAPI';
import Command from './Command';
import debugFactory from 'debug';

const debug = debugFactory('service');

export const ProxyMethodNames = Symbol('ProxyMethodNamesInService');

export default class KitService {
  context: CwdNeeded;
  config: any | null = null;
  plugins: KitPlugin[] = [];
  commands: Map<string, Command> = new Map();
  [ProxyMethodNames]: string[] = ['registerCommand'];
  constructor({ cwd }: CwdNeeded) {
    this.context = { cwd };
  }

  async initialize() {
    // base config
    this.config = await resolveUserConfig(this.context);
    debug(`The preload config is`, this.config);

    // resolve & initialize plugins
    if (this.config) {
      this.plugins = [...buildInPlugins, ...this.config.plugins];
      debug(
        `Try to initialize ${this.plugins.length} plugins, ${
          this.config.plugins.length
        } plugin(s) for user.`
      );
      this.plugins.forEach(({ namespace, apply, options }) => {
        try {
          const rawApi = new PluginAPI(namespace, this);
          const api = new Proxy(rawApi, {
            get: (target, property) => {
              if (
                typeof property === 'string' &&
                this[ProxyMethodNames].includes(property)
              ) {
                let result = (this as any)[property];
                if (typeof result === 'function') {
                  result = result.bind(this);
                }
                return result;
              }
              return (target as any)[property];
            }
          }) as ProxyPluginAPI;
          apply(api, options);
        } catch (e) {
          signale.error(e);
          process.exit(1);
        }
      });
      debug(`Initialzie plugins successfully!`);
    }
  }

  async run(command: string, args: object) {
    await this.initialize();
    return this.runCommand(command, args);
  }

  registerCommand(
    commandName: string,
    executor: Function,
    options?: object
  ): void {
    if (this.commands.has(commandName)) {
      signale.error(`Command ${commandName} exists!`);
      return;
    }
    this.commands.set(
      commandName,
      new Command({
        name: commandName,
        executor,
        options
      })
    );
  }

  runCommand(name: string, args: object) {
    const command = this.commands.get(name);
    if (!command) {
      signale.error(`Command ${name} does NOT exists.`);
      process.exit(1);
    }

    const { executor, options } = command!;

    if (options) {
      // do something with options
      debug(`The Command ${name} with the options`, options);
    }
    return executor(args);
  }
}
