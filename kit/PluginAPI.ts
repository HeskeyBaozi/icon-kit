import KitService from './Service';
import debug, { Debugger } from 'debug';
import * as signale from 'signale';

export default class PluginAPI {
  namespace: string;
  service: KitService;
  debug: Debugger;
  logger = signale;
  constructor(namespace: string, service: KitService) {
    // initialize basic
    this.namespace = namespace;
    this.service = service;

    // initialize utils
    this.debug = debug(`plugin-${this.namespace}`);
  }
}
