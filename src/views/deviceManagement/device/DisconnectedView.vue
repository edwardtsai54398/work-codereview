<script setup>
import InefiVirtualTable from "@/components/InefiVirtualTable.vue";
const url = "/data/devices/enrolled.json"
const tableProps = [
    {
        columnName: "Status",
        dataKey: "healthStatus",
        slotName: "status",
        width: "65px",
        minWidth: "65px",
    },
    {
        columnName: "Device Name",
        dataKey: "deviceName",
        width: 20,
        minWidth: "210px"
    },
    {
        columnName: "Label",
        dataKey: "aliasName",
        slotName: "label",
        width: 15,
        minWidth: "160px"
    },
    {
        columnName: "OS",
        dataKey: "os",
        slotName: "os",
        width: "150px",
        minWidth: "150px",
    },
    {
        columnName: "Model",
        dataKey: "model",
        width: 15,
        minWidth: "140px"
    },
    {
        columnName: "SN",
        dataKey: "serialNumber",
        width: 20,
        minWidth: "150px"
    },
    {
        columnName: "Agent Version",
        dataKey: "agentVer",
        width: "110px",
        minWidth: "130px",
    },
    {
        columnName: "Last Connect",
        dataKey: "timestamp",
        width: "150px",
        minWidth: "150px",
    },
]
</script>
<template>
    <InefiVirtualTable key-field="deviceId" :item-size="50" :filter="true" :tableProps="tableProps" 
    :activeTab="activeTabName" :filterOptions="filterOptions" 
    :batchLoad="true" :getDataLen="getDataLen" :URL="url" 
    @loaded="loaded" :customColumns="true" />
        
</template>