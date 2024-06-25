<template>
    <div :style="{display: propValue[0]}" class="hw">
        <button class="x">x</button>
        <h2>{{propValue[1]}} is calling</h2>
        <div class="buttons">
            <button @click="decline">decline</button>
            <button @click="answer">answer</button>
        </div>  
        <button class="full-screen">[~]</button>
        <!-- <audio ref="audio" :src="require('@/assets/ring.mp3')" controls autoplay></audio> -->
    </div>
</template>
<script>
    console.log(window.location.pathname)
    export default{
        props: {
            propName: {
                type: String,
                required: true
            }
        },
        methods: {
            decline(){
                this.$emit('respond', "neg")
                this.propValue[0] = 'none'
            },
            answer(){
                this.$emit('respond', 'pos')
                this.propValue[0] = 'none'
            }
        },
        data() {
            return {
                propValue: '' 
            };
        },
        created(){
            this.propValue = this.propName;
        },
        watch: {
            propName(newValue) {
                this.propValue = newValue;
                console.log(this.propValue)
            }
        },

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