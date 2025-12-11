import user from '../fixtures/agency-user.json';

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('postLogin', () => {
  cy.intercept(
    'https://api-staging.yourpave.com/v1/staff/auth/login/email',
    (req) => {
      //     req.on('before:response', (res) => {
      //       // this will be called before any `req.continue` or
      //       // `response` handlers
      //     });
      //     req.continue((res) => {
      //       // this will be called after all `before:response`
      //       // handlers and before any `response` handlers
      //       // by calling `req.continue`, we signal that this
      //       // request handler will be the last one, and that
      //       // the request should be sent outgoing at this point.
      //       // for that reason, there can only be one
      //       // `req.continue` handler per request.
      //     });
      req.on('response', (res) => {
        //       // this will be called after all `before:response`
        //       // handlers and after the `req.continue` handler
        //       // but before the response is sent to the browser
        //       // cy.log(res);
        cy.setCookie(
          'P2CI5NDUUOP88ON9LFW2_production_pavewebadmin_AlphaTango',
          res.body.access_token,
        );
        //       // cy.window().then((win) => {
        //       //   win.localStorage.setItem(
        //       //     'P2CI5NDUUOP88ON9LFW2_production_pavewebadmin_AlphaTango',
        //       //     res.body.data.access_token,
        //       //   );
        // });
      });
    },
  );
});

Cypress.Commands.add('login', () => {
  // cy.intercept(
  //   'https://api-staging.yourpave.com/v1/staff/auth/login/email',
  //   (req) => {
  //     req.on('response', (res) => {
  //       cy.setCookie(
  //         'P2CI5NDUUOP88ON9LFW2_production_pavewebadmin_AlphaTango',
  //         res.body.access_token,
  //       );
  //     });
  //   },
  // )
  cy.visit('http://localhost:3115/login');
  cy.get('input[name=email]').type(user.email);
  cy.get('input[name=password]').type(`${user.password}{enter}`);
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('generateFixture', () => {
  const { faker } = require('@faker-js/faker');

  cy.writeFile('cypress/fixtures/dynamic/contact.json', {
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.phoneNumber(),
  });
});
