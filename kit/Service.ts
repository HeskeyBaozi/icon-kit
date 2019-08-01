import {
  KitPlugin,
  ProxyPluginAPI,
  KitConfig,
  Asset,
  KitFullConfig,
  EnsuredAsset,
  ExtraAsset
} from './types';
import { AsyncSeriesWaterfallHook, SyncHook, SyncBailHook } from 'tapable';
import buildInPlugins from './plugins';
import * as signale from 'signale';
import PluginAPI from './PluginAPI';
import Command from './Command';
import debugFactory from 'debug';
import { Observable, fromEvent, from } from 'rxjs';
import { takeUntil, map, concatAll, reduce, tap } from 'rxjs/operators';
import { stream } from 'globby';
import { createReadStream } from 'fs-extra';
import { parse, relative, resolve } from 'path';

const debug = debugFactory('service');

export const ProxyPropertyNames = Symbol('ProxyPropertyNamesInService');

export default class KitService {
  private preConfig: KitConfig;
  public config: KitFullConfig | null = null;
  private plugins: KitPlugin[] = [];
  private commands: Map<string, Command> = new Map();
  public assets$: Observable<EnsuredAsset> | null = null;
  public extraAssets$: Observable<ExtraAsset> | null = null;
  private [ProxyPropertyNames]: string[] = [
    'registerCommand',
    'registerPostProcessor',
    'generateFiles',
    'asyncHooks',
    'syncHooks',
    'config',
    'assets$',
    'extraAssets$'
  ];
  private extraAssets: ExtraAsset[] = [];
  public asyncHooks = {
    postProcessors: new AsyncSeriesWaterfallHook(['ensuredAsset'])
  };
  public syncHooks = {
    beforeEmit: new SyncHook(['ensuredAsset']),
    noEmitFlag: new SyncBailHook(['asset']),
    afterEmit: new SyncHook()
  };
  private processors: AsyncSeriesWaterfallHook = new AsyncSeriesWaterfallHook([
    'asset'
  ]);
  constructor(config: KitConfig) {
    this.preConfig = config;
  }

  private async initialize() {
    this.initializePlutins();
    this.initializeConfig();
    this.initializeFlow();
  }

  private initializePlutins() {
    // resolve & initialize plugins
    if (this.preConfig) {
      const preloadConfigPlugins = this.preConfig.plugins || [];
      this.plugins = [...buildInPlugins, ...preloadConfigPlugins];
      debug(
        `Try to initialize ${this.plugins.length} plugins, ${preloadConfigPlugins.length} plugin(s) for user.`
      );
      this.plugins.forEach((plugin) => {
        const { namespace, apply, options } = plugin;
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
          apply.call(plugin, api, options);
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
    for (const processor of this.config.flow) {
      if (processor) {
        this.processors.tapPromise(
          processor.namespace,
          processor.transform.bind(processor)
        );
      }
    }
  }

  private initializeFlow() {
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
              map<string, Asset>((content) => ({
                from: {
                  ...parse(path),
                  absolute: path
                },
                to: null,
                content
              }))
            );
        }),
        concatAll()
      )
      .pipe(
        map<Asset, Promise<Asset>>((asset) => {
          return this.processors.promise(asset);
        }),
        concatAll()
      )
      // use destination path
      .pipe(
        map<Asset, EnsuredAsset>(({ from, content }) => {
          const toAbsolute = resolve(
            this.config!.destination,
            relative(this.config!.context, from.absolute)
          );
          return {
            from,
            to: {
              ...parse(toAbsolute),
              absolute: toAbsolute
            },
            content
          };
        })
      )
      .pipe(
        map<EnsuredAsset, Promise<EnsuredAsset>>((asset) => {
          return this.asyncHooks.postProcessors.promise(asset);
        }),
        concatAll()
      );

    this.extraAssets$ = from(this.extraAssets);
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

  public generateFiles(...assets: ExtraAsset[]) {
    this.extraAssets.push(...assets);
  }
}
