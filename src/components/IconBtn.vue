<script setup>
import { defineProps } from "vue";
defineProps({
    iconClass: String,
    size: {
        type: String || null,
        default: "md",
    },
    active: {
        type: Boolean,
        default: false,
    },
});
</script>
<template>
    <button class="icon-btn" :class="{ active: active, [`icon-${size}`]: true }">
        <font-awesome-icon :icon="iconClass" :size="size=='md'?null:size" />
    </button>
</template>
<style lang="scss" scoped>
@import "@/assets/scss/all.scss";
.icon-btn {
    display: flex;
    justify-content: center;
    align-items: center; 
    svg {
        color: #555;
    }
    &.active {
        svg {
            color: $primary;
        }
    }
    &.icon-xs {
        width: 24px;
        height: 24px;
        svg {
            font-size: 12px;
        }
    }
    &.icon-sm {
        width: 30px;
        height: 30px;
        svg {
            font-size: 14px;
        }
    }
    &.icon- {
        width: 36px;
        height: 36px;
        svg {
            font-size: 16px;
        }
    }
    &.icon-lg {
        width: 42px;
        height: 42px;
        svg {
            font-size: 20px;
        }
    }
    &.icon-xl {
        width: 46px;
        height: 46px;
        svg {
            font-size: 24px;
        }
    }
    &.icon-2xl {
        width: 48px;
        height: 48px;
        svg {
            font-size: 30px;
        }
    }
}
</style>
