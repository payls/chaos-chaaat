'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('integrations', [
      {
        integrations_id: uuidv4(),
        service_name: 'hubspot',
        connection_type: 'oauth',
        created_by: 'NULL',
        created_date: '2021-08-31 18:37:05',
        updated_by: 'NULL',
        updated_date: '2021-08-31 18:37:05',
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('integrations', null, {});
  },
};
