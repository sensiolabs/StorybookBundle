import { LoaderFunction } from '@storybook/types';

const isAction = (arg: any): boolean => {
    return (
        typeof arg === 'function' &&
        (('_isMockFunction' in arg && arg._isMockFunction) || ('isAction' in arg && arg.isAction))
    );
};

export const actionLoader: LoaderFunction = (context) => {
    const { args } = context;

    Object.entries(args)
        .filter(([, value]) => isAction(value))
        .forEach(([name, value]) => {
            value._sfActionId = name;
            if (value._isMockFunction) {
                value.mockReset();
            }
        });
};
