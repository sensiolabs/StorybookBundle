import { StrictArgs, DecoratorFunction, LoaderFunction, Args, ComponentAnnotations, ProjectAnnotations, StoryContext as StoryContext$1, AnnotatedStoryFn, StoryAnnotations } from 'storybook/internal/types';
export { ArgTypes, Args, Parameters, StrictArgs } from 'storybook/internal/types';
import { S as SymfonyRenderer } from './types-CmOsuV20.js';
export { t as twig } from './types-CmOsuV20.js';

/**
 * Metadata to configure the stories for a component.
 *
 * @see [Default export](https://storybook.js.org/docs/formats/component-story-format/#default-export)
 */
type Meta<TArgs = Args> = ComponentAnnotations<SymfonyRenderer, TArgs>;
/**
 * Story function that represents a CSFv2 component example.
 *
 * @see [Named Story exports](https://storybook.js.org/docs/formats/component-story-format/#named-story-exports)
 */
type StoryFn<TArgs = Args> = AnnotatedStoryFn<SymfonyRenderer, TArgs>;
/**
 * Story object that represents a CSFv3 component example.
 *
 * @see [Named Story exports](https://storybook.js.org/docs/formats/component-story-format/#named-story-exports)
 */
type StoryObj<TArgs = Args> = StoryAnnotations<SymfonyRenderer, TArgs>;

type Decorator<TArgs = StrictArgs> = DecoratorFunction<SymfonyRenderer, TArgs>;
type Loader<TArgs = StrictArgs> = LoaderFunction<SymfonyRenderer, TArgs>;
type StoryContext<TArgs = StrictArgs> = StoryContext$1<SymfonyRenderer, TArgs>;
type Preview = ProjectAnnotations<SymfonyRenderer>;

export { type Decorator, type Loader, type Meta, type Preview, type StoryContext, type StoryFn, type StoryObj, SymfonyRenderer };
