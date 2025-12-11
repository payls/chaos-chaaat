'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('feature', [
      {
        feature_id: uuidv4(),
        name: 'Swimming Pool',
        type: 'pool',
      },
      {
        feature_id: uuidv4(),
        name: 'Parking',
        type: 'parking',
      },
      {
        feature_id: uuidv4(),
        name: 'Garden',
        type: 'garden',
      },
      {
        feature_id: uuidv4(),
        name: 'Gym',
        type: 'gym',
      },
      {
        feature_id: uuidv4(),
        name: 'Golf simulator',
        type: 'golf-simulator',
      },
      {
        feature_id: uuidv4(),
        name: 'Sauna',
        type: 'sauna',
      },
      {
        feature_id: uuidv4(),
        name: 'Library',
        type: 'library',
      },
      {
        feature_id: uuidv4(),
        name: 'Theater',
        type: 'theater',
      },
      {
        feature_id: uuidv4(),
        name: 'Utility area',
        type: 'utility-area',
      },
      {
        feature_id: uuidv4(),
        name: 'Jacuzzi',
        type: 'jacuzzi',
      },
      {
        feature_id: uuidv4(),
        name: 'Games room',
        type: 'game-room',
      },
      {
        feature_id: uuidv4(),
        name: 'Security',
        type: 'security',
      },
      {
        feature_id: uuidv4(),
        name: 'Concierge',
        type: 'concierge',
      },
      {
        feature_id: uuidv4(),
        name: 'Dog wash',
        type: 'dog-wash',
      },
      {
        feature_id: uuidv4(),
        name: 'Residence club',
        type: 'residence-club',
      },
      {
        feature_id: uuidv4(),
        name: 'Wine room',
        type: 'wine-room',
      },
      {
        feature_id: uuidv4(),
        name: 'Steam room',
        type: 'steam-room',
      },
      {
        feature_id: uuidv4(),
        name: 'Co-working space',
        type: 'co-working-space',
      },
      {
        feature_id: uuidv4(),
        name: 'Meeting room',
        type: 'meeting-room',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('feature', null, {});
  },
};
