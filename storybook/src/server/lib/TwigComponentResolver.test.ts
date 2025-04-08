import { TwigComponentResolver } from './TwigComponentResolver';
import path from 'path';

const projectDir = path.resolve();
const fixturesDir = `${__dirname}/__fixtures__/templates`;
const relativeFixturesDir = path.relative(projectDir, fixturesDir);

const twigComponentConfig = {
    anonymousTemplateDirectory: [`${relativeFixturesDir}/anonymous`, `${relativeFixturesDir}/twig_path/anonymous`],
    namespaces: {
        '': [`${relativeFixturesDir}/components`, `${relativeFixturesDir}/twig_path`],
        Custom: [`${relativeFixturesDir}/custom`],
    },
};

const resolver = new TwigComponentResolver(twigComponentConfig, projectDir);

describe('resolveFileFromName', () => {
    it('resolves component path without namespace', () => {
        const resolved = resolver.resolveFileFromName('Component');

        expect(resolved).toEqual(`${fixturesDir}/components/Component.html.twig`);
    });
    it('resolves component with auto namespace', () => {
        const resolved = resolver.resolveFileFromName('Namespace:AutoNamespace');

        expect(resolved).toEqual(`${fixturesDir}/components/Namespace/AutoNamespace.html.twig`);
    });
    it('resolves component with custom namespace', () => {
        const resolved = resolver.resolveFileFromName('Custom:CustomNamespace');

        expect(resolved).toEqual(`${fixturesDir}/custom/CustomNamespace.html.twig`);
    });
    it('fallbacks to default namespace', () => {
        const resolved = resolver.resolveFileFromName('Custom:NotInCustomNamespace');

        expect(resolved).toEqual(`${fixturesDir}/components/Custom/NotInCustomNamespace.html.twig`);
    });
    it('fallbacks to anonymous component', () => {
        const resolved = resolver.resolveFileFromName('Anonymous');

        expect(resolved).toEqual(`${fixturesDir}/anonymous/Anonymous.html.twig`);
    });
    it('fallbacks to next twig path', () => {
        const resolved = resolver.resolveFileFromName('TwigPath');

        expect(resolved).toEqual(`${fixturesDir}/twig_path/TwigPath.html.twig`);
    });
    it('resolves component with auto namespace and fallbacks to next twig path', () => {
        const resolved = resolver.resolveFileFromName('Foo:Bar');

        expect(resolved).toEqual(`${fixturesDir}/twig_path/Foo/Bar.html.twig`);
    });
    it('fallbacks to anonymous component and next twig path', () => {
        const resolved = resolver.resolveFileFromName('AnonymousTwigPath');

        expect(resolved).toEqual(`${fixturesDir}/twig_path/anonymous/AnonymousTwigPath.html.twig`);
    });
});

describe('resolveNameFromFile', () => {
    it('resolves in default namespace', () => {
        const resolved = resolver.resolveNameFromFile(`${relativeFixturesDir}/components/Component.html.twig`);

        expect(resolved).toEqual('Component');
    });
    it('resolves in anonymous namespace', () => {
        const resolved = resolver.resolveNameFromFile(`${relativeFixturesDir}/anonymous/Anonymous.html.twig`);

        expect(resolved).toEqual('Anonymous');
    });
    it('resolves in custom namespace', () => {
        const resolved = resolver.resolveNameFromFile(`${relativeFixturesDir}/custom/CustomNamespace.html.twig`);

        expect(resolved).toEqual('Custom:CustomNamespace');
    });
    it('resolves in auto namespace', () => {
        const resolved = resolver.resolveNameFromFile(
            `${relativeFixturesDir}/components/Namespace/AutoNamespace.html.twig`
        );

        expect(resolved).toEqual('Namespace:AutoNamespace');
    });
    it('fallbacks to default namespace', () => {
        const resolved = resolver.resolveNameFromFile(
            `${relativeFixturesDir}/components/Custom/NotInCustomNamespace.html.twig`
        );

        expect(resolved).toEqual('Custom:NotInCustomNamespace');
    });
    it('handle multiple nested levels of namespaces', () => {
        const resolved = resolver.resolveNameFromFile(`${relativeFixturesDir}/anonymous/Foo/Bar/Baz.html.twig`);

        expect(resolved).toEqual('Foo:Bar:Baz');
    });
    it('fallbacks to next twig path', () => {
        const resolved = resolver.resolveNameFromFile(`${relativeFixturesDir}/twig_path/TwigPath.html.twig`);

        expect(resolved).toEqual('TwigPath');
    });
    it('handle multiple nested levels when fallbacks to next twig path', () => {
        const resolved = resolver.resolveNameFromFile(`${relativeFixturesDir}/twig_path/Foo/Bar.html.twig`);

        expect(resolved).toEqual('Foo:Bar');
    });
});
