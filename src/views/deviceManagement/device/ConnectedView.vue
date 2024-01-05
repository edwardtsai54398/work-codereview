<script setup>
import {computed} from "vue"
import {ref, inject} from "vue"
import {useStore} from "vuex"
const store = useStore()
import axios from "axios"
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

//filter+batchLoad
const batchLoad = ref(true)
const loading = ref(false)
const filterResult = ref([])
async function reload(params){
    console.log(params);
    batchLoad.value = false
    loading.value = true
    let datas = await getFilterAPI(params)
    console.log(datas);
    filterResult.value = datas.list
    loading.value = false
}
function clearFilter(){
    batchLoad.value = true
}
const prefixURL = inject('prefixURL');
async function getFilterAPI(params){
    let url = `${prefixURL}/data/devices/connected.json`
    try {
        let res = await axios.get(url)
        let datas = res.data.result
        datas.list = datas.list.filter((data)=>data[params.type].toUpperCase() == params.value.toUpperCase())
        return datas

    }catch(error){
        console.log(error);
    }
}
</script>
<template>
    <InefiVirtualTable key-field="deviceId" :item-size="50" :filter="true" :tableProps="tableProps" 
    tableName="connected" :filterOptions="filterOptions" :columnsExcept="columnsExcept" activeTab="Connected"
    :batchLoad="batchLoad" :getDataLen="30" :URL="url" 
    :customColumns="true"
    @reload="reload" :loading="loading" @clearFilter="clearFilter" :items="filterResult">

    </InefiVirtualTable>
        
</template>