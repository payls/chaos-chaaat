'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sf_contact_opportunity', {
      sf_contact_opportunity_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      agency_fk: {
        type: Sequelize.UUID,
      },
      attributes: {
        type: Sequelize.TEXT,
      },
      Id: {
        type: Sequelize.STRING,
      },
      OpportunityId: {
        type: Sequelize.STRING,
      },
      ContactId: {
        type: Sequelize.STRING,
      },
      IsPrimary: {
        type: Sequelize.BOOLEAN,
      },
      CreatedDate: {
        type: Sequelize.DATE,
      },
      CreatedById: {
        type: Sequelize.STRING,
      },
      LastModifiedDate: {
        type: Sequelize.DATE,
      },
      LastModifiedById: {
        type: Sequelize.STRING,
      },
      SystemModstamp: {
        type: Sequelize.DATE,
      },
      IsDeleted: {
        type: Sequelize.BOOLEAN,
      },
      created_by: {
        type: Sequelize.STRING,
      },
      created_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_by: {
        type: Sequelize.STRING,
      },
      updated_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        ),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sf_contact_opportunity');
  },
};
