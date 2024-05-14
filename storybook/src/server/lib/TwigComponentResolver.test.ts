import { TwigComponentResolver } from './TwigComponentResolver';

const fixturesDir = `${__dirname}/__fixtures__/templates`;

const twigComponentConfig = {
    anonymousTemplateDirectory: `${fixturesDir}/anonymous`,
    namespaces: {
        '': `${fixturesDir}/components`,
        Custom: `${fixturesDir}/custom`,
    },
};
const resolver = new TwigComponentResolver(twigComponentConfig);

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
});

describe('resolveNameFromFile', () => {
    it('resolves in default namespace', () => {
        const resolved = resolver.resolveNameFromFile(`${fixturesDir}/components/Component.html.twig`);

        expect(resolved).toEqual('Component');
    });
    it('resolves in anonymous namespace', () => {
        const resolved = resolver.resolveNameFromFile(`${fixturesDir}/anonymous/Anonymous.html.twig`);

        expect(resolved).toEqual('Anonymous');
    });
    it('resolves in custom namespace', () => {
        const resolved = resolver.resolveNameFromFile(`${fixturesDir}/custom/CustomNamespace.html.twig`);

        expect(resolved).toEqual('Custom:CustomNamespace');
    });
    it('resolves in auto namespace', () => {
        const resolved = resolver.resolveNameFromFile(`${fixturesDir}/components/Namespace/AutoNamespace.html.twig`);

        expect(resolved).toEqual('Namespace:AutoNamespace');
    });
    it('fallbacks to default namespace', () => {
        const resolved = resolver.resolveNameFromFile(
            `${fixturesDir}/components/Custom/NotInCustomNamespace.html.twig`
        );

        expect(resolved).toEqual('Custom:NotInCustomNamespace');
    });
});
