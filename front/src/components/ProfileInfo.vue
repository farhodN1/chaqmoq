<template>
    <p>{{username}}</p>
</template>
<script>

export default {
  inject: ['isLoggedIn', 'username']
}

</script>