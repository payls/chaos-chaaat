'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('property', 'area_sqm', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('property', 'area_sqft', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('property', 'offer_price', {
      type: Sequelize.DECIMAL(20, 4),
    });
    await queryInterface.changeColumn(
      'property_transaction',
      'transaction_price',
      { type: Sequelize.DECIMAL(20, 4) },
    );
    await queryInterface.changeColumn(
      'property_transaction',
      'reservation_fee',
      { type: Sequelize.DECIMAL(20, 4) },
    );
    await queryInterface.changeColumn(
      'property_transaction',
      'reservation_fee_percent',
      { type: Sequelize.DECIMAL(20, 4) },
    );
    await queryInterface.changeColumn(
      'property_transaction',
      'stamp_duty_local_percent',
      { type: Sequelize.DECIMAL(20, 4) },
    );
    await queryInterface.changeColumn(
      'property_transaction',
      'stamp_duty_foreigner_percent',
      { type: Sequelize.DECIMAL(20, 4) },
    );
    await queryInterface.changeColumn(
      'property_transaction',
      'land_tax_local',
      { type: Sequelize.DECIMAL(20, 4) },
    );
    await queryInterface.changeColumn(
      'property_transaction',
      'land_tax_foreigner',
      { type: Sequelize.DECIMAL(20, 4) },
    );
    await queryInterface.changeColumn(
      'property_transaction',
      'contract_fee_percent',
      { type: Sequelize.DECIMAL(20, 4) },
    );
    await queryInterface.changeColumn(
      'property_transaction',
      'final_payment_percent',
      { type: Sequelize.DECIMAL(20, 4) },
    );
    await queryInterface.changeColumn('property_transaction', 'legal_cost', {
      type: Sequelize.DECIMAL(20, 4),
    });
    await queryInterface.changeColumn(
      'property_transaction',
      'conveyancing_fee',
      { type: Sequelize.DECIMAL(20, 4) },
    );
  },

  down: async (queryInterface, Sequelize) => {},
};
