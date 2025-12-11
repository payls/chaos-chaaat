describe('[permalink].cy.js', () => {
  it('Visit test site', () => {
    cy.visit('/Ianapppave-Proposal-for-test-contact-29-7d6y7c6k');
  });

  it('should get name', () => {
    cy.get('div.header-container')
      .first()
      .within(() => {
        cy.get('span').contains('Jessie Ng');
      });
  });
  it(
    'should get project name',
    {
      retries: 1,
    },
    () => {
      cy.wait(20000); //wait to load project

      cy.get('h1.project-title').contains('Eastman Village');
    },
  );

  it('should get media triggers', () => {
    cy.get('div.image-tag-selected').contains('All');
    cy.get('div.image-tag').contains('Images');
  });

  it('should open/navigate/close carousel', () => {
    cy.wait(20000); //wait to load images
    cy.get('div#project-level-carousel').within(() => {
      // Open carousel
      cy.get('div.swiper-slide-active').first().click();

      // Navigate right
      cy.get('button#lg-next-1').click();

      // Navigate left
      cy.get('button#lg-prev-1').click();

      // Navigate to images
      cy.get('div').contains('Images').click();

      // Close carousel
      cy.get('button.lg-close').first().click();
    });
  });

  it('should show project info', () => {
    cy.wait(2000);
    cy.get('span')
      .contains('Key Stats')
      .then(($btn) => {
        cy.wrap($btn).click();
      });

    cy.wait(2000);
    cy.get('p').contains(
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    );
  });

  it('comment to project', () => {
    cy.wait(2000);
    cy.get('div.form-group')
      .first()
      .within(() => {
        cy.get('textarea').type('Cypress test');
      });
    cy.get('button[type="submit"]').click();
  });
  // });
});

// describe('rate project', () => {
//   beforeEach('Visit test site', () => {
//     cy.visit(
//       'http://localhost:3115/Ianapppave-Proposal-for-test-contact-29-7d6y7c6k',
//     );
//   });
//   it('should rate 3', () => {
//     cy.wait(10000);
//     cy.get('div.comment-star-rating')
//       .first()
//       .within(() => {
//         cy.get('span').eq(2).click();
//       });
//   });

//   it('should rate 5', () => {
//     cy.wait(10000);
//     cy.get('div.comment-star-rating')
//       .first()
//       .within(() => {
//         cy.get('span').eq(4).click();
//       });
//   });
// });
