'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'automation_rule_trigger',
      [
        {
          rule_trigger_id: 'eb7875aa-7e42-4260-8941-02ba9b91b123',
          description: 'Incoming message received',
          platform: 'CHAAATBUILDER',
          created_by: 'NULL',
          created_date: '2024-08-01 18:37:05',
          updated_date: '2024-08-01 18:37:05',
        },
        {
          rule_trigger_id: 'eb7875aa-7e42-4260-8941-02ba9b91b124',
          description: 'Broadcast',
          platform: 'CHAAATBUILDER',
          created_by: 'NULL',
          created_date: '2024-08-01 18:37:05',
          updated_date: '2024-08-01 18:37:05',
        },
        {
          rule_trigger_id: 'eb7875aa-7e42-4260-8941-02ba9b91b125',
          description: 'New Customer message received',
          platform: 'CHAAATBUILDER',
          created_by: 'NULL',
          created_date: '2024-08-01 18:37:05',
          updated_date: '2024-08-01 18:37:05',
        },
      ],
      { ignoreDuplicates: true },
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('automation_rule_trigger', null, {});
  },
};
