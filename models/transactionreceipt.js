'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TransactionReceipt extends Model {
    static associate(models) {
      TransactionReceipt.belongsTo(models.DeliveryLocation, { as: 'DeliveryLocation', foreignKey: 'locationId'});
      TransactionReceipt.hasMany(models.Transaction,{
          foreignKey : 'transactionReceipt',
          as : 'Items'
      });
      TransactionReceipt.belongsTo(models.UsersInformation, { as: 'CustomerInfo', foreignKey: 'customerId' });
    }
  };
  TransactionReceipt.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      unique: true,
      type: DataTypes.INTEGER
    },
    receiptId: {type: DataTypes.UUID,primaryKey: true, defaultValue: sequelize.UUIDV4},
    locationId: {type: DataTypes.UUID,allowNull: false},
    customerId: {type: DataTypes.UUID,allowNull: false},
    paymentType: {type: DataTypes.ENUM(['Card', 'Transfer','POS','Cash on delivery']) , defaultValue: 'Card'},
  }, {
    sequelize,
    modelName: 'TransactionReceipt',
    tableName: "TransactionReceipts",
    timestamps:true
  });
  return TransactionReceipt;
};