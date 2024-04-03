'use strict';

import { extractComponentsFromTemplate } from './extractComponentsFromTemplate';

describe('extractComponentsFromTemplate', () => {
    describe('twig', () => {
        it('extracts component name', () => {
            const template = `<twig:Component></twig:Component>`;

            expect(extractComponentsFromTemplate(template)).toEqual(['Component']);
        });
        it('extracts component name with complex namespace', () => {
            const template = `<twig:Domain:Component></twig:Domain:Component>`;

            expect(extractComponentsFromTemplate(template)).toEqual(['Domain:Component']);
        });
        it('extracts nested component names', () => {
            const template = `
                <twig:Component>
                    <twig:Nested></twig:Nested>        
                </twig:Component>
            `;

            expect(extractComponentsFromTemplate(template)).toEqual(['Nested', 'Component']);
        });
        it('does not consider named blocks', () => {
            const template = `
                <twig:Component>
                    <twig:block name='foo'></twig:block>        
                </twig:Component>
            `;

            expect(extractComponentsFromTemplate(template)).toEqual(['Component']);
        });
        it('extracts from component function', () => {
            const template = `
                {{ component('Component') }}
            `;

            expect(extractComponentsFromTemplate(template)).toEqual(['Component']);
        });
        it('extracts from both twig tag and component function', () => {
            const template = `
                <twig:Component>
                    {{ component('OtherComponent') }}
                </twig:Component>
            `;

            expect(extractComponentsFromTemplate(template)).toEqual(['OtherComponent', 'Component']);
        });
    });
});
