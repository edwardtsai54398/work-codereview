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
    :activeTab="activeTabName" :filterOptions="filterOptions" 
    :batchLoad="true" :getDataLen="getDataLen" :URL="url" 
    @loaded="loaded" :customColumns="true" />
        
</template>