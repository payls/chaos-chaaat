'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('project', 'country_fk', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'is_deleted',
      });
      await queryInterface.addColumn('project', 'slug', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'country_fk',
      });
      await queryInterface.addColumn('project', 'property_header_info_name', {
        type: Sequelize.TEXT,
        allowNull: true,
        after: 'slug',
      });
      await queryInterface.addColumn(
        'project',
        'property_header_info_descriptions',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'property_header_info_name',
        },
      );
      await queryInterface.addColumn(
        'project',
        'property_header_info_short_description',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'property_header_info_descriptions',
        },
      );
      await queryInterface.addColumn(
        'project',
        'property_header_info_cover_picture_url',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'property_header_info_short_description',
        },
      );
      await queryInterface.addColumn('project', 'completion_status', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        after: 'property_header_info_cover_picture_url',
      });
      await queryInterface.addColumn('project', 'availability_status', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        after: 'completion_status',
      });
      await queryInterface.addColumn('project', 'bedrooms_description', {
        type: Sequelize.TEXT,
        allowNull: true,
        after: 'availability_status',
      });
      await queryInterface.addColumn('project', 'pricing_description', {
        type: Sequelize.TEXT,
        allowNull: true,
        after: 'bedrooms_description',
      });
      await queryInterface.addColumn('project', 'residences_description', {
        type: Sequelize.TEXT,
        allowNull: true,
        after: 'pricing_description',
      });
      await queryInterface.addColumn('project', 'estimated_completion', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'residences_description',
      });
      await queryInterface.addColumn('project', 'units_available_description', {
        type: Sequelize.TEXT,
        allowNull: true,
        after: 'estimated_completion',
      });
      await queryInterface.addColumn('project', 'brochure_url', {
        type: Sequelize.TEXT,
        allowNull: true,
        after: 'units_available_description',
      });
      return Promise.resolve();
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('project', 'country_fk');
      await queryInterface.removeColumn('project', 'slug');
      await queryInterface.removeColumn('project', 'property_header_info_name');
      await queryInterface.removeColumn(
        'project',
        'property_header_info_descriptions',
      );
      await queryInterface.removeColumn(
        'project',
        'property_header_info_short_description',
      );
      await queryInterface.removeColumn(
        'project',
        'property_header_info_cover_picture_url',
      );
      await queryInterface.removeColumn('project', 'completion_status');
      await queryInterface.removeColumn('project', 'availability_status');
      await queryInterface.removeColumn('project', 'bedrooms_description');
      await queryInterface.removeColumn('project', 'pricing_description');
      await queryInterface.removeColumn('project', 'residences_description');
      await queryInterface.removeColumn('project', 'estimated_completion');
      await queryInterface.removeColumn(
        'project',
        'units_available_description',
      );
      await queryInterface.removeColumn('project', 'brochure_url');
      return Promise.resolve();
    });
  },
};
