'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    //  await queryInterface.addColumn('TransactionReceipts',  'paymentType', {type: Sequelize.ENUM(['Card', 'POS', 'Transfer','Cash on delivery']) , defaultValue: 'Card'})
    //  await queryInterface.removeColumn('Transactions', 'paymentType')
     await queryInterface.removeColumn('Transactions', 'customerId')
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
