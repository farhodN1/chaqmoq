<template>
    <div>
        <button @click="login">Login</button>
    </div>
</template>

<script>
// import { useAuth0 } from '@auth0/auth0-vue';
// import axios from 'axios';
// import { ref } from 'vue';

export default {
    // setup() {
    //     const { loginWithPopup, user } = useAuth0();
    //     const data = ref(null);

    //     const loggedIn = (user) => {
    //         const expires = new Date();
    //         expires.setDate(expires.getDate() + 30);
    //         axios.post(`${process.env.VUE_APP_URL}/loggedin`, user._rawValue);
    //             .then(response => {
    //                 if (user._rawValue.nickname) {
    //                     document.cookie = `user_id=${user._rawValue.nickname};expires=${expires.toUTCString()};path=/`;
    //                 }
    //                 window.location.href = '/';
    //             })
    //             .catch(error => {
    //                 console.error('Error:', error);
    //             });
    //     };

    //     const login = () => {
    //         loginWithPopup().then(() => {
    //             data.value = user._rawValue ? user._rawValue : null;
    //             data.value ? loggedIn(user) : console.log("oops");
    //         });
    //     };

    //     return {
    //         login,
    //         data
    //     };
    // }
};
</script>
