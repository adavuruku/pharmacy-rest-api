'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TransactionReceipts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        unique: true,
        type: Sequelize.INTEGER
      },
      receiptId: {type: Sequelize.UUID,primaryKey: true},
      locationId: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: 'DeliveryLocations'
          },
          key: 'locationId'
        },
        allowNull: false
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
    await queryInterface.dropTable('TransactionReceipts');
  }
};