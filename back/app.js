const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const admin = require("firebase-admin");
const app = express();
const server = http.createServer(app);
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());

const io = socketIO(server);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://aiomessenger-da2d4-default-rtdb.europe-west1.firebasedatabase.app/", // URL to Firebase Realtime Database
});
 
const database = admin.database();

// Reference to the root of your Firebase Realtime Database
const usersRef = database.ref("/users");
const conversationsRef = database.ref("/conversations");

function getUserData(id) {
  usersRef
    .once('value')
    .then((snapshot => {
      return snapshot.child(id).val();
    }))
    .catch((error) => {
      console.error("Error fetching data:", error);
      return null
    });
}

function sendMsgByNotification (token, title = "New Notification", body = "this is a test notification", image = null) {
  console.log("sending message initialized")
  console.log("body", body)
  const message = {
    data: {
      title: title,
      body: body
    },
    token: token,
  };
  if (image) message.data.imageUrl = image
  console.log("end", message.data)
  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message", error);
    });
}

io.on("connection", (socket) => {
  console.log("user", socket.id, "is connected");

  socket.on("socket id", (nickname) => {
    console.log("on socket id");
    console.log("nickname", nickname);
    if (nickname !== null) {
      user_id = nickname;
    }
    if (nickname !== null) {
      if (socket.id) usersRef.child(nickname).child("socket_id").set(socket.id);
      usersRef.child(nickname).child("status").set("online");
    }
  });
  socket.on('disconnect', () => {
    console.log(socket.id, "disconnected")
  })
  socket.on("respond", (data) => {
    var {sender, recipient, answer} = data
    console.log("respond got triggered",sender, answer);
    usersRef
      .once("value")
      .then((snapshot) => {
        const callmaker = sender ? snapshot.child(sender).val() : null;
        if (!callmaker) {
          console.log("Recipient not found");
          return;
        }
        console.log("sending response to", callmaker)
        io.to(callmaker.socket_id).emit("respond", answer)

      })
      .catch(console.error);
  });
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg); 
  });
  socket.on("chat", (msg) => {
    let myString = msg.target + msg.host;
    let conversationId = [...myString].sort().join("");
    const data = { [conversationId]: "" };
    conversationsRef
      .child(conversationId)
      .once("value", (snapshot) => {
        if (!snapshot.exists()) {
          data &&
            conversationsRef
              .update(data)
              .then(() => {
                console.log("data added successfully");
              })
              .catch((err) => console.log(err));
        }
      })
      .catch((error) => {
        console.error("Error checking user existence:", error);
      });
  });
  socket.on("private message", (data) => {
    console.log(data)
    const { sender, recipient, message, message_type, sendTime, amplitudes } = data;
    console.log(message_type)
    if (recipient && sender && message) {
      let myString = sender + recipient;  
      let conversationId = [...myString].sort().join("");
      const messageData = {
        sender_id: sender,
        receiver_id: recipient,
        message: message,
        send_time: sendTime,
        message_type: message_type
    };
    if (amplitudes !== null) {
      messageData.amplitudes = amplitudes
    }
      conversationsRef
        .child(conversationId)
        .push(messageData);
    }
    usersRef
      .once("value")
      .then((snapshot) => {
        const receiverData = recipient && snapshot.child(recipient).val();
        const senderData = sender && snapshot.child(sender).val()
        if (receiverData.id) {
          io.to(receiverData.socket_id).emit("updateMessage");
          io.to(senderData.socket_id).emit("updateMessage");
          if (receiverData.status !== "online") {
            sendMsgByNotification(receiverData.token, senderData.username, message, senderData.profilePicture)
          }
          
        } else {
          console.log("recipient not found");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  });
  socket.on("videoCall", (data) => {
    const { sender, recipient } = data;
    console.log("video call", sender, recipient)
    usersRef
      .once("value")
      .then((snapshot) => {
        const receiver = recipient ? snapshot.child(recipient).val() : null;
        const host = sender ? snapshot.child(sender).val() : null;
        if (!receiver && !sender) {
          console.log("Recipient not found");
          return;
        }

        if (receiver.status === "offline" && receiver.token) {
          var callInfo = {sender: host.username, image: host.profilePicture, callType: "video"}
          console.log("callInfo", callInfo)
          sendMsg(receiver.token, "incoming", JSON.stringify(callInfo), null);
        } else if (receiver.status === "online" && receiver.id) {
          io.to(receiver.socket_id).emit("videoCall", { sender });
          // io.to(snapshot.child(sender).val().socket_id).emit("no-answer");
        }
      })
      .catch(console.error);
  });
  socket.on("audioCall", (data) => {
    const { sender, recipient } = data;
    console.log("audio call", sender, recipient)
    usersRef
      .once("value")
      .then((snapshot) => {
        const receiver = recipient ? snapshot.child(recipient).val() : null;
        const host = sender ? snapshot.child(sender).val() : null;
        if (!receiver) {
          console.log("Recipient not found");
          return;
        }

        if (receiver.status === "offline" && receiver.token) {
          var callInfo = {sender: host.username, image: host.profilePicture, callType: "audio"}
          sendMsg(receiver.token, "incoming", JSON.stringify(callInfo));
        } else if (receiver.status === "online" && receiver.id) {
          console.log("ongoing audio call to", receiver.username)
          io.to(receiver.socket_id).emit("audioCall", { sender });
        }
      })
      .catch(console.error);
  });
  socket.on("endCall", async (data) => {
    try {
      // Check if data is valid
      if (!data) {
        console.error("No data received in endCall event");
        return;
      }
  
      const { sender, recipient } = data;
  
      if (!sender || !recipient) {
        console.error("Sender or recipient missing in the data:", data);
        return;
      }
  
      // Fetch all users data once
      const snapshot = await usersRef.once("value");
      const receiver = snapshot.child(recipient)?.val();
      const host = snapshot.child(sender)?.val();
  
      // Validate receiver and host existence and properties
      if (!receiver || !host) {
        console.error("Sender or recipient data not found in database:", { sender, recipient });
        return;
      }
  
      if (!receiver.id || !receiver.socket_id) {
        console.error("Receiver data incomplete:", receiver);
        return;
      }
  
      if (!host.username || !host.profilePicture) {
        console.error("Host data incomplete:", host);
        return;
      }
  
      // Emit endCall event
      console.log("Emitting endCall to:", receiver.socket_id);
      io.to(receiver.socket_id).emit("endCall", {
        sender: host.username,
        image: host.profilePicture,
      });
    } catch (error) {
      console.error("Error handling endCall event:", error.message, error.stack);
    }
  });
  socket.on("offer", (data) => {
    let {sdp, sender, receiver} = data;
    console.log("offer got triggered sender: ", sender, "recepient: ", receiver);
    usersRef
      .once("value")
      .then((snapshot) => {
        const recepient = receiver ? snapshot.child(receiver).val() : null;
        const host = sender ? snapshot.child(sender).val() : null;
        if (!recepient && !host) {
          console.log("Recipient not found");
          return;
        }
        console.log(sender, "is sending offer to", receiver)
        io.to(recepient.socket_id).emit("offer", sdp)

      })
      .catch(console.error);
  });
  socket.on("answer", (data) => {
    let {sdp, sender, receiver} = data;
    console.log("answer got triggered sender: ", sender, "recepient: ", receiver);
    usersRef
      .once("value")
      .then((snapshot) => {
        const recepient = receiver ? snapshot.child(receiver).val() : null;
        const host = sender ? snapshot.child(sender).val() : null;
        if (!recepient && !host) {
          console.log("Recipient not found");
          return;
        }
        console.log(sender, "is sending answer to", receiver)
        io.to(recepient.socket_id).emit("answer", sdp)

      })
      .catch(console.error);
  });
  socket.on("iceCandidate", (data) => {
    let {candidate, sdpMid, sdpMLineIndex, sender, receiver} = data;
    console.log("offer got triggered sender: ", sender, "recepient: ", receiver);
    usersRef
      .once("value")
      .then((snapshot) => {
        const receiverData = receiver ? snapshot.child(receiver).val() : null;
        const host = sender ? snapshot.child(sender).val() : null;
        if (!receiverData && !host) {
          console.log("Recipient not found");
          return;
        }
        console.log(sender, "is sending ice candidate to", receiver)
        json = {
          sdpMid: sdpMid,
          sdpMLineIndex: sdpMLineIndex,
          candidate: candidate
        }
        io.to(receiverData.socket_id).emit("iceCandidate", json)

      })
      .catch(console.error);
    
  });
  socket.on("token", (data) => {
    const { token, id } = data;
    console.log("token received", id);
    if (token !== null && id !== null) {
      usersRef
      .child(id)
      .update({ token: token })
      .then(() => console.log("token added"))
      .catch((error) => console.log("Error fetching data:", error));
    }
    
  });
  socket.on("lastSeen", (data) => {
    console.log("on last seen")
    const { userId, time } = data;
    console.log(userId, time);
    usersRef.child(userId).child("lastSeen").set(time);
    usersRef.child(userId).child("status").set("offline")
  });
});

app.get("/userlist", async (req, res) => {
  console.log("userlist requested");
  await usersRef
    .once("value", (snapshot) => {
      const data = snapshot.val();
      res.send(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
});

app.get("/messages", async (req, res) => {
  console.log("hilo");
  await conversationsRef
    .once("value", (snapshot) => {
      const data = snapshot.child(conversationId).val();
      data && res.send(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
});

app.post("/messages", async (req, res) => {
  await conversationsRef
    .once("value", (snapshot) => {
      const data = snapshot.child(req.body.conId).val();
      data && res.send(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
});

app.post("/loggedin", async (req, res) => {
  console.log("login initialized");
  if (req.body.nickname) {
    newUser = {
      id: req.body.nickname,
      username: req.body.given_name,
      profilePicture: req.body.picture,
      email: req.body.email,
    };
  } else {
    newUser = {
      id: req.body.id,
      username: req.body.username,
      profilePicture: req.body.profilePicture,
      email: req.body.email,
    };
  }
  res.send("successful");

  if ((req.body.nickname && req.body.nickname !== "undefined") || req.body.id) {
    let childRef = req.body.id
      ? usersRef?.child(req.body.id)
      : usersRef?.child(req.body.nickname);
    await childRef.set(newUser);
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
