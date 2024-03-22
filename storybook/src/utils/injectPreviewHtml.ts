import { JSDOM } from 'jsdom';

export const injectPreviewHtml = (previewHtml: string, targetHtml: string) => {
    const previewDom = new JSDOM(previewHtml);

    const previewHead = previewDom.window.document.head;
    const previewBody = previewDom.window.document.body;

    return targetHtml
        .replace('<!--PREVIEW_HEAD_PLACEHOLDER-->', previewHead.innerHTML)
        .replace('<!--PREVIEW_BODY_PLACEHOLDER-->', previewBody.innerHTML);
};
