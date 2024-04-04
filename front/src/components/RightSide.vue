<template>
  <div>
    <ul id="messages">
      <li v-for="(msg, index) in messages" :key="index">{{ msg }}</li>
    </ul>
    <div class="input">
      <input v-model="message" @keyup.enter="sendMessage" placeholder="Type your message here" />
      <input v-model="recipient" placeholder="Recipient username" />
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';


export default {
  data() {
    return {
      messages: [],
      message: '',
      recipient: '' // Add recipient data property
    };
  },
  mounted() {
    this.socket = io('http://localhost:3000',{
      transports: [ 'websocket' ],
      cors: {
        origin: 'http://localhost:3000',  
        methods: ['GET', 'POST']
      }
    });
    const username = "shutup"
    this.socket.emit('setUsername', username);
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('private message', (data) => {
      // Display private messages
      this.messages.push(`From ${data.sender}: ${data.message}`);
    });
  },
  methods: {
    sendMessage() {
      if (this.message && this.recipient) {
        // Emit private message event with recipient's username
        this.socket.emit('private message', {
          recipient: this.recipient,
          message: this.message
        });
        this.message = '';
      }
    },
  },
};
</script>
<style>
.input{
  background-color: red;
  width: 70
  %;
  height: 13%;
  position: absolute;
  bottom: 0;
  right: 0;
}
</style>
