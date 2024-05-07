import { Args } from '@storybook/types';
import { twig } from '../../lib/twig';

export const createComponent = (name: string, args: Args) => {
    const processedArgs = Object.entries(args).reduce(
        (acc, [name, value]) => {
            if (value._sfActionId !== undefined) {
                acc.actions.push(`{{ _context['${name}'] }}`);
            } else {
                acc.props.push(`:${name}="${name}"`);
            }

            return acc;
        },
        { props: [] as string[], actions: [] as string[] }
    );

    const argsAttributes = processedArgs.props;

    if (processedArgs.actions.length > 0) {
        argsAttributes.push(`data-storybook-action="${processedArgs.actions.join(' ')}"`);
    }

    return twig`
        <twig:${name} ${argsAttributes.join(' ')} />
    `;
};
