'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UsersInformation extends Model {
    static associate(models) {
      UsersInformation.hasMany(models.TransactionReceipt,{
          foreignKey : 'customerId',
          as : 'Orders'
      });
      UsersInformation.hasMany(models.DeliveryLocation,{
        foreignKey : 'customerId',
        as : 'Locations'
    });
    }
  };
  UsersInformation.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey:true,
      type: DataTypes.INTEGER
    },
    firstName: {type: DataTypes.STRING(80),allowNull: false},
    profileImage: {type: DataTypes.STRING,allowNull: true},
    lastName: {type: DataTypes.STRING(80),allowNull: false},
    phone: {type: DataTypes.STRING(15),allowNull: true},
    email: {type: DataTypes.STRING(200),unique:true,allowNull:false},
    password: {type: DataTypes.TEXT,allowNull:false},
    userId: {type: DataTypes.UUID,unique:true,allowNull:false,defaultValue: sequelize.UUIDV4},
    status: {type: DataTypes.BOOLEAN, defaultValue:true},
    isAdmin: {type: DataTypes.BOOLEAN, defaultValue:false},
    isConsultant: {type: DataTypes.BOOLEAN, defaultValue:false},

  }, {
    sequelize,
    modelName: 'UsersInformation',
    tableName: "UsersInformations",
    timestamps:true
  });
  return UsersInformation;
};