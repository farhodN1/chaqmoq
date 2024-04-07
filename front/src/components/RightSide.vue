<template>
  <div class="rightSide">
    <div class="targetInfo">
      <h1>{{targetData.username}}</h1>
    </div>
    <div class="messages">
       <div v-for="(message, index) in messages" :key="index" :class="getMessageClass(message.sender_id)">
        {{ message.message }}
      </div>
    </div>
    <div class="input" :class="{ 'disabled': targetData.username  === 'choose a chat' }">
      <input v-model="message" @keyup.enter="sendMessage" placeholder="Type your message here"  :class="{ 'disabled': targetData.username === 'choose a chat' }"/>
      <button @click="sendMessage" :class="{ 'disabled': targetData.username === 'choose a chat' }">send</button>
    </div>
  </div>
</template>

<script>
  import io from 'socket.io-client';
  import axios from 'axios';

  export default {
    data() {
      return {
        messages: [],
        message: '',
        recipient: ''
      };
    },
    computed: {
      targetData(){
        return this.$store.getters.getTargetData;
      }
    },
    mounted() {
      console.log("there", this.$cookies.get("user_id"))
      this.socket = io('http://localhost:3000',{
        transports: [ 'websocket' ],
        cors: {
          origin: 'http://localhost:3000',  
          methods: ['GET', 'POST']
        }
      });
      this.socket.on('connect', () => {
        console.log('Connected to server');
      });
      this.socket.emit('socket id', {
        // const user_id = this.$cookies.get("user_id")
        // console.log(user_id)
        nickname: this.$cookies.get("user_id")
      });
      this.socket.on('private message', (data) => {
        // Display private messages
        this.messages.push(`From ${data.sender}: ${data.message}`);
      });
    },
    methods: {
      async fetchData() {
        try {
          const response = await axios.get('http://localhost:3000/messages');
          this.messages = response.data;
        } catch(err) {
          console.log(err);
        }
      },
      sendMessage() {
        if (this.message) {
          console.log(this.targetInfo)
          this.socket.emit('private message', {
            recipient: this.recipient,
            message: this.message
          });
          this.message = '';
        }
        this.fetchData()
      },
      getMessageClass(sender) {
        const user_id = this.$cookies.get("user_id")
        console.log(user_id)
        return sender === user_id ? 'message-right' : 'message-left';
      }

    },
    watch: {
      async targetData(targetId){
        this.recipient = targetId
        await this.fetchData()
        
      }
    }
  };
</script>
<style>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.rightSide{
  width: 70%;
  height: 100vh;
  position: relative;
  align-content: space-between;
}
.targetInfo{
  height: 7%;
  width: 100%;
  background: white;
  position: absolute;
  margin: 0;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.messages {
  background: #ffeeff;
  position: absolute;
  top: 7%;
  width: 100%;
  height: 80%;
  display: flex;
  flex-direction: column;
}
.message-left {
  align-self: flex-start;
  background-color: #eee;
  padding: 5px;
  margin: 5px;
}

.message-right {
  align-self: flex-end;
  background-color: #007bff;
  color: white;
  padding: 5px;
  margin: 5px;
}
.input{
  background-color: red;
  width: 100%;
  height: 13%;
  position: absolute;
  bottom: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.input input{
  width: 70%;
  height: 50%;
}
.input button{
  height: 50%;
  width: 10%;
  border-radius: 20px;
  margin-left: 30px;
  font-size: 25px;
}
</style>
