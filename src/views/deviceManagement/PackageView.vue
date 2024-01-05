
<script setup>
import { ref } from "vue"
import { inject } from "vue"

import BigCard from "@/components/BigCard.vue";
import InefiVirtualTable from "@/components/InefiVirtualTable.vue";
import axios from 'axios'

const loading = ref(true)
const packageData = ref([])
const prefixURL = inject('prefixURL');
let url = `${prefixURL}/data/package.json`
async function getDataAPI() {
    packageData.value = []
    loading.value = true
    try {
        let res = await axios.get(url)
        loading.value = false
        let data = res.data.result
        data.forEach((item) => { item.lastupdate = convertUnixTimestamp(item.lastupdate) })
        packageData.value = data
    } catch (error) {
        console.log(error);
    }

}
getDataAPI()

let tableProps = [
    {
        columnName: "Name",
        dataKey: "packageLabel",
        slotName: "name",
        width: 25,
        minWidth: "200px",
    },
    {
        columnName: "OS",
        dataKey: "os",
        width: "120px",
        minWidth: "120px",
        slotName: "os"
    },
    {
        columnName: "Command",
        dataKey: "command",
        width: 25,
        minWidth: "200px",
    },
    {
        columnName: "Last Modified",
        dataKey: "lastupdate",
        width: 25,
        minWidth: "150px",
        slotName: "updateTime"
    },
    {
        columnName: "",
        dataKey: "remove",
        slotName: "remove",
        width: "50px",
        minWidth: "50px",
    },
]
const openIndex = ref(0)
function dropdownChoose(index){
    console.log(index);
    openIndex.value = index
}
// const dropdownToggle = ref(false)
// function dropDownChange(value){
//     console.log(value);
//     dropdownToggle.value = value
// }

//轉換時間
function convertUnixTimestamp(timestamp) {
    const date = new Date(timestamp * 1000); // 乘以1000轉換成毫秒
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是從0開始的，需要+1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    return formattedDate;
}
</script>
<template>
    <div class="layout-content">
        <div class="btn-prim mt-3 px-3 py-2 mb-3 mb-sm-4 ms-3 ms-sm-0 package_btn" style="font-size: 16px;">
            <font-awesome-icon icon="fa-solid fa-file-lines" size="lg" />
            <span class="ms-2">Create New Package</span>
        </div>
        <BigCard>
            <div class="layout-content">
                <!-- <el-scrollbar>
                    <template v-for="n in 100" :key="n">
                            <div style="height: 50px;">
                                <el-dropdown trigger="click">
                                    <div class="d-flex justify-content-center align-items-center" style="height: 50px;">
                                        <button @click="dropdownChoose(index)"><font-awesome-icon icon="fa-solid fa-ellipsis" /></button>
                                    </div>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item>
                                                <font-awesome-icon icon="fa-solid fa-trash" color="#29BFED"/>
                                                <span class="ms-2">Remove</span>
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </div>
                        </template>
                </el-scrollbar> -->
                <InefiVirtualTable :items="packageData" :item-size="40" :loading="loading" key-field="id" :tableProps="tableProps" :hover="true" :sortable="true" @reload="getDataAPI">
                    <template #name="{ item }">
                        <a href="#" class="color_prim" @click.prevent>{{ item.packageLabel }}</a>
                    </template>
                    <template #remove="{index}">
                        <!-- <el-dropdown trigger="click" @visible-change="dropDownChange">
                            <div class="d-flex justify-content-center align-items-center" style="height: 20px;">
                                <button @click="dropdownChoose(index)"><font-awesome-icon icon="fa-solid fa-ellipsis" /></button>
                            </div>
                            <template #dropdown v-if="dropdownToggle && openIndex == index">
                                <el-dropdown-menu>
                                    <el-dropdown-item>
                                        <font-awesome-icon icon="fa-solid fa-trash" color="#29BFED"/>
                                        <span class="ms-2">Remove</span>
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown> -->
                        <div class="d-flex justify-content-center align-items-center" style="height: 20px;">
                                <button @click="dropdownChoose(index)"><font-awesome-icon icon="fa-solid fa-ellipsis" /></button>
                            </div>
                    </template>
                </InefiVirtualTable>
            
            </div>
        </BigCard>
    </div>
</template>
<style lang="scss">
@import "@/assets/scss/all.scss";

.package_btn {
    span {
        font-size: 16px;
    }
}
</style>