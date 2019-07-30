import debug, { Debugger } from 'debug';
import * as signale from 'signale';

export default class PluginAPI {
  namespace: string;
  debug: Debugger;
  logger = signale;
  constructor(namespace: string) {
    // initialize basic
    this.namespace = namespace;

    // initialize utils
    this.debug = debug(`plugin-${this.namespace}`);
  }
}
