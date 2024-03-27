import { XMLBuilder, XMLParser } from 'fast-xml-parser';

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

const STRIPPED_ATTRIBUTES = ['data-storybook-action'];

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

const traverseNode = (node: XmlNode, args: any) => {
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
                traverseNode(node[child], args);
            }
        }
    }
};

export const sanitize = (source: string, args: any) => {
    const parser = new XMLParser({
        ignoreAttributes: false,
    });
    const xml = parser.parse(source);

    traverseNode(xml, args);

    const builder = new XMLBuilder({
        ignoreAttributes: false,
        processEntities: false,
        format: true,
        suppressEmptyNode: true,
    });
    return builder.build(xml);
};
