<script setup>
// import { ref } from "vue"
import { reactive } from "vue"
// import { computed } from "vue"
// import {watch} from "vue"
import {useStore} from "vuex"
const store = useStore()

import BigCard from "@/components/BigCard.vue";
import TabsComponent from "@/components/TabsComponent.vue";
// import InefiVirtualTable from "@/components/InefiVirtualTable.vue";

const tabs = reactive([
    {
        name: "Enrolled",
        route: "enrolled",
        amount: 0
    },
    {
        name: "Connected",
        route: "connected",
        amount: 0
    },
    {
        name: "Disconnected",
        route: "disconnected",
        amount: 0
    },
])
// const activeTab = ref(0)
// const activeTabName = computed(() => { return tabs[activeTab.value].name.toLowerCase() })
// function getActiveTab(tab) {
//     activeTab.value = tab
// }

//table
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
// const columnsExcept = [
//     {
//         tab: "Enrolled",
//         except: ["Status", "Label", "Last Connect"]
//     },
//     {
//         tab: "Disconnected",
//         except: ["Status"]
//     },
// ]
// const filterOptions = [
//     {
//         dataKey: "os",
//         typeName: "OS",
//         options: [
//             {
//                 value: "WINDOWS",
//                 valName: "Windows"
//             },
//             {
//                 value: "ANDROID",
//                 valName: "Android"
//             },
//             {
//                 value: "LINUX",
//                 valName: "Linux"
//             },
//         ]
//     }
// ]

//batchLoad
// const getDataLen = computed(() => { return activeTabName.value === "enrolled" ? 50 : 30 })
// const url = computed(() => {
//     let fileName = activeTabName.value
//     return `/data/devices/${fileName}.json`
// })


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
// //手機版長按編輯標籤
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

// const firstBatchLoaded = ref(false)
// function loaded(){
//     firstBatchLoaded.value = true
// }

</script>
<template>
    <BigCard>
        <div class="border-b">
            <TabsComponent :tabs="tabs" @change="getActiveTab" class="device_tabs">
                <template #tab="{ item }">
                    <span>{{ item.name }}</span>
                    <span class="number ms-2 px-2 py-1" v-if="firstBatchLoaded">
                        {{ store.state.scrollBatchLoad.enrolled[item.name.toLowerCase()] }}
                    </span>
                </template>
            </TabsComponent>
        </div>
        <div class="layout-content">
            <router-view v-slot="{Component}">
                <keep-alive>
                    <component :is="Component" :view-props="tableProps"/>
                </keep-alive>
            </router-view>
            <!-- <InefiVirtualTable key-field="deviceId" :item-size="50" :filter="true" 
            :tableProps="tableProps" :columnsExcept="columnsExcept" :activeTab="activeTabName" 
            :batchLoad="true" :getDataLen="getDataLen" :URL="url" :filterOptions="filterOptions"
            tooltipTrigger="hover" tooltipContent="Double click to edit." tooltipRef="aliasName"
            @loaded="loaded" :customColumns="true">
                <template #status="{ item }">
                    <div class="d-flex w-100 align-items-center justify-content-center">
                        <div class="status_dot" :class="{
                            err: item.healthStatus === 'ERROR',
                            good: item.healthStatus === 'GOOD'
                        }"></div>
                    </div>
                </template>
                <template #label="{ item }">
                    <div class="label" :id="item.deviceId" @dblclick="canEdit('click', item.deviceId)" 
                        @touchstart.passive="thisTouchStart(item.deviceId)" @touchmove.passive="clearTouchTimer" @touchend.passive="clearTouchTimer">
                        <span class="alias_name">{{ item.aliasName }}</span>
                        <span class="alias_input">
                            <el-input v-model="item.aliasName" @blur="canEdit('blur')" size="small" />
                        </span>
                    </div>
                </template>
            </InefiVirtualTable> -->
        </div>

    </BigCard>
</template>
<style lang="scss">
@import "@/assets/scss/all.scss";
.device_tabs{
    *{
        font-size: 16px;
    }
    .number{
        @extend .fw-bold;
        border-radius: 4px;
        color: #737373;
        background-color: #ddd;
    }
    .custom-tab.active{
        .number{
            color: $primary;
            background-color: #c9effa;
        }
    }
}
.status_dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;

    &.err {
        background-color: $danger;
    }

    &.good {
        background-color: $success;
    }

}
.label {
    width: 100%;
    min-height: 24px;
    display: flex;
    align-items: center;

    .alias_name {
        display: block;
    }

    .alias_input {
        display: none;
    }

    &.can_edit {
        .alias_name {
            display: none;
        }

        .alias_input {
            display: block;
        }
    }
}
</style>