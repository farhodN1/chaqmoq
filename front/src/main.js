import { createApp } from 'vue'
import App from './App.vue'
import {createAuth0 } from '@auth0/auth0-vue';
import VueCookies from 'vue-cookies'
import router from './router';
import store from './store'

const app = createApp(App);



app.use(store)
app.use(VueCookies)
app.use(
  createAuth0({
    domain: "dev-44ggtc7afebyxacf.us.auth0.com",
    clientId: "ktjOO6rxMjeZza2TQzWsXY0EJ3rxnTWF",
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  })
);
app.use(router)

app.mount('#app');
