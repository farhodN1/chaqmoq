<template>
    <div :style="{display: propValue}" class="hw">
        <button class="x">x</button>
        <div class="buttons">
            <button>{{propValue}}</button>
            <button>second</button>
            <button>third</button>
            <button @click="hangUp">hang up</button>
        </div>  
        <button class="full-screen">[~]</button>
    </div>
</template>
<script>
    import io from 'socket.io-client';

    export default{
        props: {
            propName: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                propValue: '',
                url: process.env.VUE_APP_URL
            };
        },
        mounted(){
            this.propValue = this.propName;
            this.socket = io(this.url,{
              transports: [ 'websocket' ],
              cors: {
                origin: this.url,  
                methods: ['GET', 'POST']
              }
            });
            this.socket.on("respond", (msg) => {
                if(msg) this.propValue = "none"
            })
        },
        methods: {
            hangUp() {
                this.propValue = "none"
            }
        },
        watch: {
            propName(newValue) {
                this.propValue = newValue;
            }
        }

    }
</script>
<style>
    .hw{
        background-color: red;  
        height: 300px;
        width: 500px;
        position: absolute;
        z-index: 9999;
        top: 30%;
        left: 40%;
        display: none;
    }
    .hw .x{
        position: absolute;
        right: 0;
        top: 0;
    }
    .hw .full-screen{
        position: absolute;
        right: 0;
        bottom: 0;
    }
    .hw .buttons{
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
    }
</style>