<template>
    <div>
        <button @click="login">Login</button>
    </div>
</template>
<script>
    import { useAuth0 } from '@auth0/auth0-vue';
    import axios from 'axios';
    

    export default {
        data(){
            return {
                data: null
            }
        },
        setup(){
            const {loginWithPopup, user} = useAuth0();
            return {
                login: () => {
                    loginWithPopup();
                    const data = user._rawValue
                    const expires = new Date();
                    expires.setDate(expires.getDate() + 30);
                    axios.post('https://74e902ba9b8e1f7998faa95494c93dba.serveo.net/loggedin', user._rawValue)
                    .then(response => {
                        // Handle success response
                        console.log('Response:', response.data);
                        if(data.nickname) {
                            document.cookie = `user_id=${data.nickname};expires=${expires.toUTCString()};path=/`;
                        }   
                        window.location.href = '/'
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                }
            }
        },
        
    }

</script>