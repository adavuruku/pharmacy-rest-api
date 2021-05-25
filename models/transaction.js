'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      //Transaction.belongsTo(models.UsersInformation, { as: 'CustomerInfo', foreignKey: 'customerId' });
      Transaction.belongsTo(models.Inventory, { as: 'productInfo', foreignKey: 'productId' });
      Transaction.belongsTo(models.TransactionReceipt, { as: 'Receipt', foreignKey: 'transactionReceipt' });
    }
  };
  Transaction.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey:true,
      type: DataTypes.INTEGER
    },
    transactionReceipt: {type: DataTypes.UUID, allowNull:false},
    productId: {type: DataTypes.UUID,allowNull: false},
    quantity: {type: DataTypes.INTEGER, defaultValue:1},
    unitPrice: {type: DataTypes.DECIMAL(15, 2),defaultValue: 0},
  }, {
    sequelize,
    modelName: 'Transaction',
    tableName: "Transactions",
    timestamps:true
  });
  return Transaction;
};