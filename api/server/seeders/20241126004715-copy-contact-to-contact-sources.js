'use strict';
const models = require('../models');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    const { contact: contactModel, contact_source: contactSourceModel } =
      models;
    const records = await contactModel.findAll();

    // Get all contacts and store contact_ids
    const contact_fks = [];
    records.forEach((data) => {
      const payload = {
        contact_source_id: uuidv4(),
        contact_fk: data.contact_id,
        source_contact_id: data.contact_id,
        source_type: 'webapp_admin',
        source_meta: null,
        source_original_payload: null,
        created_by: null,
        updated_by: null,
      };
      contact_fks.push(payload);
    });

    await queryInterface.sequelize.transaction(async (transaction) => {
      // Populate contact_source table
      await Promise.all(
        contact_fks.map(async (i) => {
          // Insert contact_fk only if it doesn't exists
          await contactSourceModel.findOrCreate({
            where: { contact_fk: i.contact_fk },
            defaults: {
              ...i,
            },
            transaction,
          });
        }),
      );
    });
  },

  down: async (queryInterface) => {
    queryInterface.bulkDelete('contact_source', {}, { truncate: true });
  },
};
