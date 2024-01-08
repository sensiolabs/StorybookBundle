'use strict';

import { twig } from '../../src/utils/twig';

describe('Twig utils', () => {
    describe('twig', () => {
        it('extracts component name', () => {
            const template = twig`<twig:Component></twig:Component>`;

            expect(template.getComponents()).toEqual(['Component']);
        });
        it('extracts component name with complex namespace', () => {
            const template = twig`<twig:Domain:Component></twig:Domain:Component>`;

            expect(template.getComponents()).toEqual(['Domain:Component']);
        });
        it('extracts nested component names', () => {
            const template = twig`
                <twig:Component>
                    <twig:Nested></twig:Nested>        
                </twig:Component>
            `;

            expect(template.getComponents()).toEqual(['Nested', 'Component']);
        });
        it('does not consider named blocks', () => {
            const template = twig`
                <twig:Component>
                    <twig:block name='foo'></twig:block>        
                </twig:Component>
            `;

            expect(template.getComponents()).toEqual(['Component']);
        });
        it('extracts from component function', () => {
            const template = twig`
                {{ component('Component') }}
            `;

            expect(template.getComponents()).toEqual(['Component']);
        });
        it('extracts from both twig tag and component function', () => {
            const template = twig`
                <twig:Component>
                    {{ component('OtherComponent') }}
                </twig:Component>
            `;

            expect(template.getComponents()).toEqual(['OtherComponent', 'Component']);
        });
    });
});
