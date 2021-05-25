'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('DeliveryLocations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        unique: true,
        type: Sequelize.INTEGER
      },
      locationId: {type: Sequelize.UUID,primaryKey: true},
      locationAddress: {
        type: Sequelize.TEXT
      },
      locationState: {
        type: Sequelize.STRING(100)
      },
      locationLocalGovt: {
        type: Sequelize.STRING(100)
      },
      customerId: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: 'UsersInformations'
          },
          key: 'userId'
        },
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('DeliveryLocations');
  }
};