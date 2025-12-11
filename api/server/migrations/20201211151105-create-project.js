'use strict';
const Constant = require('../constants/constant.json');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('project', {
      project_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      developer_fk: { type: Sequelize.UUID },
      name: { type: Sequelize.STRING },
      address_1: { type: Sequelize.STRING },
      address_2: { type: Sequelize.STRING },
      address_3: { type: Sequelize.STRING },
      city: { type: Sequelize.STRING },
      status: {
        allowNull: false,
        type: Sequelize.ENUM(Object.values(Constant.PROJECT.STATUS)),
        defaultValue: Constant.PROJECT.STATUS.NOT_STARTED,
      },
      commencement_date: { type: Sequelize.DATE },
      completion_date: { type: Sequelize.DATE },
      projected_completion_date: { type: Sequelize.DATE },
      no_of_units: { type: Sequelize.INTEGER },
      has_coworking_space: { type: Sequelize.INTEGER },
      has_pool: { type: Sequelize.INTEGER },
      has_gym: { type: Sequelize.INTEGER },
      has_meeting_rooms: { type: Sequelize.INTEGER },
      has_sauna: { type: Sequelize.INTEGER },
      has_bbq_area: { type: Sequelize.INTEGER },
      has_library_reading_room: { type: Sequelize.INTEGER },
      has_outdoor_kids_zone: { type: Sequelize.INTEGER },
      has_basketball_court: { type: Sequelize.INTEGER },
      has_tennis_court: { type: Sequelize.INTEGER },
      has_concierge: { type: Sequelize.INTEGER },
      has_carpark: { type: Sequelize.INTEGER },
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
    await queryInterface.dropTable('project');
  },
};
