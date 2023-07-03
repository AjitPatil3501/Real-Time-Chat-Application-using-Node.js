const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const clientRouter = require('./client');
const messageRouter = require('./message');

const app = express();
process.setMaxListeners(15);
// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));
app.set('view engine','ejs');
// Routes
app.use('/client', clientRouter);
app.use('/message', messageRouter);
app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 60 * 1000 // 1 hour in milliseconds
  }
}));
const Client = require('./client');
const Message = require('./message');
const db = require('./db');
db.connect();

async function createClients() {
  // Create two clients
  const client1 = new Client('John', 'john@example.com', 'Cricket', 'password1', '1234567890');
  await client1.save();
  //console.log('Client 1 created:', client1);

  const client2 = new Client('Mary', 'mary@example.com', 'Football', 'password2', '0987654321');
  await client2.save();
  //console.log('Client 2 created:', client2);
     const client3 = new Client('Mike', 'mike@example.com', 'Cricket', 'password3', '1111111111');
  await client3.save();
  //console.log('Client 3 created:', client3);
 /*
  const client4 = new Client('Samantha', 'samantha@example.com', 'Travel', 'password4', '2222222222');
  await client4.save();
  //console.log('Client 4 created:', client4);*/
  // Client 1 sends friend request to client 2
  await client1.sendFriendRequest(2);
  await client1.sendFriendRequest(3);
  // Client 2 accepts friend request from client 1
  await client2.acceptFriendRequest(1);
  await client3.acceptFriendRequest(1);
  // Get the chat history for the chat between client 1 and client 2
  const chatId = `${client1.id}_${client2.id}`;
  //console.log(chatId);


  // Client 1 sends a message to client 2
  const message1 = new Message(chatId);
  await message1.save();
  const message2 = new Message('1_3');
  await message2.save();
  await Message.sendMessage(chatId.toString(), client1.id.toString(), 'Hello, how are you?');
  await Message.sendMessage('1_3', '3', 'Hello, how are you 1_3');


  // Client 2 sends a message to client 1
  /*
  const message2 = new Message(chatId, client2.id);
  await message2.save();
  */
  await Message.sendMessage(chatId, client2.id, 'I am good, thanks for asking.');
  const chatHistory=await Message.getMessagesByChatId(chatId);
  //console.log('Chat history:', chatHistory);
  // Get the updated chat history for the chat between client 1 and client 2
  await Message.sendMessage('1_3', 1, 'I am good, thanks for asking. 1_3');
  const updatedChatHistory = await client1.getChatHistory(chatId);
  //console.log('Updated chat history:', updatedChatHistory);
  const updatedChatHistory1 = await client1.getChatHistory('1_3');
  //console.log('Updated chat history:', updatedChatHistory1);
  const getClientsByInterest1 =await Client.getClientsByInterest('Cricket');
  //console.log('Get Clients By Interest', getClientsByInterest1);
  const password = await Client.getClientByIdAndPassword(1,'password1');
  //console.log('Password Match', password.toString());
}
async function createClientDemo() {
  // Create two clients
  const client1 = new Client('John', 'john@example.com', 'Cricket', 'password1', '1234567890');
  await client1.save();
  //console.log('Client 1 created:', client1);

  const client2 = new Client('Mary', 'mary@example.com', 'Football', 'password2', '0987654321');
  await client2.save();
  //console.log('Client 2 created:', client2);
     const client3 = new Client('Mike', 'mike@example.com', 'Cricket', 'password3', '1111111111');
  await client3.save();
  //console.log('Client 3 created:', client3);
  const getClientsByInterest1 =await Client.getClientsByInterest('Cricket');
  //console.log('Get Clients By Interest', getClientsByInterest1);
}

async function send() {
  // Create two clients
  const client1 = new Client('John', 'john@example.com', 'Cricket', 'password1', '1234567890');
  await client1.save();
  //console.log('Client 1 created:', client1);

  const client2 = new Client('Mary', 'mary@example.com', 'Football', 'password2', '0987654321');
  await client2.save();
  //console.log('Client 2 created:', client2);

  const client3 = new Client('Mike', 'mike@example.com', 'Cricket', 'password3', '1111111111');
  await client3.save();
  //console.log('Client 3 created:', client3);

  // Add 4 more clients
  const client4 = new Client('Sarah', 'sarah@example.com', 'Cricket', 'password4', '2222222222');
  await client4.save();
  //console.log('Client 4 created:', client4);

  const client5 = new Client('Tom', 'tom@example.com', 'Football', 'password5', '3333333333');
  await client5.save();
  //console.log('Client 5 created:', client5);

  const client6 = new Client('Emily', 'emily@example.com', 'Football', 'password6', '4444444444');
  await client6.save();
  //console.log('Client 6 created:', client6);

  const client7 = new Client('Alex', 'alex@example.com', 'Cricket', 'password7', '5555555555');
  await client7.save();
  //console.log('Client 7 created:', client7);

}

app.get('/', async (req, res) => {
 // await createClients();
 // await send();
 const notification = req.session.notification; // check if a message exists in session
  req.session.notification = null;
  res.render('login',{notification:notification });
 // const getClientsByInterest1 =await Client.getClientsByInterest('Cricket');
 // //console.log('Get Clients By Interest', getClientsByInterest1[0].name);
  
});
app.get('/login', async (req, res) => {
  // await createClients();
   const username = req.session.username;
   const name = await Client.findNameByIdClient(parseInt(username));
   //console.log(` Username : ${username } `);
   const loginuser = await Client.findByIdClient(parseInt(username));
   const interest =  await Client.getInterstOfClient(parseInt(username));
   const participants = await Client.getFriendParticipants(parseInt(username),interest);
    res.render('chatdash',{id:username ,name:name ,loginuser:loginuser ,participants :participants  });
    //console.log(` Username : ${username } `);
    //console.log(` in login get .`);
  // await createClientDemo();
 });
 
app.post('/login', async (req, res) => {
  // await createClients();
   const username = req.body.username;
   const password = req.body.password;
   req.session.username = username;
   
  const name = await Client.findNameByIdClient(parseInt(username));
  //console.log(` Username : ${username } `);
  const loginuser = await Client.findByIdClient(parseInt(username));
  //const participants = await Client.getFriendParticipants(parseInt(username),'Cricket');
  const participants = await Client.getFriends(parseInt(username)); 
  ////console.log(participants);
  const passwordverify = await Client.getClientByIdAndPassword(parseInt(username),password);
  /*//console.log(participants);
  //console.log(`id : ${participants[0].id }`);
  //console.log(`participants : ${participants[0]}`);
  //console.log(`name : ${participants[0].name } `);*/
  //console.log(` PasswordVerify : ${passwordverify.toString() } `);
  const notification =  req.session.notification = {
    message: 'Registration  Successfully',
    alertType: 'error'
  };
  if(passwordverify.toString() == "true")
   {req.session.interest =   await Client.getInterstOfClient(parseInt(username));;
    res.render('chatdash',{id:username ,name:name ,loginuser:loginuser ,participants :participants  });
  }
  else
    res.render('login',{notification:notification });
   //console.log(` in login post .`);
  // await createClientDemo();
 });
 
 app.get('/chatdash', async (req, res) => {
  const participantId =  req.session.receiver;
  const username = req.session.username;
  //console.log(` receiver: ${participantId }  `);
  const participantName =  await Client.findNameByIdClient(parseInt(participantId));
  const chatId = `${Math.min(parseInt(username), parseInt(participantId))}_${Math.max(parseInt(username), parseInt(participantId))}`;
  const messages = await Client.getChatHistory(chatId);
  
  // Code to retrieve chat messages for the given participant ID
  const name = await Client.findNameByIdClient(parseInt(username));
  const loginuser = await Client.findByIdClient(parseInt(username));
 // const participants = await Client.getFriendParticipants(parseInt(username),'Cricket');
  const participants = await Client.getFriends(parseInt(username)); 
  res.render('chatdashapp',{id:username ,name:name ,loginuser:loginuser ,participants:participants , messages:messages ,participantId:participantId , participantName:participantName});
   //console.log(` in chatdash /id get.`);
 });
 app.post('/chatdash', async (req, res) => {
  const participantId = req.body.participantId;
  const username = req.session.username;
  req.session.receiver = participantId;
  //console.log(` receiver: ${participantId }  `);
  const participantName =  await Client.findNameByIdClient(parseInt(participantId));
  const chatId = `${Math.min(parseInt(username), parseInt(participantId))}_${Math.max(parseInt(username), parseInt(participantId))}`;
  const messages = await Client.getChatHistory(chatId);
  
  // Code to retrieve chat messages for the given participant ID
  const name = await Client.findNameByIdClient(parseInt(username));
  const loginuser = await Client.findByIdClient(parseInt(username));
 // const participants = await Client.getFriendParticipants(parseInt(username),'Cricket');
  const participants = await Client.getFriends(parseInt(username)); 
  res.render('chatdashapp',{id:username ,name:name ,loginuser:loginuser ,participants:participants , messages:messages ,participantId:participantId , participantName:participantName});
  // res.render('chatdashapp',{id:username ,name:name ,loginuser:loginuser ,participants:participants , messages:messages ,participantId:participantId});
  //res.render('chatdash',{id:username ,name:name ,loginuser:loginuser ,participants:participants ,participantId:participantId});
  
  ////console.log(` Username : ${username }  name: ${name }  chatId : ${chatId }  messages: ${messages }`);
     const message_ = JSON.stringify(messages);
    //console.log(`messages: ${JSON.stringify(messages)}`);

   //console.log(` id : ${username }  name: ${name }  chatId : ${chatId }  messages: ${ message_[0].senderId }  length: ${ messages.length } `);
 
   //console.log(` in chatdash /id post.`);
  //res.render('chat', { participantId: participantId, messages: messages });
});
app.post('/sendmessage', async (req, res) => {
  const participantId = req.session.receiver ;
  const username = req.session.username;
  const message = req.body.message;
  const chatId = `${Math.min(parseInt(username), parseInt(participantId))}_${Math.max(parseInt(username), parseInt(participantId))}`;
  //console.log(`participantId: ${participantId}  username: ${username}  chatId : ${chatId}  `  );
  await Message.sendMessage(chatId.toString(), username.toString(), message);
  res.redirect('/chatdash');
  //console.log(` in chatdash /id .`);
});
app.get('/signup', async (req, res) => {
  // await createClients();
  const notification = req.session.notification; // check if a message exists in session
  req.session.notification = null;
   res.render('signup',{notification:notification});
 });
 app.post('/signup', async (req, res) => {
  // await createClients();
  const username = req.body.username;
  const password = req.body.password;
  const emailid = req.body.emailid;
  const mobile_no = req.body.mobile_no;
  const interest = req.body.interest;
  const client7 = new Client(username, emailid, interest, password, mobile_no);
  await client7.save();
  //console.log(` Username : ${username }   Password : ${password }  Interest: ${interest } `);
  req.session.notification = {
    message: 'Registration  Successfully',
    alertType: 'success'
  };
  const notification = req.session.notification;
   res.render('login',{notification:notification});
 });

 app.get('/findfriend', async (req, res) => {
  const username = req.session.username;
  const loginuser = await Client.findByIdClient(parseInt(username));
  const interest =  await Client.getInterstOfClient(parseInt(username));
  const participants = await Client.getParticipantsByInterest(parseInt(username),interest);
  res.render('findfriend', { loginuser: loginuser, participants: participants });
});

app.get('/profile', async (req, res) => {
    const username = req.session.username;
    const loginuser = await Client.findByIdClient(parseInt(username));
    res.render('profile',{loginuser:loginuser});
    //console.log(`id: ${loginuser.id} name: ${loginuser.name} interest: ${loginuser.interest}`);
 });



 app.post('/sendrequest', async (req, res) => {
  const username = req.session.username;
  const participantId = req.body.participantId;
  const loginuser = await Client.findByIdClient(parseInt(username));
  const interest =  await Client.getInterstOfClient(parseInt(username));
  const participants = await Client.getParticipantsByInterest(parseInt(username),interest);
  await Client.sendFriendRequest(parseInt(username), parseInt(participantId));
  res.render('findfriend', { loginuser: loginuser, participants: participants });

  //console.log(`username: ${username}`);
  //console.log(`participantId: ${participantId}`);

});
app.post('/cancelrequest', async (req, res) => {
  const username = req.session.username;
  const participantId = req.body.participantId;
  const loginuser = await Client.findByIdClient(parseInt(username));
  const interest =  await Client.getInterstOfClient(parseInt(username));
  const participants = await Client.getParticipantsByInterest(parseInt(username),interest);
  await Client.cancelFriendRequest(parseInt(username), parseInt(participantId));
  res.render('findfriend', { loginuser: loginuser, participants: participants });
  //console.log(`participantId: ${participantId}`);
});


app.get('/getallrequest', async (req, res) => {
  const username = req.session.username;
  const loginuser = await Client.findByIdClient(parseInt(username));
  const participants = await Client.getAllRequests(parseInt(username));
  
  res.render('getallrequest',{loginuser: loginuser, participants: participants });
 
});



app.post ('/acceptrequest', async (req, res) => {
 
  const username = req.session.username;
  const loginuser = await Client.findByIdClient(parseInt(username));
  const participants = await Client.getAllRequests(parseInt(username));
  const participantId = req.body.participantId;
  await Client.acceptFriendRequest(parseInt(username), parseInt(participantId));
  //console.log(`in acceptRequest`);
  //console.log(`participantId: ${participantId}`);
  res.render('getallrequest',{loginuser: loginuser, participants: participants });
});


app.get ('/unfollowrequest', async (req, res) => {
 
  const username = req.session.username;
  const loginuser = await Client.findByIdClient(parseInt(username));
  const interest =  await Client.getInterstOfClient(parseInt(username));
  const participants = await Client.getFriendParticipants(parseInt(username),interest);
  res.render('unfollow', { loginuser: loginuser, participants: participants });
});
app.post ('/unfollowrequest', async (req, res) => {
 
  const username = req.session.username;
  const loginuser = await Client.findByIdClient(parseInt(username));
  const participants = await Client.getAllRequests(parseInt(username));
  const participantId = req.body.participantId;
  await Client.unfollowFriendRequest(parseInt(username), parseInt(participantId));
  //console.log(`in unfollowrequest`);
  //console.log(`participantId: ${participantId}`);
  res.render('getallrequest',{loginuser: loginuser, participants: participants });
});

// Handle GET request to /logout
app.get('/logout', (req, res) => {
  // Destroy the session and redirect to login page
  req.session.destroy();
  res.setHeader('Cache-Control', 'no-cache, no-store');
  res.setHeader('Expires', '-1');
  res.render('logout');
});

// Handle GET request to /returnlogin
app.get('/returnlogin', async (req, res) => {
  // Use pushState() to manipulate browser history
  res.send(`
    <script>
      window.history.pushState(null, '', '/');
      window.addEventListener('popstate', function (event) {
        window.location.href = '/';
      });
      setTimeout(function() {
        window.location.href = '/';
      }, 1000);
    </script>
    <h1>Please wait while we redirect you...</h1>
  `);
});





// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("http://localhost:5000");
});
