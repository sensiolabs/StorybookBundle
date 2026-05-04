import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: ".storybook",
            // The committed sandbox is installed by sandbox/bin/setup-standalone,
            // which intentionally uses npm. Generated user configs are
            // package-manager-aware through storybook:init --package-manager=...
            storybookScript: "npm run storybook",
            tags: {
              // Kept as upstream behavioral/error-case fixtures, not passing smoke coverage.
              exclude: ["will-fail"],
            },
          }),
        ],
        server: {
          proxy: {
            "/_storybook/render": {
              target: "http://localhost:8000",
              changeOrigin: true,
              headers: {
                "X-Storybook-Proxy": "true",
              },
            },
            "/assets": {
              target: "http://localhost:8000",
              changeOrigin: true,
              headers: {
                "X-Storybook-Proxy": "true",
              },
            },
            "/_components": {
              target: "http://localhost:8000",
              changeOrigin: true,
              headers: {
                "X-Storybook-Proxy": "true",
              },
            },
          },
        },
        optimizeDeps: {
          include: ["fast-xml-parser", "storybook/internal/docs-tools"],
        },
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            provider: playwright() as any,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
