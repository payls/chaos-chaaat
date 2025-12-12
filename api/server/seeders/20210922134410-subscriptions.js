'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    // await queryInterface.sequelize.query(`
    //   INSERT IGNORE INTO \`subscription\` (\`subscription_id\`, \`subscription_max_users\`, \`subscription_name\`, \`created_by\`, \`created_date\`, \`updated_by\`, \`updated_date\`)
    //   VALUES
    //   \t(1, 1, 'Tier 1', NULL, '2021-09-12 16:21:05', NULL, '2021-09-12 16:21:05'),
    //   \t(2, 5, 'Tier 2', NULL, '2021-09-12 16:21:05', NULL, '2021-09-12 16:21:05'),
    //   \t(3, 20, 'Tier 3', NULL, '2021-09-12 16:21:05', NULL, '2021-09-12 16:21:05'),
    //   \t(4, 50, 'Tier 4', NULL, '2021-09-12 16:21:05', NULL, '2021-09-12 16:21:05'),
    //   \t(5, 1000000, 'Tier 5', NULL, '2021-09-12 16:21:05', NULL, '2021-09-12 16:21:05');
    // `);

    return queryInterface.bulkInsert(
      'subscription',
      [
        {
          subscription_id: '1',
          subscription_max_users: '1',
          subscription_name: 'Tier 1',
          created_by: 'NULL',
          created_date: '2021-09-12 16:21:05',
          updated_by: 'NULL',
          updated_date: '2021-09-12 16:21:05',
        },
        {
          subscription_id: '2',
          subscription_max_users: '1',
          subscription_name: 'Tier 2',
          created_by: 'NULL',
          created_date: '2021-09-12 16:21:05',
          updated_by: 'NULL',
          updated_date: '2021-09-12 16:21:05',
        },
        {
          subscription_id: '3',
          subscription_max_users: '6',
          subscription_name: 'Tier 3',
          created_by: 'NULL',
          created_date: '2021-09-12 16:21:05',
          updated_by: 'NULL',
          updated_date: '2021-09-12 16:21:05',
        },
        {
          subscription_id: '4',
          subscription_max_users: '25',
          subscription_name: 'Tier 4',
          created_by: 'NULL',
          created_date: '2021-09-12 16:21:05',
          updated_by: 'NULL',
          updated_date: '2021-09-12 16:21:05',
        },
        {
          subscription_id: '5',
          subscription_max_users: '1000000',
          subscription_name: 'Tier 5',
          created_by: 'NULL',
          created_date: '2021-09-12 16:21:05',
          updated_by: 'NULL',
          updated_date: '2021-09-12 16:21:05',
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
