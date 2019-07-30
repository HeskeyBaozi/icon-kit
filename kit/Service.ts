import {
  KitPlugin,
  ProxyPluginAPI,
  KitConfig,
  Asset,
  KitFullConfig
} from './types';
import buildInPlugins from './plugins';
import * as signale from 'signale';
import PluginAPI from './PluginAPI';
import Command from './Command';
import debugFactory from 'debug';
import { Observable, fromEvent } from 'rxjs';
import { takeUntil, map, concatAll, reduce, tap } from 'rxjs/operators';
import { stream } from 'globby';
import { createReadStream } from 'fs';

const debug = debugFactory('service');

export const ProxyPropertyNames = Symbol('ProxyPropertyNamesInService');

export default class KitService {
  preConfig: KitConfig;
  config: KitFullConfig | null = null;
  plugins: KitPlugin[] = [];
  commands: Map<string, Command> = new Map();
  assets$: Observable<Asset> | null = null;
  [ProxyPropertyNames]: string[] = ['registerCommand', 'config'];
  constructor(config: KitConfig) {
    this.preConfig = config;
  }

  async initialize() {
    this.initializePlutins();
    this.initializeConfig();
    await this.initializeFlow();
  }

  initializePlutins() {
    // resolve & initialize plugins
    if (this.preConfig) {
      const preloadConfigPlugins = this.preConfig.plugins || [];
      this.plugins = [...buildInPlugins, ...preloadConfigPlugins];
      debug(
        `Try to initialize ${this.plugins.length} plugins, ${
          preloadConfigPlugins.length
        } plugin(s) for user.`
      );
      this.plugins.forEach(({ namespace, apply, options }) => {
        try {
          const rawApi = new PluginAPI(namespace);
          const api = new Proxy(rawApi, {
            get: (target, property) => {
              if (
                typeof property === 'string' &&
                this[ProxyPropertyNames].includes(property)
              ) {
                let result = (this as any)[property];
                if (typeof result === 'function') {
                  result = result.bind(this);
                }
                // or return Object.freeze(result) ?
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

  initializeConfig() {
    // todo
    // no Object.assign(...)
    // apply plugins
    const tempConfig = Object.freeze(this.preConfig);
    const config = Object.assign(
      {},
      {
        context: process.cwd(),
        flow: [],
        plugins: []
      },
      tempConfig
    ) as KitFullConfig;
    this.config = Object.freeze(config);
  }

  async initializeFlow() {
    const pathStream = stream(this.config!.sources, {
      cwd: this.config!.context
    }).setEncoding('utf8');
    const pathAndContent$ = fromEvent<string>(pathStream, 'data')
      .pipe(takeUntil(fromEvent(pathStream, 'end')))
      .pipe(
        map((path) => {
          const s = createReadStream(path, 'utf8');
          return fromEvent<string>(s, 'data')
            .pipe(takeUntil(fromEvent(s, 'end')))
            .pipe(reduce((data, chunk) => data + chunk))
            .pipe(map<string, [string, string]>((data) => [path, data]));
        })
      )
      .pipe(concatAll())
      .pipe(
        tap(([path, data]) => {
          signale.success(path);
          signale.info(data);
        })
      );
    // let first = '';
    // for await (const path of pathsStream) {
    //   if (!first) {
    //     first = path as string;
    //     break;
    //   }
    // }
    // const readStream = createReadStream(first, {
    //   highWaterMark: 16,
    //   encoding: 'utf8'
    // });
    // for await (const file of readStream) {
    //   console.log('file = ', file);
    // }
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
