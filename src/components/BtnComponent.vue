<script setup>
import { defineProps } from 'vue';
defineProps({
    content:{
        type: String,
        default: ""
    },
    iconClass:{
        type: String,
    },
    iconSize:{
        type: String,
        default: "md"
    }
})
</script>
<template>
        <div class="py-3 px-4 d-flex align-items-center custom-btn">
            <span class="me-2">{{ content }}</span>
            <font-awesome-icon :icon="iconClass" :iconSize="iconSize"/>
        </div>
    
</template>
<style lang="scss" scoped>
@import "@/assets/scss/all.scss";
.custom-btn{
    background: linear-gradient(to left, $primary 30%, #75D6F4);
    color: #fff;
    font-size: 24px;
    border-radius: 6px;
}
</style>
