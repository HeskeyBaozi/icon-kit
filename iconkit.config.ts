import ExamplePlugin from './plugins/ExamplePlugin';
import SVGOProcessor from './processors/SVGOProcessor';
import { resolve } from 'path';
import { KitConfig } from '@kit';
import { twoToneSVGOConfig, singleColorSVGOConfig } from './svgo.config';
import XmlProcessor from './processors/XmlProcessor';

export default [
  {
    context: __dirname,
    sources: ['./svg/fill/*.svg', './svg/outline/*.svg'],
    flow: [
      new SVGOProcessor({
        svgo: singleColorSVGOConfig
      }),
      new XmlProcessor()
    ],
    destination: resolve(__dirname, './src/ast'),
    plugins: [new ExamplePlugin()]
  },
  {
    context: __dirname,
    sources: ['./svg/twotone/*.svg'],
    flow: [
      new SVGOProcessor({
        svgo: twoToneSVGOConfig
      }),
      new XmlProcessor()
    ],
    destination: resolve(__dirname, './src/ast'),
    plugins: [new ExamplePlugin()]
  }
] as KitConfig[];
