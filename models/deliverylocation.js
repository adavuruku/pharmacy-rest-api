'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DeliveryLocation extends Model {

    static associate(models) {
      DeliveryLocation.belongsTo(models.UsersInformation, { as: 'CustomerInfo', foreignKey: 'customerId' });
      DeliveryLocation.hasMany(models.TransactionReceipt, { as: 'Receipts', foreignKey: 'locationId', targetKey: 'locationId' });
    }
  };
  DeliveryLocation.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      unique:true,
      type: DataTypes.INTEGER
    },
    locationId: {type: DataTypes.UUID,primaryKey: true,defaultValue: sequelize.UUIDV4},
    locationAddress: {type: DataTypes.TEXT},
    locationState: {type: DataTypes.STRING(100)},
    locationLocalGovt: {type: DataTypes.STRING(100)},
    customerId: {type: DataTypes.UUID,allowNull: false},
  }, {
    sequelize,
    modelName: 'DeliveryLocation',
    tableName: "DeliveryLocations",
    timestamps:true
  });
  return DeliveryLocation;
};