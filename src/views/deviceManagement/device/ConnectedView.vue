<script setup>
import {computed} from "vue"
import {useStore} from "vuex"
const store = useStore()
import InefiVirtualTable from "@/components/InefiVirtualTable.vue";
const url = computed(()=>store.state.scrollBatchLoad.connectUrl)


import { useAttrs } from 'vue'
const attrs = useAttrs()
const {tableProps, filterOptions, columnsExcept} = attrs

// function canEdit(event, id) {
//     // console.log(event);
//     let triggerDeviceDOM = document.getElementById(id);
//     let deviceDOMs = document.querySelectorAll(`.label`);
//     deviceDOMs.forEach((DOM) => {
//         DOM.classList.remove("can_edit");
//     });
//     if (event === "click") {
//         triggerDeviceDOM.classList.add("can_edit");
//     }
// }

//手機版長按編輯標籤
// const touchTimer = ref(null);
// const touchTime = 800;
// function thisTouchStart(index) {
//     touchstart();
//     watch(touchTimer, (newVal) => {
//         if (newVal === "longpress") {
//             canEdit("click", index);
//         }
//     });
// }
// function touchstart() {
//     touchTimer.value = setTimeout(() => {
//         touchTimer.value = "longpress";
//     }, touchTime);
// }
// function clearTouchTimer() {
//     clearTimeout(touchTimer.value);
//     touchTimer.value = null;
// }
</script>
<template>
    <InefiVirtualTable key-field="deviceId" :item-size="50" :filter="true" :tableProps="tableProps" 
    tableName="connected" :filterOptions="filterOptions" :columnsExcept="columnsExcept" activeTab="Connected"
    :batchLoad="true" :getDataLen="30" :URL="url" 
    :customColumns="true" />
        
</template>