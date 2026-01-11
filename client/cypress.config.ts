import { defineConfig } from "cypress";
import { resolve } from "path";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    reporter: process.env.CYPRESS_REPORTER || 'spec',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: true,
      html: true,
      json: false,
      embeddedScreenshots: true,
      inlineAssets: true
    },
    env: {
      NODE_PATH: resolve('./node_modules')
    },
    async setupNodeEvents(on, config) {
      if (process.env.CYPRESS_REPORTER === 'cypress-mochawesome-reporter') {
        // @ts-expect-error ignore ts error for dynamic import
        const plugin = await import('cypress-mochawesome-reporter/plugin');
        plugin.default(on);
      }
      // implement node event listeners here
      return config;
    },
  },
})
