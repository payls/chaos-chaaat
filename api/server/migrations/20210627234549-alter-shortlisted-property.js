'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'shortlisted_property',
        'project_property_fk',
        {
          type: Sequelize.UUID,
          allowNull: true,
          after: 'shortlisted_property_id',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'shortlisted_property',
        'project_property_fk',
        { transaction },
      );
    });
  },
};
