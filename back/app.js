//Farhodbek
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

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://aiomessenger-da2d4-default-rtdb.europe-west1.firebasedatabase.app/' // URL to your Firebase Realtime Database
});

const database = admin.database();

// Reference to the root of your Firebase Realtime Database
const usersRef = database.ref('/users');
const conversationsRef = database.ref('/conversations');

let user_id = null;


io.on('connection', (socket) => {
  console.log(socket.id)
  socket.on("socket id", (nickname) => {
      user_id = nickname.nickname
      usersRef.child(nickname.nickname).child("socket_id").set(socket.id);
      usersRef.child(nickname.nickname).child("status").set("online");
  })
  
  socket.on('disconnect', () => {
    user_id && usersRef.child(user_id).child("status").set("offline");
  });

  socket.on('respond', (msg)=>{
    io.emit('respond', msg)
  })

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('chat', (msg)=>{
    let myString = msg.target + msg.host
    let conversationId = [...myString].sort().join('');
    const data = {[conversationId]: ''}
    conversationsRef.child(conversationId).once('value', (snapshot) => {
      if (!snapshot.exists()){
        data && conversationsRef.update(data)
          .then(()=>{console.log("data added successfully")})
          .catch((err)=>console.log(err))
      }
    })
    .catch((error) => {
      console.error('Error checking user existence:', error);
    });
    

  })

  socket.on('private message', (data) => {
    const {sender, recipient, message} = data;
    if(recipient && sender && message){
      let myString = sender + recipient
      let conversationId = [...myString].sort().join('');
      conversationsRef.child(conversationId).push({sender_id: sender, receiver_id: recipient, message: message})
    }
    usersRef.once('value')
      .then((snapshot) => {
        console.log(recipient)
        
        const data = recipient && snapshot.child(recipient).val();
        if (data.id) {

          // io.to(data.socket_id).emit('private message', {
            io.emit('private message', {
            sender: socket.id,
            message: message
          })
        }
        else{console.log("recipient not found")}
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
    
  })
  //video call login
  socket.on('call', (data) => {
    const {sender, recipient} = data;
    usersRef.once('value')
    .then((snapshot) => {
      const receiver = recipient && snapshot.child(recipient).val();
      const host = recipient && snapshot.child(sender).val();
      console.log(data)
      if (receiver.id && host) {
        io.to(receiver.socket_id).emit('call', host.username)
      }
      else{console.log("recipient not found")}
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
  })
  socket.on('offer', offer => {
    socket.broadcast.emit('offer', offer);
  });
  socket.on('answer', answer => {
    socket.broadcast.emit('answer', answer);
  });
  socket.on('iceCandidate', candidate => {
    socket.broadcast.emit('iceCandidate', candidate);
  });
});

app.get('/userlist', async (req, res) => {
    console.log("userlist requested")
    await usersRef.once('value', (snapshot) => {
        const data = snapshot.val();
        res.send(data); 
    }).catch((error) => {
        console.error('Error fetching data:', error);
    });
})

app.get('/messages', async (req, res) => {
  console.log("hilo")
  await conversationsRef.once('value', (snapshot) => {
      const data = snapshot.child(conversationId).val();
      data && res.send(data);
  }).catch((error) => {
      console.error('Error fetching data:', error);
  });
})

app.post('/messages', async (req, res) => {
  console.log(req.body.conId)
  await conversationsRef.once('value', (snapshot) => {
      const data = snapshot.child(req.body.conId).val();
      data && res.send(data);
  }).catch((error) => {
      console.error('Error fetching data:', error);
  });
})

app.post('/loggedin', async (req, res) => {
  newUser = {
      id: req.body.nickname,
      username: req.body.given_name,
      profilePicture: req.body.picture,
      email: req.body.email
  }
  console.log(newUser)
  if(req.body.nickname && req.body.nickname !== "undefined"){
    let childRef = usersRef?.child(req.body.nickname)
    await childRef.set(newUser)
    res.send("the message received successfully")
  }
  
})

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});



