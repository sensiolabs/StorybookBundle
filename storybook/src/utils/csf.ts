import * as t from '@babel/types';

// import * as generate from '@babel/generator';
import type { CsfFile, EnrichCsfOptions } from '@storybook/csf-tools';

export const enrichTwigCsf = (csf: CsfFile, sourceMap: Record<string, string>, options?: EnrichCsfOptions) => {
    if (options?.disableSource) {
        return;
    }
    Object.keys(csf._storyExports).forEach((key) => {
        useTemplateSourceInCsf(csf, key, sourceMap[key]);
    });
};
const useTemplateSourceInCsf = (csf: CsfFile, key: string, source: string) => {
    const parameters = [];
    const originalParameters = t.memberExpression(t.identifier(key), t.identifier('parameters'));
    parameters.push(t.spreadElement(originalParameters));
    const optionalDocs = t.optionalMemberExpression(originalParameters, t.identifier('docs'), false, true);
    const extraDocsParameters = [];

    // docs: { source: { originalSource: %%source%% } },
    if (source) {
        const optionalSource = t.optionalMemberExpression(optionalDocs, t.identifier('source'), false, true);

        extraDocsParameters.push(
            t.objectProperty(
                t.identifier('source'),
                t.objectExpression([
                    t.objectProperty(t.identifier('originalSource'), t.stringLiteral(source)),
                    t.spreadElement(optionalSource),
                ])
            )
        );
    }

    if (extraDocsParameters.length > 0) {
        parameters.push(
            t.objectProperty(
                t.identifier('docs'),
                t.objectExpression([t.spreadElement(optionalDocs), ...extraDocsParameters])
            )
        );
        const addParameter = t.expressionStatement(
            t.assignmentExpression('=', originalParameters, t.objectExpression(parameters))
        );
        csf._ast.program.body.push(addParameter);
    }
};
