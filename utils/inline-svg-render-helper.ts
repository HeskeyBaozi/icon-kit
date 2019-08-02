import { IconDefinition, AbstractNode } from '../templates/types';

export interface HelperRenderOptions {
  placeholders: {
    primaryColor: string;
    secondaryColor: string;
  };
  extraSVGAttrs?: {
    [key: string]: string;
  };
}

export function renderIconDefinitionToSVGElement(
  icond: IconDefinition,
  options: HelperRenderOptions
): string {
  if (typeof icond.icon === 'function') {
    // two-tone
    const placeholders = options.placeholders;
    return renderAbstractNodeToSVGElement(
      icond.icon(placeholders.primaryColor, placeholders.secondaryColor),
      options
    );
  }
  // fill, outline
  return renderAbstractNodeToSVGElement(icond.icon, options);
}

function renderAbstractNodeToSVGElement(
  node: AbstractNode,
  options: HelperRenderOptions
): string {
  const targetAttrs =
    node.tag === 'svg'
      ? {
          ...node.attrs,
          ...(options.extraSVGAttrs || {})
        }
      : node.attrs;
  const attrs = Object.keys(targetAttrs).reduce((acc: string[], nextKey) => {
    const key = nextKey;
    const value = targetAttrs[key];
    const token = `${key}="${value}"`;
    acc.push(token);
    return acc;
  }, []);
  const attrsToken = attrs.length ? ' ' + attrs.join(' ') : '';
  const children = (node.children || [])
    .map((child) => renderAbstractNodeToSVGElement(child, options))
    .join('');

  if (children && children.length) {
    return `<${node.tag}${attrsToken}>${children}</${node.tag}>`;
  }
  return `<${node.tag}${attrsToken} />`;
}
