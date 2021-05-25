'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Conversations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fromUserId: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: 'UsersInformations'
          },
          key: 'userId'
        },
        allowNull: false
      },
      toUserId: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: 'UsersInformations'
          },
          key: 'userId'
        },
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('Conversations');
  }
};