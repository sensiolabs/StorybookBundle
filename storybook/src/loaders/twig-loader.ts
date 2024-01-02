import type { LoaderContext } from 'webpack';

export default async function loader(this: LoaderContext<any>, source: string) {
    const filename = this.resourcePath;
    const code = `
        const source = \`${source}\`;
        
        export default { source }; 
    `;

    this.callback(null, code);
}

