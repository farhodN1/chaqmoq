<template>
    <div :style="{display: disappear}" class="main">
        <div class="top-buttons">
            <button @click="makeDisappear">-</button>
            <button>[_]</button>    
            <button>x</button>
        </div>
        <div class="main-body">
            <video class="remoteStream" height="100%" width="100%" autoplay :srcObject="remoteStream"></video>
            <video @click="switchVideos" class="localStream" height="150px" width="250px" autoplay :srcObject="localStream"></video>
        </div>
      
    </div>
</template>
<script>
    export default{
        props: {
            video: {
                type: Object,
                required: true
            },
            localVideo: {
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
            },
            switchVideos(){
                this.localStream = this.remoteStream
                this.remoteStream = this.localStream
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
            localVideo(newValue){
                this.localStream = newValue;
            },
            appear(newValue){
                this.disappear = newValue;
            }
        }
    }
</script>
<style>
    .main {
        background-color: green;
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: 99;
    }
    .main .top-buttons{
        background-color: yellow;
        width: 100%;
        text-align: right;
    }
    .main-body{
        background-color: #ffffff;
        position: relative;
        height: 100%;
        width: 100%;
           
    }
    .localStream{
        position: absolute;
        left: 0;
    }
    .remoteStream{
    }
    
</style>