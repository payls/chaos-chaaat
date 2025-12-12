'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT INTO \`automation_rule_trigger\` (\`rule_trigger_id\`, \`description\`, \`platform\`)
      VALUES
      \t('eb7875aa-7e42-4260-8941-02ba9b91b1b0', 'Contact sent message for the 1st time', 'OTHER');
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      DELETE FROM \`automation_rule_trigger\` WHERE \`rule_trigger_id\` = 'eb7875aa-7e42-4260-8941-02ba9b91b1b0';
    `);
  },
};
