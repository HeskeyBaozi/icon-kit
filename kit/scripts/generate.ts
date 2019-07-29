import * as yParser from 'yargs-parser';
import KitService from '../Service';

const args = yParser(process.argv.slice(2));
new KitService({
  cwd: process.cwd()
}).run('generate', args);
