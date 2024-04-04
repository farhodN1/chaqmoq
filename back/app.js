const http = require('http')
const express = require('express');
const socketIO = require('socket.io');
const admin = require('firebase-admin');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const serviceAccount = require('C:\\Users\\Пользователь\\Downloads\\serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://aiomessenger-da2d4-default-rtdb.europe-west1.firebasedatabase.app/' // URL to your Firebase Realtime Database
});

const database = admin.database();

// Reference to the root of your Firebase Realtime Database
const usersRef = database.ref('/users');
const conversationsRef = database.ref('/conversations');
// Read data from a specific location in the database



io.on('connection', (socket) => {
  socket.on("socket id", (nickname, id) => {
    usersRef.child(nickname).child("socket_id").set(id);
  })
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });

  socket.on('chat', (msg)=>{
    let myString = msg.target + msg.host
    let conversationId = [...myString].sort().join('');
    const data = {conversationId: ''}
    conversationsRef.child(conversationId).once('value', (snapshot) => {
      if (snapshot.exists()) {
        
      } else {
        conversationsRef.set(data)
          .then(()=>{console.log("data added successfully")})
          .catch((err)=>console.log(err))
      }
    })
    .catch((error) => {
      console.error('Error checking user existence:', error);
    });
    

  })

  socket.on('private message', (data) => {
    const {recipient, message} = data;
    const recipientSocketId = users.get(recipient);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('private message', {
        sender: socket.id,
        message: message
      })
    }
    else{console.log("recipient not found")}
  })
});

app.get('/userlist', async (req, res) => {
    await usersRef.once('value', (snapshot) => {
        const data = snapshot.val();
        res.send(data); 
    }).catch((error) => {
        console.error('Error fetching data:', error);
    });
})

app.post('/loggedIn', async (req, res) => {
  console.log(req.body.nickname, req.body.picture, req.body.given_name)
  newUser = {
      id: req.body.nickname,
      username: req.body.given_name,
      profilePicture: req.body.picture,
      email: req.body.email
  }
  console.log(newUser)
  let childRef = usersRef.child(req.body.nickname)
  await childRef.set(newUser)
  res.send("the message received successfully")
})

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});



