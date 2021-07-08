'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     await queryInterface.addColumn('UsersInformations',  'online',  {type: Sequelize.BOOLEAN, defaultValue:true})
    //  await queryInterface.addColumn('UsersInformations',  'profileImage',   {type: Sequelize.TEXT,allowNull:true})
     await queryInterface.addColumn('Conversations',  'toUserRead',  {type: Sequelize.BOOLEAN, defaultValue:false})
     await queryInterface.addColumn('Conversations',  'fromUserRead',  {type: Sequelize.BOOLEAN, defaultValue:false})
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
