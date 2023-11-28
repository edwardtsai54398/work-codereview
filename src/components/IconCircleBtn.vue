<script setup>
import { defineProps } from "vue";
defineProps({
    iconClass: String,
    size: {
        type: String,
        default: "lg",
    },
});
</script>
<template>
    <button class="icon_circle_btn" :class="`icon-${size}`">
        <font-awesome-icon :icon="iconClass" :size="size"/>
    </button>
</template>
<style lang="scss" scoped>
@import "@/assets/scss/all.scss";
.icon_circle_btn {
    background-color: #fff;
    color: $primary;
    border-radius: 50%;
    box-shadow: 0px 0px 8px 5px rgba(90, 90, 90, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    &.icon-xs {
        width: 20px;
        height: 20px;
    }
    &.icon-sm {
        width: 24px;
        height: 24px;
    }
    &.icon-md {
        width: 30px;
        height: 30px;
    }
    &.icon-lg {
        width: 36px;
        height: 36px;
    }
    &.icon-xl {
        width: 42px;
        height: 42px;
    }
    &.icon-2xl {
        width: 46px;
        height: 46px;
    }
}
</style>
