'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'shortlisted_property_comment',
        'user_fk',
        {
          type: Sequelize.UUID,
          allowNull: true,
          after: 'agency_user_fk',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'shortlisted_property_comment',
        'contact_comment',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          after: 'user_fk',
          defaultValue: true,
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'shortlisted_property_comment',
        'user_fk',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'shortlisted_property_comment',
        'contact_comment',
        {
          transaction,
        },
      );
    });
  },
};
