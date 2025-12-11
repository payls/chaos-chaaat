// import agencyUser from '../../../../fixtures/agency-user.json';

// describe('src/pages/dashboard/leads/create.js', () => {
//   describe('create contact', () => {
//     beforeEach(() => {
//       cy.generateFixture();

//       cy.login();
//       cy.visit('http://localhost:3115/dashboard/leads/all-leads');
//     });

//     it('should create contact', async () => {
//       const contact = await cy.fixture('dynamic/contact.json');

//       const firstName = contact.first_name;
//       const lastName = contact.last_name;
//       const email = contact.email;
//       const phoneNumber = contact.phone;

//       cy.get('h1').contains('Contacts');
//       cy.contains('New contact').click({ force: true });
//       cy.get('.modal-header').contains('Add Contact');

//       cy.get('.modal-container input').eq(0).type(firstName, { force: true });
//       cy.get('.modal-container input').eq(1).type(lastName, { force: true });
//       cy.get('.modal-container input').eq(2).type(phoneNumber, { force: true });
//       cy.get('.modal-container input').eq(3).type(email, { force: true });

//       cy.get('.modal-container select').eq(0).select(agencyUser.email);

//       cy.get('.modal-container').contains('Create').click({ force: true });

//       // Find created contact
//       cy.get('.dropdown button', { timeout: 10000 }).click();
//       cy.get('.dropdown-item').contains('100 Per Page').click();

//       cy.get('table').contains(firstName + lastName);
//     });
//   });
// });
