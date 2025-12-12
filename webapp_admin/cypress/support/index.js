// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

before(() => {
  // Block newrelic js outright due to issues with Cypress networking code.
  cy.log('Blocking NewRelic scripts');
  //Will block
  //  https://js-agent.newrelic.com/nr-spa-1208.js
  cy.intercept(/\.*newrelic.*$/, (req) => {
    console.log('NEW RELIC INTERCEPTED');
    req.reply("console.log('Fake New Relic script loaded');");
  });
});
