import { KitProcessor, Asset } from '@kit';
import * as parseXml from '@rgrove/parse-xml';
import { SyncWaterfallHook } from 'tapable';

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

export default class XMLProcessor implements KitProcessor {
  namespace = 'xml-processor';
  options: XMLProcessorOptions;
  extraNodeTransformsHooks = new SyncWaterfallHook(['node']);

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
  }

  toIconDefinitionNode({ name, attributes, children }: XMLNode): AbstractNode {
    let currentNode: AbstractNode = {
      tag: name,
      attrs: {
        ...attributes
      },
      children: children
        .map((child) =>
          child.type === 'element' ? this.toIconDefinitionNode(child) : null
        )
        .filter(($) => Boolean($)) as AbstractNode[]
    };
    if (!(currentNode.children && currentNode.children.length)) {
      delete currentNode.children;
    }
    currentNode = this.extraNodeTransformsHooks.call(currentNode);
    return currentNode;
  }

  async transform({ path, content }: Asset) {
    const xmlTree: XMLNode = parseXml(
      content,
      this.options && this.options.parser
    );
    const root =
      xmlTree.type === 'document' ? (xmlTree.children[0] as XMLNode) : xmlTree;
    let transformedContent = '';
    if (this.options.shape === 'icon-definition') {
      transformedContent = JSON.stringify(this.toIconDefinitionNode(root));
    } else {
      transformedContent = JSON.stringify(root);
    }

    return {
      path: path.replace(/\.svg$/, '.json'),
      content: transformedContent
    };
  }
}
