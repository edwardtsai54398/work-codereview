<script setup>
import { ref } from "vue"
import { reactive } from "vue"
import { onActivated } from "vue"
// import { onMounted } from "vue"
// import {onBeforeUnmount} from "vue"
import {useStore} from "vuex"
import {useRouter} from "vue-router"
const store = useStore()
const router = useRouter()

import BigCard from "@/components/BigCard.vue";
import TabsComponent from "@/components/TabsComponent.vue";



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
const columnsExcept = [
    {
        tab: "Enrolled",
        except: ["Status", "Label", "Last Connect"]
    },
    {
        tab: "Disconnected",
        except: ["Status"]
    },
]
const filterOptions = [
    {
        dataKey: "os",
        typeName: "OS",
        options: [
            {
                value: "WINDOWS",
                valName: "Windows"
            },
            {
                value: "ANDROID",
                valName: "Android"
            },
            {
                value: "LINUX",
                valName: "Linux"
            },
        ]
    }
]

const firstBatchLoaded = ref(false)
function loaded(){
    firstBatchLoaded.value = true
}

//切換tab
const tabs = reactive([
    {
        name: "Enrolled",
        route: "enrolled",
    },
    {
        name: "Connected",
        route: "connected",
    },
    {
        name: "Disconnected",
        route: "disconnected",
    },
])
function changeTable(index){
    let route = tabs[index].route
    router.push(`/deviceManagement/device/${route}`)
}

const tableTab = ref()
onActivated(()=>{
    tableTab.value.goTab(0)
})

</script>
<template>
    <BigCard>
        <div class="border-b">
            <TabsComponent :tabs="tabs" class="device_tabs" @change="changeTable" ref="tableTab">
                <template #tab="{ item }">
                    <div class="d-flex align-items-center w-100 justify-content-center">
                        <span>{{ item.name }}</span>
                        <span class="number ms-2 px-2 py-1" v-if="firstBatchLoaded">
                            {{ store.state.scrollBatchLoad.totalDeviceCount
                            [item.name.toLowerCase() == "enrolled" ? "total" : item.name.toLowerCase()] }}
                        </span>
                    </div>
                </template>
            </TabsComponent>
        </div>
        <div class="layout-content">
            <router-view v-slot="{ Component }">
                <keep-alive :include="store.state.keepAlive.include">
                    <component :is="Component" :tableProps="tableProps" :columnsExcept="columnsExcept"
                :filterOptions="filterOptions" @loaded="loaded"/>
                </keep-alive>
            </router-view>
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