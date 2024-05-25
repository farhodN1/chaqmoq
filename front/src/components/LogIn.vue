<template>
    <div>
        <button @click="login">Login</button>
    </div>
</template>

<script>
import { useAuth0 } from '@auth0/auth0-vue';
import axios from 'axios';
import { ref } from 'vue';

export default {
    setup() {
        const { loginWithPopup, user } = useAuth0();
        const data = ref(null);

        const loggedIn = (user) => {
            console.log("initializing loggedIn function")
            const expires = new Date();
            expires.setDate(expires.getDate() + 30);
            console.log(user._rawValue)
            axios.post(`${process.env.VUE_APP_URL}/loggedin`, user._rawValue)
                .then(response => {
                    // Handle success response
                    console.log("loggedin request was successful");
                    console.log('Response:', response.data);
                    console.log("checking the existence of nickname, the result:", user._rawValue.nickname ? "positive" : "negative");
                    if (user._rawValue.nickname) {
                        console.log("saving user_id into cookies");
                        document.cookie = `user_id=${user._rawValue.nickname};expires=${expires.toUTCString()};path=/`;
                    }
                    window.location.href = '/';
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        };

        const login = () => {
            console.log("login function initializing");
            loginWithPopup().then(() => {
                data.value = user._rawValue ? user._rawValue : null;
                data.value ? loggedIn(user) : console.log("oops");
            });
        };

        return {
            login,
            data
        };
    }
};
</script>
