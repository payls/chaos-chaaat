// import project from '../../../../fixtures/project.json';
// describe('src/pages/dashboard/projects/create.js', () => {
//   describe('create project', () => {
//     beforeEach(() => {
//       cy.login();
//       cy.visit('http://localhost:3115/dashboard/projects/create');
//     });

//     it('should create project', () => {
//       // Step 1
//       cy.get('h1').contains('Create Project');
//       cy.get('h3').contains('Project');

//       cy.get('input').eq(0).type(project.name, { force: true });

//       cy.get('select').eq(0).select(project.type);
//       cy.get('select').eq(1).select(project.currency);
//       cy.get('select').eq(2).select(project.size_format);

//       cy.contains('Save & Next Step').click({ force: true });

//       // Step 2
//       cy.get('[type="checkbox"]').eq(0).check({ force: true });
//       cy.get('[type="checkbox"]').eq(1).check({ force: true });

//       cy.contains('Save & Next Step').click({ force: true });

//       // Step 3
//       cy.get('.react-grid-Container', { timeout: 10000 }).click();
//       cy.contains('Save & Next Step').click({ force: true });

//       // Step 4
//       cy.get('h3', { timeout: 10000 }).contains('Images');

//       cy.contains('Save & Return to projects').click({ force: true });

//       // Find created project
//       cy.get('.dropdown button', { timeout: 10000 }).click();
//       cy.get('.dropdown-item').contains('100 Per Page').click();

//       cy.get('table').contains(project.name);
//     });
//   });
// });
