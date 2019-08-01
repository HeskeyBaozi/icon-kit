import { resolve } from 'path';
import { KitConfig } from '@kit';
import { twoToneSVGOConfig, singleColorSVGOConfig } from './svgo.config';
import SVGOProcessor from './processors/SVGOProcessor';
import XMLProcessor, { AbstractNode } from './processors/XMLProcessor';
import TemplateProcessor from './processors/TemplateProcessor';
import PrettierProcessor from './processors/PrettierProcessor';
import AttachThemeToIconPlugin from './plugins/AttachThemeToIconPlugin';
import TwoToneColorExtractProcessor from './processors/TwoToneColorExtractProcessor';
import GenerateFilesPlugin from './plugins/GenerateFilesPlugin';
import GenerateIconListPlugin from './plugins/GenerateIconListPlugin';

export default [
  {
    context: __dirname,
    sources: ['./svg/fill/*.svg', './svg/outline/*.svg'],
    flow: [
      new SVGOProcessor({
        svgo: singleColorSVGOConfig
      }),
      new XMLProcessor({
        shape: 'icon-definition'
      }),
      new TemplateProcessor(TemplateProcessor.presets.icon),
      process.env.KIT_FAST_GENERATE
        ? null
        : new PrettierProcessor({
            prettier: { parser: 'typescript', singleQuote: true }
          })
    ],
    destination: resolve(__dirname, './src/ast'),
    plugins: [new AttachThemeToIconPlugin({ ext: '.ts' })]
  },
  {
    context: __dirname,
    sources: ['./svg/twotone/*.svg'],
    flow: [
      new SVGOProcessor({
        svgo: twoToneSVGOConfig
      }),
      new XMLProcessor({
        shape: 'icon-definition',
        extraNodeTransforms: [
          (node: AbstractNode) => {
            if (node.tag === 'path') {
              node.attrs.fill = node.attrs.fill || '#333';
            }
            return node;
          }
        ]
      }),
      new TwoToneColorExtractProcessor({
        primaryColors: ['#333'],
        secondaryColors: ['#E6E6E6', '#D9D9D9', '#D8D8D8']
      }),
      new TemplateProcessor(TemplateProcessor.presets.icon),
      process.env.KIT_FAST_GENERATE
        ? null
        : new PrettierProcessor({
            prettier: { parser: 'typescript', singleQuote: true }
          })
    ],
    destination: resolve(__dirname, './src/ast'),
    plugins: [new AttachThemeToIconPlugin({ ext: '.ts' })]
  },
  {
    context: __dirname,
    sources: ['./svg/**/*.svg'],
    plugins: [
      new GenerateIconListPlugin({
        output: resolve(__dirname, './docs/list.md')
      }),
      new GenerateFilesPlugin([
        {
          output: resolve(__dirname, './src/types.d.ts'),
          dataSource: resolve(__dirname, './templates/types.d.ts')
        }
      ])
    ]
  }
] as KitConfig[];
