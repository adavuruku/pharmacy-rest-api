'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WishList extends Model {
    static associate(models) {
      WishList.belongsTo(models.Inventory, { as: 'productInfo', foreignKey: 'productId' });
      WishList.belongsTo(models.UsersInformation, { as: 'CustomerInfo', foreignKey: 'customerId' });
    }
  };
  WishList.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey:true,
      type: DataTypes.INTEGER
    },
    customerId: {type: DataTypes.UUID,allowNull: false},
    productId: {type: DataTypes.UUID,allowNull: false},
  }, {
    sequelize,
    modelName: 'WishList',
    tableName: "WishLists",
    timestamps:true
  });
  return WishList;
};