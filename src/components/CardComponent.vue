<script setup>
import { defineProps } from 'vue';
defineProps({
    title:{
        type: [String, Boolean],
        default: false
    },
})
</script>
<template>
    <div class="card-component">
        <div class="title mb-2 fw-bold" v-if="title">{{ title }}</div>
        <slot name="content"></slot>
    </div>
</template>
<style lang="scss">
@import "@/assets/scss/all.scss";
.card-component {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 8px 8px 20px 0px rgba(0, 0, 0, 0.3);
    .title{
        color: $secondary;
    }
}
</style>
