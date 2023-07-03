const { ObjectId } = require('mongodb');
const db = require('./db');
class Message {
  constructor(chatId) {
    this.chatId = chatId;
    this.message = [];
  }

  async save() {
    const result = await db.collection('messages').insertOne(this);
    this._id = result.insertedId;
    return this;
  }
  static async findMessageById(chatId) {
    return await db.collection('messages').findOne({ chatId });
  }
  static async getClientById(id) {
    return await db.collection('clients').findOne({ id });
  }
  static async getById(senderId, receiverId) {
    const sender = await db.collection('clients').findOne({ id: senderId });
    const receiver = await db.collection('clients').findOne({ id: receiverId });
  
    if (!sender || !receiver) {
      throw new Error('Invalid sender or receiver id');
    }
  
    return { sender, receiver };
  }
  /*
  static async sendMessage(chatid,sender,message) {
    const [first, second] = chatid.split('_').sort((a, b) => a - b);
    const trimmedChatId = `${first}_${second}`;
    //console.log(trimmedChatId); // Output: "1_2"
    const chatIdCode = await Message.findMessageById(chatid);
    //console.log(chatIdCode);
        let temp = sender.toString()+'_'+ message;
        //console.log(temp);
        chatIdCode.message.push(temp);
       
        await db.collection('messages').updateOne(
            { chatId: chatIdCode.chatId },
            { $set: { message: chatIdCode.message } }
        );
  }
  */
  static async sendMessage(chatid,sender,message) {
    const [first, second] = chatid.split('_').sort((a, b) => a - b);
    const trimmedChatId = `${first}_${second}`;
    //console.log(trimmedChatId); // Output: "1_2"
    let receiverData ;
    let senderData ; 
    let receiver ; 
    if(sender == first )
    {
      senderData = await Message.getClientById(parseInt(first));
      receiverData  = await Message.getClientById(parseInt(second));
      receiver = parseInt(second);
    }
    else
    {
      senderData = await Message.getClientById(parseInt(second));
      receiverData  = await Message.getClientById(parseInt(first));
      receiver = parseInt(first);
    }
      

    // add chatid to the beginning of the array for both sender and receiver,
    // and remove duplicates
    /*const receiverChatIds = new Set([chatid, ...receiverData.allMemberChatIds]);
    const senderChatIds = new Set([chatid, ...senderData.allMemberChatIds]);

    // convert Sets back to arrays, maintaining original order
    receiverData.allMemberChatIds = Array.from(receiverChatIds);
    senderData.allMemberChatIds = Array.from(senderChatIds);
    */

      const receiverChatIds = new Set(receiverData.allMemberChatIds);
      const senderChatIds = new Set(senderData.allMemberChatIds);

      receiverChatIds.delete(chatid);
      senderChatIds.delete(chatid);

      receiverData.allMemberChatIds = [chatid, ...receiverChatIds];
      senderData.allMemberChatIds = [chatid, ...senderChatIds];



      await db.collection('clients').updateOne(
        { id: receiver },
        {
          $set: { allMemberChatIds: receiverData.allMemberChatIds },
        }
      );
      await db.collection('clients').updateOne(
        { id:  parseInt(sender) },
        {
          $set: { allMemberChatIds: senderData.allMemberChatIds },
        }
      );

        const chatIdCode = await Message.findMessageById(chatid);
        //console.log(chatIdCode);
        let temp = sender.toString()+'_'+ message;
        //console.log(temp);
        chatIdCode.message.push(temp);
       
        await db.collection('messages').updateOne(
            { chatId: chatIdCode.chatId },
            { $set: { message: chatIdCode.message } }
        );
  }
  
  static async getMessagesByChatId(chatId) {
    return await db.collection('messages').find({ chatId: chatId }).toArray();
  }
  static async getMessagesForChat(chatId) {
    const messages = await db.collection('messages').find({ chatId }).toArray();
    const messagesForChat = messages.map(message => {
      const senderId = message.senderId;
      const [senderIndex, messageText] = message.message[0].split('_');
      const receiverId = message.message[1].split('_')[0];
      return {
        senderId,
        receiverId,
        messageText
      }
    });
    return messagesForChat;
  }
  static async getMessagesForChats(chatId) {
    const messages = await db.collection('messages').find({ chatId }).toArray();
    const messagesForChat = [];
    messages.forEach(message => {
      message.message.forEach(msg => {
        const [senderIndex, messageText] = msg.split('_');
        const senderId = parseInt(senderIndex);
        const receiverId = chatId.split('_').find(id => id !== senderIndex);
        messagesForChat.push({
          senderId,
          receiverId,
          messageText
        });
      });
    });
    return messagesForChat;
  }
  
  
  static async deleteMessagesByChatId(chatId) {
    await db.collection('messages').deleteMany({ chatId: chatId });
  }
  static async  deleteChatId(chatId) {
    await db.collection('messages').deleteMany({ chatId: chatId  });
  }
  
}

module.exports = Message;
