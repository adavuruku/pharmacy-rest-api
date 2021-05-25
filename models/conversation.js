'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(models) {
      // define association here
    }
  };
  Conversation.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey:true,
      type: DataTypes.INTEGER
    },
    fromUserId: {
      type: DataTypes.UUID,allowNull: false
    },
    toUserId: {
      type: DataTypes.UUID,allowNull: false
    },
    content: {
      type: DataTypes.TEXT
    },
  }, {
    sequelize,
    modelName: 'Conversation',
    tableName: "Conversations",
    timestamps:true
  });
  return Conversation;
};

