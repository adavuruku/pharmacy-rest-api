'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UsersInformations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        unique:true,
        type: Sequelize.INTEGER,
      },
      userId: {type: Sequelize.UUID,primaryKey: true, allowNull:false},
      password: {type: Sequelize.TEXT,allowNull:false},
      firstName: {type: Sequelize.STRING(80),allowNull:false},
      lastName: {type: Sequelize.STRING(80),allowNull:false},
      phone: {type: Sequelize.STRING(15),allowNull: true},
      email: {type: Sequelize.STRING(200),unique:true,allowNull:false},
      status: {type: Sequelize.BOOLEAN, defaultValue:true},
      isAdmin: {type: Sequelize.BOOLEAN, defaultValue:false},
      isConsultant: {type: Sequelize.BOOLEAN, defaultValue:false},
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
    await queryInterface.dropTable('UsersInformations');
  }
};