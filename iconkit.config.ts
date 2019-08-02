import { resolve } from 'path';
import { KitConfig } from '@kit';
import { twoToneSVGOConfig, singleColorSVGOConfig } from './svgo.config';
import SVGOProcessor from './processors/SVGOProcessor';
import XMLProcessor, { AbstractNode } from './processors/XMLProcessor';
import TemplateProcessor from './processors/TemplateProcessor';
import PrettierProcessor from './processors/PrettierProcessor';
import RenameIconByThemePlugin from './plugins/RenameIconByThemePlugin';
import TwoToneColorExtractProcessor from './processors/TwoToneColorExtractProcessor';
import GenerateFilesPlugin from './plugins/GenerateFilesPlugin';
import GenerateIconListPlugin from './plugins/GenerateIconListPlugin';
import { getIdentifierAccordingToNameAndDir } from './utils';
import GenerateInlineSVGPlugin from './plugins/GenerateInlineSVGPlugin';

export default [
  {
    name: 'generate-fill-and-outline-icons',
    context: __dirname,
    sources: ['./svg/fill/*.svg', './svg/outline/*.svg'],
    relativeBase: './svg',
    flow: [
      new SVGOProcessor({
        svgo: singleColorSVGOConfig
      }),
      new XMLProcessor({
        shape: 'icon-definition'
      }),
      new TemplateProcessor({
        tplSrc: resolve(__dirname, './templates/icon.ts.ejs'),
        mapAssetPropsToInterpolate: ({ from, content }) => ({
          identifier: getIdentifierAccordingToNameAndDir(from),
          content
        })
      }),
      !process.env.KIT_FAST_GENERATE
        ? new PrettierProcessor({
            prettier: { parser: 'typescript', singleQuote: true }
          })
        : null
    ],
    destination: resolve(__dirname, './src/ast'),
    plugins: [
      new RenameIconByThemePlugin({ ext: '.ts' }),
      new GenerateInlineSVGPlugin({
        destination: resolve(__dirname, './inline-svg'),
        objectLikeSourceProcessorName: 'xml-processor'
      })
    ]
  },
  {
    name: 'generate-twotone-icons',
    context: __dirname,
    sources: ['./svg/twotone/*.svg'],
    relativeBase: './svg',
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
      new TemplateProcessor({
        tplSrc: resolve(__dirname, './templates/icon.ts.ejs'),
        mapAssetPropsToInterpolate: ({ from, content }) => ({
          identifier: getIdentifierAccordingToNameAndDir(from),
          content
        })
      }),
      !process.env.KIT_FAST_GENERATE
        ? new PrettierProcessor({
            prettier: { parser: 'typescript', singleQuote: true }
          })
        : null
    ],
    destination: resolve(__dirname, './src/ast'),
    plugins: [
      new RenameIconByThemePlugin({ ext: '.ts' }),
      new GenerateInlineSVGPlugin({
        destination: resolve(__dirname, './inline-svg'),
        objectLikeSourceProcessorName: 'xml-processor'
      })
    ]
  },
  {
    name: 'generate-list',
    context: __dirname,
    sources: ['./svg/**/*.svg'],
    plugins: [
      new GenerateIconListPlugin({
        output: resolve(__dirname, './docs/list.md')
      }),
      new GenerateFilesPlugin([
        {
          dataSource: resolve(__dirname, './templates/types.d.ts'),
          output: resolve(__dirname, './src/types.d.ts')
        }
      ])
    ]
  }
] as KitConfig[];
