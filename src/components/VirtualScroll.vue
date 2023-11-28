<script setup>
import { defineProps } from "vue";
// import { ref } from "vue";
import { computed } from "vue";
import { nextTick } from "vue";
const props = defineProps({
    height: [String, Number],
    items: Array,
});
const heightStyle = computed(()=>{
    if(typeof props.height === 'number'){
        return `${props.height}px`
    }else if(typeof props.height === 'string'){
        return props.height
    }
    return ''
})
let estimateItemSize = 50 
function calcShowItemCount (){
    // let itemHeight = document.querySelector('.virtual-scroll__item').offsetHeight
    let showItemCount = Math.floor(outerHeight/estimateItemSize)+1+8
    console.log(showItemCount);
}

nextTick(()=>{
    calcShowItemCount()
})
</script>
<template>
    <div class="virtual-scroll" :style="`height:${heightStyle};`">
        <div class="virtual-scroll__container">
            <div class="virtual-scroll__item" ref="scrollItem" v-for="(item, index) in items" :key="index">
                <slot name="default" :item="item" :index="index"></slot>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
    .virtual-scroll{
        flex: 1 1 auto;
        max-width: 100%;
        overflow: auto;
        position: relative;
    }
</style>