<template>
    <div :style="{display: disappear}" class="videos">
        <div class="top-buttons">
            <button @click="makeDisappear">-</button>
            <button>[_]</button>    
            <button>x</button>
        </div> 
        <h2>{{remoteStream.getTracks()[0]}}</h2>
      <video height="100%" width="100%" autoplay :srcObject="remoteStream"></video>
      <video height="300px" width="400px" autoplay :srcObject="localStream"></video>
    </div>
</template>
<script>
    export default{
        props: {
            video: {
                type: Object,
                required: true
            },
            appear: {
                type: String
            },
            passedFunction: {
                type: Function
            }
        },
        methods: {
            makeDisappear(){
                this.disappear = "none"
            }
        
        },
        data(){
            return {
                remoteStream: null,
                localStream: null,
                disappear: "none"
            };
        },

        created(){
            this.remoteStream = this.video
            this.disappear = this.appear
            this.passedFunction()
        },
        watch: {
            video(newValue){
                this.remoteStream = newValue;
            },
            appear(newValue){
                this.disappear = newValue;
            }
        }
    }
</script>
<style>
    .videos {
        background-color: green;
        position: absolute;
        z-index: 9999;
        height: 100%;
        width: 100%;
    }
    .videos .top-buttons{
        position: absolute;
        right: 0;
        top: 0;
    }
</style>