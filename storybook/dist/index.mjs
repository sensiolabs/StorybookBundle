// src/utils/twig.ts
var TwigTemplate = class {
  constructor(source) {
    this.source = source;
    this.source = source;
  }
  getSource() {
    return this.source;
  }
  toString() {
    return this.source;
  }
};
function twig(source, ...values) {
  return new TwigTemplate(String.raw({ raw: source }, ...values));
}

export { TwigTemplate, twig };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.mjs.map