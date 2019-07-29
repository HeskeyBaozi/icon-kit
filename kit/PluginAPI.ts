import KitService from './Service';

export default class PluginAPI {
  namespace: string;
  service: KitService;
  constructor(namespace: string, service: KitService) {
    this.namespace = namespace;
    this.service = service;
  }
}
