<template>
  <HoverWindow v-if="callData" :propName="callData" />
  <AnswerWindow v-if="answerData" @respond="respond" :propName="answerData" />
  <CallWin :appear="appear" v-if="remoteStream" :video="remoteStream" :localVideo="localStream" :passedFunction="startCall"/>
  <div class="rightSide">
    <div class="targetInfo">
      <h1>{{targetData.username}}</h1>
      <div class="call">
        <button v-if="recipient" @click="AudioCall">audio call</button>
        <button v-if="recipient" @click="VideoCall">video call</button>
      </div>
    </div>
    <div class="messages" style="overflow-y: auto;" ref="messagesContainer">
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
  import HoverWindow from './HoverWindow'
  import AnswerWindow from './AnswerWindow'
  import CallWin from './CallWin'

  export default {
    components: {
      HoverWindow,
      AnswerWindow,
      CallWin
    },
    data() {
      return {
        host: this.$cookies.get("user_id"),
        callData: null,
        appear: "none",
        answerData: null,
        messages: [],
        message: '',
        recipient: '',
        localStream: null,
        remoteStream: null,
        pc: null,
        audio: true,
        video: false,
        url: process.env.VUE_APP_URL
      };
    },
    computed: {
      targetData(){
        return this.$store.getters.getTargetData;
      }
    },
    mounted() {
      this.socket = io(this.url,{
        transports: [ 'websocket' ],
        cors: {
          origin: this.url,  
          methods: ['GET', 'POST']
        }
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
      });

      this.socket.on('private message', () => {
        this.fetchData()
      })

      this.socket.on("call", (sender) => {
        console.log(sender)
        this.answerData = ["block", sender]
      })

      this.socket.emit('socket id', {
        nickname: this.host
      });

      const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      this.pc = new RTCPeerConnection(configuration);
      console.log("peerConnection", this.pc)
      this.pc.ontrack = event => {
        this.answerData = 'none'
        this.callData = 'none'
        this.appear = "block"
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0]
          if(this.remoteStream.getTracks().length == 2) this.video = true
        }
      };

      this.socket.on('offer', async offer => {
        console.log("offer received")
        try {
          await this.pc.setRemoteDescription(offer);
          const answer = await this.pc.createAnswer();
          await this.pc.setLocalDescription(answer);
          this.socket.emit('answer', answer);
          
        } catch (error) {
            console.error('Error handling offer:', error);
        }
      });
  
      this.socket.on('answer', async answer => {
        console.log("answer received")
        try {
          await this.pc.setRemoteDescription(answer);
        } catch (error) {
          console.error('Error handling answer:', error);
        }
      });
  
      this.socket.on('iceCandidate', async candidate => {
        try {
          await this.pc.addIceCandidate(candidate);
        } catch (error) {
          console.error('Error handling ICE candidate:', error);
        }
      });
    },  
    methods: {
      async fetchData() { 
        let myString = this.host + this.recipient.userid
        let conversationId = [...myString].sort().join('');
        try {
          const response = await axios.post(this.url+'/messages', {conId: conversationId});
          this.messages = response.data;
        } catch(err) {
          console.log(err);
        }
      },
      sendMessage() {
        if (this.message) {
          this.socket.emit('private message', {
            sender: this.host,
            recipient: this.recipient.userid,
            message: this.message
          });
          this.message = '';
        }
        this.fetchData()
      },
      getMessageClass(sender) {
        const user_id = this.host
        return sender === user_id ? 'message-right' : 'message-left';
      },
      respond(res){
        if(res == 'pos'){
          this.socket.emit("respond", "true")
          this.startCall()
        }
        if(res == 'neg'){
          this.socket.emit("respond", "false")
        }
      },
      VideoCall() {
        this.callData = "block";
        this.video = true
        this.socket.emit("call", {sender: this.host, recipient: this.recipient.userid})
      },
      AudioCall() {
        this.video = false
        this.callData = "block";
        this.socket.emit("call", {sender: this.host, recipient: this.recipient.userid})
      },
      async startCall(){
          try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: this.video, audio: this.audio });
          console.log('stream', stream)
          this.localStream = stream;
          this.localStream.getTracks().forEach(track => this.pc.addTrack(track, this.localStream));

          const offer = await this.pc.createOffer();
          console.log("the actual offer", offer)
          await this.pc.setLocalDescription(offer); 

          this.pc.onicecandidate = event => {
              if (event.candidate) {
                this.socket.emit('iceCandidate', event.candidate);
              }
            };

          this.socket.emit('offer', offer);

        } catch (error) {
          console.error('Error starting call:', error);
        }
      },
      scrollToBottom() {
            const container = this.$refs.messagesContainer;
            container.scrollTop = container.scrollHeight;
        }
    },
    watch: {
      async targetData(targetId){
        this.recipient = targetId
        await this.fetchData() 
      },
      messages: {
            handler() {
                // Scroll to the bottom whenever the messages array changes
                this.$nextTick(() => {
                    this.scrollToBottom();
                });
            },
            deep: true
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
  .targetInfo .call{
    position: absolute;
    right: 0;
  }
  .targetInfo .call button{
    background: #eeffee;
    padding: 10px;
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
