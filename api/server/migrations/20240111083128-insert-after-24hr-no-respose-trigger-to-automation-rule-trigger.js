'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT INTO \`automation_rule_trigger\` (\`rule_trigger_id\`, \`description\`, \`platform\`)
      VALUES
      \t('da7875aa-7e42-4260-8941-02ba9b90e0f0', 'Message contact if not responded after form submission in x days', 'HUBSPOT');
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      DELETE FROM \`automation_rule_trigger\` WHERE \`rule_trigger_id\` = 'da7875aa-7e42-4260-8941-02ba9b90e0f0';
    `);
  },
};
