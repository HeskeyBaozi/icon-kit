import ExamplePlugin from './plugins/ExamplePlugin';
import { resolve } from 'path';
import { KitConfig } from '@kit';

export default [
  {
    context: __dirname,
    sources: ['./svg/**/*.svg'],
    flow: [],
    destination: resolve(__dirname, './src/ast'),
    plugins: [new ExamplePlugin()]
  }
] as KitConfig[];
