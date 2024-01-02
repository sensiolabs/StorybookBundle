'use strict';

// src/loaders/twig-loader.ts
async function loader(source) {
  this.resourcePath;
  const code = `
        const source = \`${source}\`;
        
        export default { source }; 
    `;
  this.callback(null, code);
}

module.exports = loader;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=twig-loader.js.map