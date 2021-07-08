'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(models) {
      Conversation.belongsTo(models.UsersInformation, { as: 'toUser', foreignKey: 'toUserId' });
      Conversation.belongsTo(models.UsersInformation, { as: 'fromUser', foreignKey: 'fromUserId' });
    }
  };
  Conversation.init({
    id: {
  //     type: Sequelize.UUID,
  // defaultValue: Sequelize.UUIDV4,
  // allowNull: false,
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
    toUserRead: {type: DataTypes.BOOLEAN, defaultValue:false},
    fromUserRead: {type: DataTypes.BOOLEAN, defaultValue:false}

  }, {
    sequelize,
    modelName: 'Conversation',
    tableName: "Conversations",
    timestamps:true
  });
  return Conversation;
};

