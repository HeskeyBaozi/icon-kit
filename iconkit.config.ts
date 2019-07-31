import ExamplePlugin from './plugins/ExamplePlugin';
import SVGOProcessor from './processors/SVGOProcessor';
import { resolve } from 'path';
import { KitConfig } from '@kit';
import { twoToneSVGOConfig, singleColorSVGOConfig } from './svgo.config';
import XMLProcessor, {
  AbstractNode,
  NodeMeta
} from './processors/XMLProcessor';
import TemplateProcessor from './processors/TemplateProcessor';

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
      new TemplateProcessor({
        // mapAssetPropsToInterpolate: ({ path, content }: Asset) => ({})
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
        svgo: twoToneSVGOConfig
      }),
      new XMLProcessor({
        shape: 'icon-definition',
        extraNodeTransforms: [
          (nodeMeta: NodeMeta<AbstractNode>) => {
            if (nodeMeta.node.tag === 'path') {
              nodeMeta.node.attrs.fill = nodeMeta.node.attrs.fill || '#333';
            }
            return nodeMeta;
          }
        ]
      })
    ],
    destination: resolve(__dirname, './src/ast'),
    plugins: [new ExamplePlugin()]
  }
] as KitConfig[];
