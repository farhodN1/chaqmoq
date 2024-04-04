<template>
    <div>
        <p>Hello Farhod</p>
        <button @click="login">Login</button>
    </div>
</template>
<script>
    import { useAuth0 } from '@auth0/auth0-vue';
    import axios from 'axios';
    console.log(window)

    export default {
        data(){
            return {
                data: null
            }
        },
        setup(){
            const {loginWithPopup,user} = useAuth0()

            return {
                login: () => {
                    loginWithPopup(),
                    console.log(user._rawValue)
                    this.data = user._rawValue;
                    console.log(this.data)
                    axios.post('http://localhost:3000/loggedin', user._rawValue)
                    .then(response => {
                        // Handle success response
                        console.log('Response:', response.data);
                    })
                    .catch(error => {
                        // Handle error
                        console.error('Error:', error);
                    });

                }
            }
        },
        
    }

</script>