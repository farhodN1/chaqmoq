<template>
  <div class="users">
    <div class="user-block" v-for="user in userList" :key="user.id" @click="startChat(user.id)">
      <img :src="user.profilePicture" alt="Profile Picture" class="profile-picture">
      <div class="username">{{ user.username }}</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import io from 'socket.io-client';

export default {
  data() {
    return {
      userList: []
    };
  },
  mounted() {
    this.fetchUserList();
    this.socket = io('http://localhost:3000',{
      transports: [ 'websocket' ],
      cors: {
        origin: 'http://localhost:3000',  
        methods: ['GET', 'POST']
      }
    });
    
  },
  methods: {
    async fetchUserList() {
      try {
        const response = await axios.get('http://localhost:3000/userlist');
        this.userList = response.data; // Assuming the response is an array of user objects
      } catch (error) {
        console.error('Error fetching user list:', error);
      }
    },
    startChat(userid){
      this.socket.emit('chat', {
          target: userid
    })
    }
  }
};
</script>

<style scoped>
.user-block {
  background: grey;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  border-radius: 20px;
}

.profile-picture {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.username {
  font-weight: bold;
}
.users {
    background: lime;
    height: 100%;
    width: 28%;
    position: absolute;
    left: 0;
    padding: 1%;
}
</style>
