import { XMLParser } from 'fast-xml-parser';

// src/utils/twig.ts
var TwigTemplate = class {
  constructor(source, components) {
    this.source = source;
    this.components = components;
    this.source = source;
  }
  getSource() {
    return this.source;
  }
  toString() {
    return this.source;
  }
  getComponents() {
    return this.components;
  }
};
function parseSubComponents(source) {
  const reservedNames = [
    "block"
  ];
  const tagRe = new RegExp(/twig:[A-Za-z]+(?::[A-Za-z]+)*/);
  const functionRe = new RegExp(/component\(\s*'([A-Za-z]+(?::[A-Za-z]+)*)'\s*(?:,.*)?\)/, "gs");
  const documentObj = new XMLParser().parse(`<div>${source}</div>`);
  const lookupComponents = (obj) => {
    return Object.entries(obj).reduce((names, [key, value]) => {
      if (value !== null && typeof value === "object") {
        names.push(...lookupComponents(value));
      } else if (typeof value === "string") {
        for (let m of value.matchAll(functionRe)) {
          names.push([...m][1]);
        }
      }
      if (tagRe.test(key)) {
        names.push(key.replace("twig:", ""));
      }
      return names;
    }, []);
  };
  return lookupComponents(documentObj).filter((name) => !reservedNames.includes(name));
}
function twig(source, ...values) {
  const rawSource = String.raw({ raw: source }, ...values);
  return new TwigTemplate(rawSource, parseSubComponents(rawSource));
}

export { TwigTemplate, twig };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.mjs.map