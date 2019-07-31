import { KitProcessor, Asset } from '@kit';
import * as parseXml from '@rgrove/parse-xml';
import { SyncWaterfallHook } from 'tapable';
import { parse, ParsedPath } from 'path';

// options see:
// https://github.com/rgrove/parse-xml#parsexmlxml-string-options-object--object
export interface XMLProcessorOptions {
  parser?: {
    ignoreUndefinedEntities?: boolean;
    preserveCdata?: boolean;
    preserveComments?: boolean;
    resolveUndefinedEntity?: Function;
  };
  shape?: 'icon-definition' | 'xml-node';
  extraNodeTransforms?: ((node: any) => any)[];
}

export interface XMLNode {
  type: string;
  name: string;
  attributes: {
    [key: string]: string | number | boolean;
  };
  children: XMLNode[];
}

export interface AbstractNode {
  tag: string;
  attrs: {
    [key: string]: string | number | boolean;
  };
  children?: AbstractNode[];
}

export interface NodeMeta<N> {
  node: N;
  parsedPath: ParsedPath;
}

export const oldIcons = [
  'step-backward',
  'step-forward',
  'fast-backward',
  'fast-forward',
  'forward',
  'backward',
  'caret-up',
  'caret-down',
  'caret-left',
  'caret-right',
  'retweet',
  'swap-left',
  'swap-right',
  'loading',
  'loading-3-quarters',
  'coffee',
  'bars',
  'file-jpg',
  'inbox',
  'shopping-cart',
  'safety',
  'medium-workmark'
];

export default class XMLProcessor implements KitProcessor {
  namespace = 'xml-processor';
  options: XMLProcessorOptions;
  extraNodeTransformsHooks = new SyncWaterfallHook(['nodeMeta']);
  postRootNodeTransformsHooks = new SyncWaterfallHook(['nodeMeta']);

  constructor(
    options: XMLProcessorOptions = {
      shape: 'xml-node'
    }
  ) {
    this.options = options;
    if (
      this.options.extraNodeTransforms &&
      Array.isArray(this.options.extraNodeTransforms)
    ) {
      this.options.extraNodeTransforms.forEach((tf, index) => {
        this.extraNodeTransformsHooks.tap(
          `${this.namespace}-extra-node-transform-at-${index}`,
          tf
        );
      });
    }

    if (this.options.shape === 'icon-definition') {
      this.postRootNodeTransformsHooks.tap(
        `icon-should-not-be-focusable`,
        (nodeMeta: NodeMeta<AbstractNode>) => {
          if (nodeMeta.node.tag === 'svg') {
            nodeMeta.node.attrs.focusable = false;
          }
          return nodeMeta;
        }
      );

      this.postRootNodeTransformsHooks.tap(
        `icons-after-3.9.x-should-be-resize-viewbox`,
        (nodeMeta: NodeMeta<AbstractNode>) => {
          if (
            nodeMeta.node.tag === 'svg' &&
            !oldIcons.includes(nodeMeta.parsedPath.name)
          ) {
            nodeMeta.node.attrs.viewBox = '64 64 896 896';
          }
          return nodeMeta;
        }
      );
    }
  }

  toIconDefinitionNode({ node, parsedPath }: NodeMeta<XMLNode>): AbstractNode {
    const { name, attributes, children } = node;
    const currentNode: AbstractNode = {
      tag: name,
      attrs: {
        ...attributes
      },
      children: children
        .map((child) =>
          child.type === 'element'
            ? this.toIconDefinitionNode({ node: child, parsedPath })
            : null
        )
        .filter(($) => Boolean($)) as AbstractNode[]
    };
    if (!(currentNode.children && currentNode.children.length)) {
      delete currentNode.children;
    }
    const { node: extraTransformedNode } = this.extraNodeTransformsHooks.call({
      node: currentNode,
      parsedPath
    });
    return extraTransformedNode;
  }

  async transform({ path, content }: Asset) {
    const parsedPath = parse(path);
    const xmlTree: XMLNode = parseXml(
      content,
      this.options && this.options.parser
    );
    const root =
      xmlTree.type === 'document' ? (xmlTree.children[0] as XMLNode) : xmlTree;

    let nodeReadyToStringify = null;
    switch (this.options.shape) {
      case 'icon-definition':
        nodeReadyToStringify = this.toIconDefinitionNode({
          node: root,
          parsedPath
        });
        break;
      case 'xml-node':
      default:
        nodeReadyToStringify = root;
    }
    const { node: postTransformedNode } = this.postRootNodeTransformsHooks.call(
      {
        node: nodeReadyToStringify,
        parsedPath
      }
    );
    nodeReadyToStringify = postTransformedNode;

    return {
      path: path.replace(/\.svg$/, '.json'),
      content: JSON.stringify(nodeReadyToStringify)
    };
  }
}
