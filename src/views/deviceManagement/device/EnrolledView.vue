<script setup>
import { useAttrs, computed } from 'vue'
import {useStore} from "vuex"
const store = useStore()
import InefiVirtualTable from "@/components/InefiVirtualTable.vue";
const url = computed(()=>store.state.scrollBatchLoad.enrollUrl)

const attrs = useAttrs()
const TableProps = attrs.tableProps
const FilterOptions = attrs.filterOptions
const ColumnsExcept = attrs.columnsExcept

</script>
<template>
    <InefiVirtualTable key-field="deviceId" :item-size="50" :filter="true" :tableProps="TableProps"
        tableName="enrolled" :filterOptions="FilterOptions" :columnsExcept="ColumnsExcept" activeTab="Enrolled"
        :batchLoad="true" :getDataLen="50" :URL="url"
        :customColumns="true" />
</template>