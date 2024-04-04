<template>

  <UserList />
  <RightSide msg="Welcome to Your Vue.js App"/>
  <LogIn />
  <ProfileInfo />

</template>

<script>
import RightSide from './components/RightSide.vue'
import UserList from "./components/UserList.vue"
import LogIn from './components/LogIn.vue'
import ProfileInfo from './components/ProfileInfo.vue'

export default {
  name: 'App',
  components: {
    UserList,
    RightSide,
    LogIn,
    ProfileInfo
  },
  provide: {
    isLoggedIn: true,
    username: {un: 'exampleUser'}
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
  background-color: blue;
}
</style>
