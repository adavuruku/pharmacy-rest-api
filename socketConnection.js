const {Sequelize,Op, QueryTypes} = require('sequelize');
const db = require('./models');
const {UsersInformation,Conversation} = require('./models/index');
class WebSockets {
    connection(client) {
      console.log('Receive Connection')
      client.on("disconnect", () => {
        console.log("Yeah Disconnected")
      });

      //chat coding begins here
      client.on("new-chat-post", async (record)=>{
        console.log(record)
          let chat = await Conversation.create(
          {
              content : record.content.trim(),
              fromUserId:record.fromUserId,fromUserRead:true,
              toUserId:record.toUserId.trim()
          });

          //fetch the new post
          let query = `SELECT "Conversation"."content", "Conversation"."toUserId", "Conversation"."fromUserId", "Conversation"."id", "Conversation"."toUserRead", "Conversation"."fromUserRead","Conversation"."createdAt", "toUser"."userId" As "toUser.userId" , "toUser"."profileImage" AS "toUser.profileImage", "toUser"."firstName" AS "toUser.firstName", "toUser"."lastName" AS "toUser.lastName", 
          "fromUser"."userId" AS "fromUser.userId", "fromUser"."profileImage" AS "fromUser.profileImage" , "fromUser"."firstName" AS "fromUser.firstName","fromUser"."lastName" AS "fromUser.lastName"  FROM "Conversations" AS "Conversation" LEFT OUTER JOIN "UsersInformations" AS "toUser" ON "Conversation"."toUserId" = "toUser"."userId" LEFT OUTER JOIN "UsersInformations" AS "fromUser" ON "Conversation"."fromUserId" = "fromUser"."userId" WHERE "Conversation"."id" = '${chat.id}' limit 1`

            const newChat = await db.sequelize.query(query,
                {
                    type: QueryTypes.SELECT
                }
            )
          let channelId = record.toUserId +"-new-chat"
          let channelIdFrom = record.fromUserId +"-new-chat"
          global.io.emit(channelId, newChat)
          global.io.emit(channelIdFrom, newChat)
          console.log('newy -> ',newChat)
      })
      client.on("delete-chat-post-for-all", async(record)=>{
        
      })
    }
  }
  
  module.exports = new WebSockets();
//   export default new WebSockets();