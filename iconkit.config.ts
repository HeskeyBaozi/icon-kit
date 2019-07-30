import ExamplePlugin from './plugins/ExamplePlugin';
import SVGOProcessor from './processors/SVGOProcessor';
import { resolve } from 'path';
import { KitConfig } from '@kit';

export default [
  {
    context: __dirname,
    sources: ['./svg/**/*.svg'],
    flow: [new SVGOProcessor({ value: `There is no content` })],
    destination: resolve(__dirname, './src/ast'),
    plugins: [new ExamplePlugin()]
  }
] as KitConfig[];
