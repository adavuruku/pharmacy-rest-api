'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    //  await queryInterface.changeColumn('Conversation',  'online',  {type: Sequelize.BOOLEAN, defaultValue:true})
    await queryInterface.addColumn('Inventories',  'deleted',  {type: Sequelize.BOOLEAN, defaultValue:false})
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
