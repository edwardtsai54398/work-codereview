<script setup>
import { useAttrs, computed } from 'vue'
// import { ref, inject } from 'vue'
import {useStore} from "vuex"
const store = useStore()
import InefiVirtualTable from "@/components/InefiVirtualTable.vue";
const url = computed(()=>store.state.scrollBatchLoad.enrollUrl)

const attrs = useAttrs()
const TableProps = attrs.tableProps
let FilterOptions = attrs.filterOptions
const ColumnsExcept = attrs.columnsExcept
FilterOptions[0].options.length=1
//filter+batchLoad
// import axios from "axios"
// const batchLoad = ref(true)
// const loading = ref(false)
// const filterResult = ref([])
// async function reload(params){
//     batchLoad.value = false
//     loading.value = true
//     let datas = await getFilterAPI(params)
//     filterResult.value = datas.list
//     loading.value = false
// }
// function clearFilter(){
//     batchLoad.value = true
// }
// const prefixURL = inject('prefixURL');
// async function getFilterAPI(params){
//     let url = `${prefixURL}/data/devices/enrolled.json`
//     try {
//         let res = await axios.get(url)
//         let datas = res.data.result
//         datas.list = datas.list.filter((data)=>data[params.type].toUpperCase() == params.value.toUpperCase())
//         return datas

//     }catch(error){
//         console.log(error);
//     }
// }
function reload(params){
    console.log(params);
    // url.value = `/data/devices/enrolledWindow.json`
}
</script>
<template>
    <InefiVirtualTable key-field="deviceId" :item-size="50" :filter="true" :tableProps="TableProps"
        tableName="enrolled" :filterOptions="FilterOptions" :columnsExcept="ColumnsExcept" activeTab="Enrolled"
        :batchLoad="true" :getDataLen="50" :URL="url" :customColumns="true" 
        @reload="reload"/>
</template>