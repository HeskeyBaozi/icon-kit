import ExamplePlugin from './plugins/ExamplePlugin';
import SVGOProcessor from './processors/SVGOProcessor';
import { resolve } from 'path';
import { KitConfig } from '@kit';
import SVGOOptions from './svgo.config';

export default [
  {
    context: __dirname,
    sources: ['./svg/fill/*.svg', './svg/outline/*.svg'],
    flow: [
      new SVGOProcessor({
        svgo: {
          ...SVGOOptions,
          plugins: [
            ...SVGOOptions.plugins,
            { removeAttrs: { attrs: ['class', 'fill'] } }
          ]
        }
      })
    ],
    destination: resolve(__dirname, './src/ast'),
    plugins: [new ExamplePlugin()]
  },
  {
    context: __dirname,
    sources: ['./svg/twotone/*.svg'],
    flow: [
      new SVGOProcessor({
        svgo: SVGOOptions
      })
    ],
    destination: resolve(__dirname, './src/ast'),
    plugins: [new ExamplePlugin()]
  }
] as KitConfig[];
