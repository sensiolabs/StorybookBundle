import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { CALLBACK_ATTRIBUTE, ACTION_ATTRIBUTE } from '../../lib/eventCallbacks';

type TextNodeName = `#${string}`;
type LitAttributeNodeName = `@_${string}`;
type ExprAttributeNodeName = `@_:${string}`;
type AttributeNodeName = LitAttributeNodeName | ExprAttributeNodeName;
type ChildNodeName = string;

type XmlNode =
    | string
    | {
          [key: TextNodeName]: string;
          [key: AttributeNodeName]: string;
          [key: ChildNodeName]: XmlNode;
      };

const STRIPPED_ATTRIBUTES = [CALLBACK_ATTRIBUTE, ACTION_ATTRIBUTE];

const isAttributeName = (name: string): name is AttributeNodeName => {
    return isLitAttributeName(name) || isExprAttributeName(name);
};

const isLitAttributeName = (name: string): name is LitAttributeNodeName => {
    return /^@_[^:]/.test(name);
};

const isExprAttributeName = (name: string): name is ExprAttributeNodeName => {
    return /^@_:/.test(name);
};

const isTextName = (name: string): name is TextNodeName => {
    return /^#/.test(name);
};

const isNodeName = (name: string): name is ChildNodeName => {
    return !isAttributeName(name) && !isTextName(name);
};

const getAttributeName = (name: AttributeNodeName) => {
    if (isExprAttributeName(name)) {
        return name.replace(/^@_:/, '');
    }
    if (isLitAttributeName(name)) {
        return name.replace(/^@_/, '');
    }
    throw new Error('Invalid argument');
};

const traverseNode = (node: XmlNode) => {
    if (typeof node !== 'string') {
        for (const child in node) {
            if (isAttributeName(child)) {
                const attrName = getAttributeName(child);
                if (STRIPPED_ATTRIBUTES.includes(attrName)) {
                    delete node[child];
                    continue;
                }
            }
            if (isNodeName(child)) {
                traverseNode(node[child]);
            }
        }
    }
};

export const sanitize = (source: string): string => {
    const parser = new XMLParser({
        ignoreAttributes: false,
        stopNodes: ['*.pre', '*.script'],
        unpairedTags: ['hr', 'br', 'link', 'meta'],
        processEntities: true,
        htmlEntities: true,
        preserveOrder: true,
        allowBooleanAttributes: true,
    });

    const xml = parser.parse(source);

    traverseNode(xml);

    const builder = new XMLBuilder({
        ignoreAttributes: false,
        processEntities: false,
        format: true,
        suppressEmptyNode: true,
        preserveOrder: true,
        suppressBooleanAttributes: true,
    });

    return builder.build(xml).trim();
};
