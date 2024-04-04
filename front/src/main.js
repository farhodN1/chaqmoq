import { createApp } from 'vue'
import App from './App.vue'
import {createAuth0 } from '@auth0/auth0-vue';
import Vuex from 'vuex';

const app = createApp(App);

app.use(Vuex);

const store = new Vuex.Store({
  state: {
    // Your shared data
    isLoggedIn: false,
    username: ''
  },
  mutations: {
    // Mutations to update the state
    setLoggedIn(state, value) {
      state.isLoggedIn = value;
    },
    setUsername(state, name) {
      state.username = name;
    }
  }
});

app.use(store)

app.use(
  createAuth0({
    domain: "dev-44ggtc7afebyxacf.us.auth0.com",
    clientId: "ktjOO6rxMjeZza2TQzWsXY0EJ3rxnTWF",
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  })
);

app.mount('#app');
