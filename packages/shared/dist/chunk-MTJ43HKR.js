import { dedent } from 'ts-dedent';

// src/lib/twig.ts
var TwigTemplate = class {
  constructor(source) {
    this.source = source;
    this.source = source;
  }
  source;
  getSource() {
    return this.source;
  }
  toString() {
    return this.source;
  }
};
function twig(source, ...values) {
  const strings = typeof source === "string" ? [source] : source;
  const rawSource = String.raw({ raw: strings }, ...values);
  return new TwigTemplate(dedent(rawSource));
}

export { twig };
