'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('currency', {
      currency_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      currency_code: { type: Sequelize.STRING },
      name: { type: Sequelize.STRING },
      name_plural: { type: Sequelize.STRING },
      symbol: { type: Sequelize.STRING },
      symbol_native: { type: Sequelize.STRING },
      decimal_digits: { type: Sequelize.INTEGER },
      rounding: { type: Sequelize.INTEGER },
      created_by: { type: Sequelize.STRING },
      created_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_by: { type: Sequelize.STRING },
      updated_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        ),
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('currency');
  },
};
