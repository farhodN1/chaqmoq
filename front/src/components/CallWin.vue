<template>
    <div :style="{display: disappear == 'video call' ? 'block' : 'none'}" class="main-video">
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
    
    <div :style="{display: disappear == 'audio call' ? 'block' : 'none'}" class="main-audio">
        <div class="top-buttons">
            <button @click="makeDisappear">-</button>
            <button>[_]</button>    
            <button>x</button>
        </div>
        <div class="main-body">
            <!-- Audio call should only play the remote stream as audio, no local video stream -->
            <audio class="remoteStream" controls autoplay :srcObject="remoteStream"></audio>
            <div class="control-btns">
                <button @click="endCall" class="hand-up">hand up</button>
            </div>
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
                setTimeout(() => {
                    console.log("shit")
                    this.localStream = null 
                    this.remoteStream = this.localStream
                }, 3000);
                
            },
            endCall(){
                this.$emit('respond', 'endCall')
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
    .main-video {
        background-color: green;
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: 99;
    }
    .main-video .top-buttons{
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

    .main-audio {
        background-color: green;
        position: absolute;
        margin-top: 100px;
        height: 300px;
        width: 400px;
        z-index: 99;
        right: calc(50% - 200px);
        border-radius: 10px;
        border: 1px solid gray;
    }
    .main-audio .hang-up {
        
    }
    
</style>