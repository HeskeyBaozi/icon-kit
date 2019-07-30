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
import { createReadStream } from 'fs-extra';
import { parse, relative, sep, resolve } from 'path';

const debug = debugFactory('service');

export const ProxyPropertyNames = Symbol('ProxyPropertyNamesInService');

export default class KitService {
  private preConfig: KitConfig;
  public config: KitFullConfig | null = null;
  private plugins: KitPlugin[] = [];
  private commands: Map<string, Command> = new Map();
  private assets$: Observable<Asset> | null = null;
  private [ProxyPropertyNames]: string[] = ['registerCommand', 'config'];
  constructor(config: KitConfig) {
    this.preConfig = config;
  }

  private async initialize() {
    this.initializePlutins();
    this.initializeConfig();
    await this.initializeFlow();
  }

  private initializePlutins() {
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

  private initializeConfig() {
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

  private async initializeFlow() {
    const pathStream = stream(this.config!.sources, {
      cwd: this.config!.context,
      absolute: true
    }).setEncoding('utf8');
    this.assets$ = fromEvent<string>(pathStream, 'data')
      .pipe(takeUntil(fromEvent(pathStream, 'end')))
      .pipe(
        map((path) => {
          const s = createReadStream(path, 'utf8');
          return fromEvent<string>(s, 'data')
            .pipe(takeUntil(fromEvent(s, 'end')))
            .pipe(
              reduce((acc, chunk) => acc + chunk),
              map<string, Asset>((content) => ({ path, content }))
            );
        }),
        concatAll()
      )
      .pipe(
        map<Asset, Asset>(({ path, content }) => {
          return {
            path: resolve(
              this.config!.destination,
              relative(this.config!.context, path)
            ),
            content
          };
        }),
        map<Asset, Asset>(({ path, content }) => {
          const parsedPath = parse(path);
          const categoriesArray = relative(
            this.config!.destination,
            parsedPath.dir
          ).split(sep);
          const theme = categoriesArray.pop();
          const filename = `${parsedPath.name}-${theme}${parsedPath.ext}`;
          return {
            path: theme ? resolve(this.config!.destination, filename) : path,
            content
          };
        })
      );

    this.assets$.subscribe(({ path, content }) => {
      console.log(path);
      console.log(parse(path));
    });
  }

  public async run(command: string, args: object) {
    await this.initialize();
    return this.runCommand(command, args);
  }

  public registerCommand(
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

  private runCommand(name: string, args: object) {
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
