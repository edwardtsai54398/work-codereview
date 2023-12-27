<script setup>
import {ref, watch, defineProps, defineEmits} from "vue"
defineProps({
    tabs: Array,
})
const emit = defineEmits([
    "change"
])
const activeTab = ref(0)
watch(activeTab,(newVal)=>{
    emit("change", newVal)
},{deep:true, immediate:true})
</script>
<template>
    <ul class="custom-tabs">
        <li class="custom-tab px-4 py-3" v-for="(item, index) in tabs" :key="index" :class="{ 'active': activeTab == index }" @click="activeTab = index">
            <slot name="tab" :item="item" :index="index">
                {{ item }}
            </slot>
        </li>
    </ul>
</template>
<style lang="scss">
@import "@/assets/scss/all.scss";

.custom-tabs {
    display: flex;
    margin: 0;
    padding-left: 0;
}

.custom-tab {
    font-size: 24px;
    list-style: none;
    cursor: pointer;
    position: relative;

    &::before {
        content: '';
        display: block;
        width: 100%;
        height: 4px;
        position: absolute;
        bottom: 0;
        left: 0;
    }

    &.active {
        &::before {
            background-color: $primary;
        }
    }
}
</style>