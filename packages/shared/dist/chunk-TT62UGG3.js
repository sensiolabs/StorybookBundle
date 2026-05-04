import { JSDOM } from 'jsdom';

// src/server/lib/injectPreviewHtml.ts
var injectPreviewHtml = (previewHtml, targetHtml) => {
  if (!targetHtml.includes("<!--PREVIEW_HEAD_PLACEHOLDER-->")) {
    throw new Error("Missing PREVIEW_HEAD_PLACEHOLDER in Storybook iframe HTML.");
  }
  if (!targetHtml.includes("<!--PREVIEW_BODY_PLACEHOLDER-->")) {
    throw new Error("Missing PREVIEW_BODY_PLACEHOLDER in Storybook iframe HTML.");
  }
  const previewDom = new JSDOM(previewHtml);
  const previewHead = previewDom.window.document.head;
  const previewBody = previewDom.window.document.body;
  return targetHtml.replace("<!--PREVIEW_HEAD_PLACEHOLDER-->", previewHead.innerHTML).replace("<!--PREVIEW_BODY_PLACEHOLDER-->", previewBody.innerHTML);
};

export { injectPreviewHtml };
