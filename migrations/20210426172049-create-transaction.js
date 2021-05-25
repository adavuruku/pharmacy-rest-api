'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      transactionReceipt: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: 'TransactionReceipts'
          },
          key: 'receiptId'
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
      productId: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: 'Inventories'
          },
          key: 'inventoryId'
        },
        allowNull: false
      },
      quantity: {type: Sequelize.INTEGER, defaultValue:1},
      unitPrice: {type: Sequelize.DECIMAL(15, 2),defaultValue: 0},
      // paymentType: {type: Sequelize.ENUM(['Card', 'Transfer','Cash on delivery']) , defaultValue: 'Card'},
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
    await queryInterface.dropTable('Transactions');
  }
};