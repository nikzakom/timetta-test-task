const { defineConfig } = require("cypress");

module.exports = defineConfig({
  watchForFileChanges: false,
  requestTimeout: 30000,
  responseTimeout: 30000,
  defaultCommandTimeout: 15000,
  video: false,
  screenshotOnRunFailure: false,
  failOnStatusCode: false,
  chromeWebSecurity: false,
  env: {
    auth_base_url: 'https://auth.timetta.com'
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
