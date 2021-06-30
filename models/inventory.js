'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    static associate(models) {
      Inventory.belongsTo(models.InventoryCategory, { as: 'Category', foreignKey: 'productCategory' });
    }
  };
  Inventory.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      unique:true,
      type: DataTypes.INTEGER
    },
    inventoryId: {
      type: DataTypes.UUID, primaryKey:true, defaultValue: sequelize.UUIDV4
    },
    productName: {
      type: DataTypes.TEXT, allowNull: false
    },
    productImage: {
      type: DataTypes.STRING, allowNull: false
    },
    productMeasure: {
      type: DataTypes.STRING(240),allowNull: false
    },
    productPercent:{
      type: DataTypes.DECIMAL(15,2), defaultValue:0
    },
    productPrice: {
      type: DataTypes.DECIMAL(15,2), defaultValue:0
    },
    productDescription: {
      type: DataTypes.TEXT,allowNull: false
    },
    productCategory: {
      type: DataTypes.UUID,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Inventory',
    tableName: "Inventories",
    timestamps:true
  });
  return Inventory;
};