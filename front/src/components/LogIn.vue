<template>
    <div>
        <button @click="login">Login</button>
    </div>
</template>
<script>
    import { useAuth0 } from '@auth0/auth0-vue';
    // import axios from 'axios';

    export default {
        data(){
            return {
                data: null
            }
        },
        setup(){
            const {loginWithPopup,user} = useAuth0();
            return {
                login: () => {
                    loginWithPopup();
                    const data = user._rawValue
                    const expires = new Date();
                    expires.setDate(expires.getDate() + 30);
                    if(data.nickname) document.cookie = `user_id=${data.nickname};expires=${expires.toUTCString()};path=/`;
                    // axios.post('http://localhost:3000/loggedin', user._rawValue)
                    // .then(response => {
                    //     // Handle success response
                    //     console.log('Response:', response.data);
                    // })
                    // .catch(error => {
                    //     // Handle error
                    //     console.error('Error:', error);
                    // });
                    window.location.href = '/'
                }
            }
        },
        
    }

</script>