import type {
    AnnotatedStoryFn,
    Args,
    ComponentAnnotations,
    StoryAnnotations,
    StoryContext as GenericStoryContext,
    DecoratorFunction,
    LoaderFunction,
    StrictArgs,
    ProjectAnnotations,
} from '@storybook/types';
import type { SymfonyRenderer } from './types';

export type { Args, ArgTypes, Parameters, StrictArgs } from '@storybook/types';

/**
 * Metadata to configure the stories for a component.
 *
 * @see [Default export](https://storybook.js.org/docs/formats/component-story-format/#default-export)
 */
export type Meta<TArgs = Args> = ComponentAnnotations<SymfonyRenderer, TArgs>;

/**
 * Story function that represents a CSFv2 component example.
 *
 * @see [Named Story exports](https://storybook.js.org/docs/formats/component-story-format/#named-story-exports)
 */
export type StoryFn<TArgs = Args> = AnnotatedStoryFn<SymfonyRenderer, TArgs>;

/**
 * Story object that represents a CSFv3 component example.
 *
 * @see [Named Story exports](https://storybook.js.org/docs/formats/component-story-format/#named-story-exports)
 */
export type StoryObj<TArgs = Args> = StoryAnnotations<SymfonyRenderer, TArgs>;

export type { SymfonyRenderer };
export type Decorator<TArgs = StrictArgs> = DecoratorFunction<SymfonyRenderer, TArgs>;
export type Loader<TArgs = StrictArgs> = LoaderFunction<SymfonyRenderer, TArgs>;
export type StoryContext<TArgs = StrictArgs> = GenericStoryContext<SymfonyRenderer, TArgs>;
export type Preview = ProjectAnnotations<SymfonyRenderer>;
