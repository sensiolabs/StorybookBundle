import { PresetProperty } from 'storybook/internal/types';
import { UserConfig } from 'vite';

declare const viteFinal: (config: UserConfig, options: any) => Promise<UserConfig>;
declare const previewHead: PresetProperty<'previewHead'>;
declare const previewBody: PresetProperty<'previewBody'>;

export { previewBody, previewHead, viteFinal };
