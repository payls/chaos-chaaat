'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'shortlisted_property_comment',
        'parent_comment_fk',
        {
          type: Sequelize.UUID,
          allowNull: true,
          after: 'comment_date',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'shortlisted_property_comment',
        'parent_comment_fk',
        { transaction },
      );
    });
  },
};
