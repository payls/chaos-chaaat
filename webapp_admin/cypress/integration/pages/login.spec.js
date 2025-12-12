import user from '../../fixtures/agency-user.json';

// describe('src/pages/login.js', () => {
//   beforeEach(() => {
//     cy.visit('http://localhost:3115');
//   });

//   it('should render login page', () => {
//     cy.get('h1').contains('Log In');
//     cy.get('p').contains('Welcome Back');
//   });

//   it('should not login with invalid email or password', () => {
//     cy.get('input[name=email]').type('mervin+cypress-test@yourpave.com');
//     cy.get('input[name=password]').type(`123456{enter}`);

//     cy.get('.Toastify__toast').contains('Invalid email or password provided.');
//   });

//   it('should not login with empty email input', () => {
//     cy.get('input[name=password]').type(`123456{enter}`);

//     cy.get('.invalid-feedback').contains(
//       'Email is required Email is not a valid',
//     );
//   });

//   it('should not login with invalid email input', () => {
//     cy.get('input[name=email]').type(`test.gmail.com{enter}`);

//     cy.get('.invalid-feedback').contains('Email is not a valid');
//   });

//   it('should not login with empty password input', () => {
//     cy.get('input[name=email]').type(`test@gmail.com{enter}`);

//     cy.get('.invalid-feedback').contains('Password is required');
//   });

//   it('should not login with empty email input and empty password input', () => {
//     cy.get('button[type=submit]').click();

//     cy.get('.invalid-feedback').contains(
//       'Email is required Email is not a valid',
//     );
//     cy.get('.invalid-feedback').contains('Password is required');
//   });

//   it('should not login with invalid email input and empty password input', () => {
//     cy.get('input[name=email]').type(`test.gmail.com{enter}`);

//     cy.get('.invalid-feedback').contains('Email is not a valid');
//     cy.get('.invalid-feedback').contains('Password is required');
//   });

//   it('should succesfully login with email and password', () => {
//     cy.get('input[name=email]').type(user.email);
//     cy.get('input[name=password]').type(`${user.password}{enter}`);
//     cy.url().should('include', '/dashboard');
//   });
// });
