<template>
    <div ref="reference">
        <slot name="default" @mouseover="tipShow"></slot>
    </div>
</template>
<script setup>
import{defineProps, nextTick, ref, toRef} from 'vue'
const {content, id} = toRef(defineProps({
    content:String,
    id:String,
    // htmlContent:String
}))
const reference = ref()


let tooltipDiv = document.createElement("div");
tooltipDiv.className = "tooltip p-1";
tooltipDiv.textContent = content
document.body.appendChild(tooltipDiv);

nextTick(()=>{
    let pageX = reference.value.getBoundingClientRect().left
    let pageY = reference.value.getBoundingClientRect().top
    tooltipDiv.setAttribute("style", `top:${pageY}px;left:${pageX}px`)

})
function tipShow(){
    let hoverDOMId = document.getElementById(id)
    console.log(hoverDOMId);
}
</script>
<style lang="scss">
.tooltip{
    // opacity: 0;
    // visibility: hidden;
    background-color: #333;
    color: #fff;
    border-radius: 6px;
    width: fit-content;
    transition: .5s;
    &::after{
        content: '';
        border: 6px solid #333;
        border-right-color: transparent;
        border-left-color: transparent;
        border-bottom: none;
        position: absolute;
        top: 100%;
        right: 50%;
    }
    position: absolute;
    z-index: 1000;
}
</style>