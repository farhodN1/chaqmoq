<template>
  <div class="users">
    <div class="user-block" v-for="user in userList" :key="user.id" @click="startChat(user.id, user.username)">
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
      userList: [],
      url: process.env.VUE_APP_URL
    };
  },
  mounted() {
    this.fetchUserList();
    this.socket = io(this.url,{
      transports: [ 'websocket' ],
      cors: {
        origin: this.url,  
        methods: ['GET', 'POST']
      }
    });
  },
  methods: {
    async fetchUserList() {
      const user_id = this.$cookies.get("user_id")
      try {
        const response = await axios.get(this.url+'/userlist');
        const filteredUsers = {};
        for (const userId in response.data) {
            if (Object.prototype.hasOwnProperty.call(response.data, userId)) {
                if (response.data[userId].id !== user_id) {
                    filteredUsers[userId] = response.data[userId];
                }
            }
        }
        this.userList = filteredUsers;
      } catch (error) {
        console.error('Error fetching user list:', error);
      }
      
    },
    startChat(userid, username){
      this.$store.dispatch('updateTargetData', {userid, username});
      const user_id = this.$cookies.get("user_id")
      this.socket.emit('chat', {
          target: userid,
          host: user_id
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
      background: yellow;
      width: 30%;
      height: 100vh;
      position: relative;
      left: 0;
      padding: 1%;
      margin: 0;
  }
</style>
