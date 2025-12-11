'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'shortlisted_property',
        'bookmark',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          after: 'contact_fk',
          defaultValue: false,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'shortlisted_property',
        'bookmark_date',
        {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
          after: 'bookmark',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('shortlisted_property', 'bookmark', {
        transaction,
      });
      await queryInterface.removeColumn(
        'shortlisted_property',
        'bookmark_date',
        {
          transaction,
        },
      );
    });
  },
};
