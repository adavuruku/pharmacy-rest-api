'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Inventories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        unique:true,
        type: Sequelize.INTEGER
      },
      inventoryId: {
        type: Sequelize.UUID, primaryKey: true
      },
      productName: {
        type: Sequelize.TEXT,allowNull: false
      },
      productMeasure: {
        type: Sequelize.STRING(200),allowNull: false
      },
      productPrice: {
        type: Sequelize.DECIMAL(15,2), defaultValue:0
      },
      productDescription: {
        type: Sequelize.TEXT,allowNull: false
      },
      productCategory: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: 'InventoryCategories'
          },
          key: 'categoryId'
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
    await queryInterface.dropTable('Inventories');
  }
};