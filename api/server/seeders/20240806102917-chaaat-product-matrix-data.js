'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'chaaat_product_matrix',
      [
        {
          chaaat_product_matrix_id: '20807cda-3a66-4b67-a54a-35cbe5153402',
          product_name: 'Trial',
          product_price: '0.00',
          allowed_channels: 2,
          allowed_users: 1,
          allowed_contacts: 500,
          allowed_campaigns: 1,
          allowed_automations: 5,
          allowed_outgoing_messages: 30,
          created_date: new Date(),
          updated_date: new Date(),
        },
        {
          chaaat_product_matrix_id: '793e0386-79cd-4c70-8e66-124a7968a2a1',
          product_name: 'Starter',
          product_price: '29.00',
          allowed_channels: 3,
          allowed_users: 3,
          allowed_contacts: 2000,
          allowed_campaigns: 5,
          allowed_automations: 5,
          allowed_outgoing_messages: 10000,
          created_date: new Date(),
          updated_date: new Date(),
        },
        {
          chaaat_product_matrix_id: '30fb4249-a209-4bea-9a89-4c432e4a2a4d',
          product_name: 'Pro',
          product_price: '199.00',
          allowed_channels: 10,
          allowed_users: 10,
          allowed_contacts: 15000,
          allowed_campaigns: 'unlimited',
          allowed_automations: 'unlimited',
          allowed_outgoing_messages: 'unlimited',
          created_date: new Date(),
          updated_date: new Date(),
        },
        {
          chaaat_product_matrix_id: 'f7cb2216-bbec-4fde-891d-6fec80092069',
          product_name: 'Enterprise',
          product_price: 'custom',
          allowed_channels: 'unlimited',
          allowed_users: 'unlimited',
          allowed_contacts: 'unlimited',
          allowed_campaigns: 'unlimited',
          allowed_automations: 'unlimited',
          allowed_outgoing_messages: 'unlimited',
          created_date: new Date(),
          updated_date: new Date(),
        },
      ],
      { ignoreDuplicates: true },
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('subscription', null, {});
  },
};
