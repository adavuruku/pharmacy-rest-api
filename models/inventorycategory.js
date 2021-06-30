'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InventoryCategory extends Model {
    static associate(models) {
      InventoryCategory.hasMany(models.Inventory,{
          foreignKey : 'productCategory',
          as : 'Products'
      });
    }
  };
  InventoryCategory.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      unique:true,
      type: DataTypes.INTEGER
    },
    categoryId: {type: DataTypes.UUID,allowNull:false,primaryKey:true},
    categoryName: {type: DataTypes.STRING,allowNull:false},
  }, {
    sequelize,
    modelName: 'InventoryCategory',
    tableName: "InventoryCategories",
    timestamps:true
  });
  return InventoryCategory;
};