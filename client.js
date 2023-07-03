const { ObjectId } = require('mongodb');
const db = require('./db');
const Message = require('./message');

class Client {
  constructor(name, email, interests, password, mobile_no) {
    this.id = ++Client.count;
    this.name = name;
    this.email = email;
    this.interests = interests;
    this.password = password;
    this.mobile_no = mobile_no;
    this.allMemberChatIds = [];
    this.sentRequests = [];
    this.acceptRequests = [];
    this.acceptedRequests = [];
  }

  async save() {
    const result = await db.collection('clients').insertOne(this);
    return this;
  }


  static async findByIdClient(id) {
    return await db.collection('clients').findOne({ id });
  }
  static async findById(senderId, receiverId) {
    const sender = await db.collection('clients').findOne({ id: senderId });
    const receiver = await db.collection('clients').findOne({ id: receiverId });
  
    if (!sender || !receiver) {
      throw new Error('Invalid sender or receiver id');
    }
  
    return { sender, receiver };
  }
  /*
  async sendFriendRequest(id) {
    const receiver = await Client.findByIdClient(id);
    if (!receiver) {
      throw new Error('Invalid receiver id');
    }

    this.sentRequests.push(id);
    receiver.acceptRequests.unshift(this.id);

    await db.collection('clients').updateOne(
      { id: this.id },
      { $set: { sentRequests: this.sentRequests } }
    );
    await db.collection('clients').updateOne(
      { id: receiver.id },
      { $set: { acceptRequests: receiver.acceptRequests } }
    );
  }
 */


  /*
  async acceptFriendRequest(id) {
    const sender = await Client.findByIdClient(id);
    if (!sender ) {
      throw new Error('Invalid sender id or request');
    }
    this.acceptedRequests.push(id);
    await db.collection('clients').updateOne(
        { id: this.id },
        { $set: { acceptedRequests: this.acceptedRequests } }
    );
    const chatId = `${Math.min(this.id, sender.id)}_${Math.max(this.id, sender.id)}`;
    if (!this.allMemberChatIds.includes(chatId)) {
      this.allMemberChatIds.unshift(chatId);
    }
    if (!sender.allMemberChatIds.includes(chatId)) {
      sender.allMemberChatIds.unshift(chatId);
    }
    this.sentRequests = this.sentRequests.filter((clientId) => clientId !== id);
    sender.acceptedRequests = sender.acceptedRequests.filter((clientId) => clientId !== this.id);

    await db.collection('clients').updateOne(
      { id: this.id },
      {
        $set: { allMemberChatIds: this.allMemberChatIds, sentRequests: this.sentRequests },
      }
    );
    await db.collection('clients').updateOne(
      { id: sender.id },
      {
        $set: { allMemberChatIds: sender.allMemberChatIds, acceptedRequests: sender.acceptedRequests },
      }
    );
  }
  */
  static async sendFriendRequest(senderId, receiverId) {
    const { sender, receiver } = await Client.findById(senderId, receiverId);

    if (sender.sentRequests.includes(receiverId)) {
      // If the sender has already sent a request to the receiver, cancel it instead of sending another one
      await Client.cancelFriendRequest(senderId, receiverId);
      return;
    }

    sender.sentRequests.push(receiverId);
    receiver.acceptRequests.unshift(senderId);

    await db.collection('clients').updateOne(
      { id: senderId },
      { $set: { sentRequests: sender.sentRequests } }
    );
    await db.collection('clients').updateOne(
      { id: receiverId },
      { $set: { acceptRequests: receiver.acceptRequests } }
    );
  }

  static async cancelFriendRequest(senderId, receiverId) {
    const { sender, receiver } = await Client.findById(senderId, receiverId);

    sender.sentRequests = sender.sentRequests.filter((id) => id !== receiverId);
    receiver.acceptRequests = receiver.acceptRequests.filter((id) => id !== senderId);

    await db.collection('clients').updateOne(
      { id: senderId },
      { $set: { sentRequests: sender.sentRequests } }
    );
    await db.collection('clients').updateOne(
      { id: receiverId },
      { $set: { acceptRequests: receiver.acceptRequests } }
    );
  }






  static async acceptFriendRequest(senderId, receiverId) {
    const { sender, receiver } = await Client.findById(senderId, receiverId);
  
    receiver.acceptedRequests.push(senderId);
    await db.collection('clients').updateOne(
      { id: receiverId },
      { $set: { acceptedRequests: receiver.acceptedRequests } }
    );
  
    sender.sentRequests = sender.sentRequests.filter((clientId) => clientId !== receiverId);
    sender.acceptedRequests.push(receiverId);
  
    const chatId = `${Math.min(senderId, receiverId)}_${Math.max(senderId, receiverId)}`;
    if (!receiver.allMemberChatIds.includes(chatId)) {
      receiver.allMemberChatIds.unshift(chatId);  // Shifts the chat ID to the beginning of the array
    }
    if (!sender.allMemberChatIds.includes(chatId)) {
      sender.allMemberChatIds.unshift(chatId);  // Shifts the chat ID to the beginning of the array
    }
  
    await db.collection('clients').updateOne(
      { id: receiverId },
      {
        $set: { allMemberChatIds: receiver.allMemberChatIds },
      }
    );
    await db.collection('clients').updateOne(
      { id: senderId },
      {
        $set: { sentRequests: sender.sentRequests, acceptedRequests: sender.acceptedRequests, allMemberChatIds: sender.allMemberChatIds },
      }
    );
    await Client.cancelFriendRequest(receiverId ,senderId);
    // Create a message object for the new chat between the two clients
    const message = new Message(chatId);
    await message.save();
  }

  static async unfollowFriendRequest(senderId, receiverId) {
    const { sender, receiver } = await Client.findById(senderId, receiverId);
    
    receiver.sentRequests = receiver.sentRequests.filter((clientId) => clientId !== senderId);
    receiver.acceptedRequests = receiver.acceptedRequests.filter((clientId) => clientId !== senderId);
    
    sender.sentRequests = sender.sentRequests.filter((clientId) => clientId !== receiverId);
    sender.acceptedRequests = sender.acceptedRequests.filter((clientId) => clientId !== receiverId);
    
    const chatId = `${Math.min(senderId, receiverId)}_${Math.max(senderId, receiverId)}`;
    receiver.allMemberChatIds = receiver.allMemberChatIds.filter((id) => id !== chatId);
    sender.allMemberChatIds = sender.allMemberChatIds.filter((id) => id !== chatId);
    
    await db.collection('clients').updateOne(
      { id: receiverId },
      {
        $set: {
          sentRequests: receiver.sentRequests,
          acceptedRequests: receiver.acceptedRequests,
          allMemberChatIds: receiver.allMemberChatIds,
        },
      }
    );
    
    await db.collection('clients').updateOne(
      { id: senderId },
      {
        $set: {
          sentRequests: sender.sentRequests,
          acceptedRequests: sender.acceptedRequests,
          allMemberChatIds: sender.allMemberChatIds,
        },
      }
    );
    // Remove the message object for the new chat between the two clients

    await Message.deleteChatId(chatId);
  }
  
  static async getAllRequests(clientid) {
    const client = await Client.findByIdClient(clientid);
    if (!client) {
      throw new Error('Invalid client id');
    }
    const result = [];
    for (let i = 0; i < client.acceptRequests.length; i++) {
      const id = parseInt(client.acceptRequests[i]);
      const clientname = await Client.findByIdClient(id);
      const name = clientname.name;
      if (!isNaN(id)) {
        const info = { id, name}; // replace '' with client name if available
        result.push(info);
      }
    }
    return result;
  }

  static async getSentRequests(clientId) {
    const client = await db.collection('clients').findOne({ id: clientId });
    if (!client) {
      throw new Error('Invalid client id');
    }
    return client.sentRequests;
  }
  static async getChatHistory(chatId) {
    const messages = await Message.getMessagesForChats(chatId);
    return messages;
  }
  static async getClientByIdAndPassword(clientId, password) {
    const client = await Client.findByIdClient(clientId);
    //console.log(client);
    if(client && client.password == password )
        return true;
    else 
        return false;
  }
  static async getInterstOfClient(clientId) {
    const client = await Client.findByIdClient(clientId);
    if(client )
        return client.interests;
    else 
        return false;
  }
  static async  getClientsByInterest(interest) {
    const clients = await db.collection('clients').find({ interests: interest }).project({ password: 0 }).toArray();
    return clients;
  }
  static async getAllExcept(id) {
    const results = await db.collection('clients').find({ id: { $ne: id } , interests: interest }).toArray();
    return results.map(result => new Client(result.name, result.email, result.interests, result.password, result.mobile_no));
  }
  
  static async getParticipantsByInterest(id, interest) {
    const user = await db.collection('clients').findOne({ id: id });
    const results = await db.collection('clients')
      .find({
        interests: interest,
        id: { $ne: id },
        acceptedRequests: { $nin: [id] }
      })
      .project({ password: 0 })
      .toArray();
    return results;
  }

  static async findNameByIdClient(id) {
    const result = await db.collection('clients').findOne({ id }, { projection: { name: 1, _id: 0 } });
    return result ? result.name : null;
  }
  static async getFriendParticipants(id, interest) {
    const results = await db.collection('clients')
      .find({
        interests: interest,
        id: { $ne: id },
        acceptedRequests: id
      })
      .project({ password: 0 })
      .toArray();
    return results;
  }
  static async getFriends(currentUserId) {
    const currentUser = await db.collection('clients').findOne({ id: currentUserId });
    const friendParticipants = [];
  
    for (let i = 0; i < currentUser.allMemberChatIds.length; i++) {
      let chatId = currentUser.allMemberChatIds[i];
      let [id1, id2] = chatId.split('_');
      let friendId = parseInt(id1) === currentUserId ? parseInt(id2) : parseInt(id1);
  
      let friendData = await db.collection('clients').findOne({ id: friendId }, { projection: { password: 0 } });
      if (friendData) {
        friendParticipants.push(friendData);
      }
    }
  
    return friendParticipants;
  }
  
  
  
}
Client.count = 0;
module.exports = Client;
