<script setup>
import { ArrowRight } from "@element-plus/icons-vue";
import { Search } from "@element-plus/icons-vue";
import { Plus } from "@element-plus/icons-vue";
import { FolderAdd } from "@element-plus/icons-vue";
import { EditPen } from "@element-plus/icons-vue";
import { Delete } from "@element-plus/icons-vue";

import BigCard from "@/components/BigCard.vue";
import BtnComponent from "@/components/BtnComponent.vue";
import IconBtn from "@/components/IconBtn.vue";
import IconCircleBtn from "@/components/IconCircleBtn.vue";
import InefiVirtualTable from "@/components/InefiVirtualTable.vue";
import ColumnController from "@/components/ColumnController.vue";
import { nextTick, ref, reactive, watch, onBeforeUnmount } from "vue";
import { onMounted } from "vue";
import { computed } from "vue";
import axios from "axios";
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";

const searchType = ref("");
const searchText = ref("");
const searchInputFocus = ref(false);
const searchInputOpen = ref(false);
const treeDrawerOpen = ref(false);

const groupTreeData = ref([]);
let url = "/data/group_tree.json";
// let url = "/data/group_tree_moreData.json";
const getTreeData = async () => {
    try {
        const res = await axios.get(url);
        let inefiData = res.data;
        groupTreeData.value = [...orgnizeTreeData(inefiData.result)];
    } catch (err) {
        console.log(err);
    }
}

function orgnizeTreeData(data) {
    data.forEach((item) => {
        item.slaveGroupName = item.masterGroupName;
        item.slaveGroupUUID = item.masterGroupUUID;
        item.slaveGroupId = item.masterGroupId;
    });

    return data;
}

onMounted(() => {

    getTreeData();
})
const defaultProps = reactive({
    label: "slaveGroupName",
    children: "subgroup",
});

//一進來先抓store.state.checkSlaveGroupId
//找不到群組跳通知
import store from "@/store";
// import {useRouter} from 'vue-router'
// const router = useRouter()
import { ElMessage } from "element-plus";

const treeRef = ref();
const treeRefMobile = ref();

let group = store.state.groupHealth.checkSlaveGroup;

setTimeout(() => {
    if (group !== "") {
        let node = treeRef.value.getNode(group.slaveGroupId);
        if (!node) {
            ElMessage({
                message: `找不到群組${node.data.slaveGroupName}`,
                type: "warning",
            });
        } else {
            showNodeData(node);
        }
    }
}, 1);
setTimeout(() => {
    treeDrawerOpen.value = false;
}, 10);
//node變化
const breadCrumbList = reactive([]);
const groupChildren = reactive([]);
const deviceResult = ref([]);
const currentNode = ref({});
function showNodeData(node, ref = "") {
    breadCrumbList.length = 0;
    clearResult();
    if (ref === "mobile") {
        node = treeRef.value.getNode(node.data.slaveGroupId);
    }

    let triggerIsDevice = false
    if (node.nodeSlaveGroupId) {
        node = treeRef.value.getNode(node.nodeSlaveGroupId);
    } else if (node.device) {
        triggerIsDevice = true
        deviceResult.value = [node.device];
        let id = node.breadCrumb[node.breadCrumb.length - 1].slaveGroupId;
        node = treeRef.value.getNode(id);
    }

    function pushBreadcrumb(node) {
        let parentNode = node.parent;
        breadCrumbList.push(node);
        if (parentNode.level === 0) {
            breadCrumbList.reverse();
        } else {
            pushBreadcrumb(parentNode);
        }
    }
    pushBreadcrumb(node);

    function setGroupChildren(node) {
        groupChildren.length = 0;
        if (node.childNodes.length) {
            node.childNodes.forEach((child) => {
                groupChildren.push(child);
            });
        }
        if (node.data.devices && !triggerIsDevice) {
            deviceResult.value = node.data.devices;
        }
    }
    setGroupChildren(node);

    //展開node
    function expandTree(node) {
        if (node.level !== 0) {
            node.parent.expanded = true;
            expandTree(node.parent);
        }
    }
    if (ref === "" && windowWidth.value < 576) {
        node = treeRefMobile.value.getNode(node.data.slaveGroupId);
    }
    expandTree(node);
    currentNode.value = node.data;
    scrollbarToRight();
}

//搜尋群組
const searchResult = ref([]);
function searchGroupData(treeData, parentItem = []) {
    let results = [];

    if (Array.isArray(treeData)) {
        treeData.forEach((item) => {
            if (searchType.value === "device") {
                let items = { breadCrumb: [...parentItem, item] };
                if (item.devices) {
                    const deviceResult = item.devices.filter((device) => {
                        return device.deviceName
                            .toLowerCase()
                            .includes(searchText.value.toLowerCase());
                    });
                    if (deviceResult.length) {
                        let Items = [];
                        deviceResult.forEach((device) => {
                            let item = { breadCrumb: [] };
                            item.breadCrumb = items.breadCrumb;
                            item.device = device;
                            Items.push(item);
                        });
                        results.push(...Items);
                    }
                }
                if (item.subgroup) {
                    const subResult = searchGroupData(
                        item.subgroup,
                        items.breadCrumb
                    );
                    results.push(...subResult);
                }
            } else {
                let items = { breadCrumb: [...parentItem, item] };
                if (
                    item.slaveGroupName
                        .toLowerCase()
                        .includes(searchText.value.toLowerCase())
                ) {
                    items.nodeSlaveGroupId = item.slaveGroupId;
                    results.push(items);
                }
                if (item.subgroup) {
                    const subResult = searchGroupData(
                        item.subgroup,
                        items.breadCrumb
                    );
                    results.push(...subResult);
                }
            }
        });
    }
    if (parentItem.length > 0) {
        return results;
    } else {
        searchResult.value = results;
    }
}

function clearResult() {
    searchResult.value = [];
    searchText.value = "";
    deviceResult.value = [];
    currentNode.value = {};
}


const breadCrumbScrollbar = ref();
function scrollbarToRight() {
    nextTick(() => {
        let scrollWidth = breadCrumbScrollbar.value.wrapRef.scrollWidth;
        let scrollShowWidth = breadCrumbScrollbar.value.wrapRef.clientWidth;
        let scrollLeft = scrollWidth - scrollShowWidth;
        breadCrumbScrollbar.value.scrollTo({ left: scrollLeft });
    });
}

//device list
// let deviceTableProps = [
//     {
//         columnName: "Status",
//         dataKey: "status",
//         width: 10,
//         minWidth: '80px',
//         fixed: true,
//     },
//     {
//         columnName: "Device Name",
//         dataKey: "deviceName",
//         width: 40,
//         minWidth: '200px',
//     },
//     {
//         columnName: "Label",
//         dataKey: "aliasName",
//         width: 30,
//         minWidth: '150px',
//     },
//     {
//         columnName: "Enrolled Status",
//         dataKey: "deviceState",
//         width: 20,
//         minWidth: '130px'
//     }
// ]
let deviceTableProps = [
    {
        // columnName: "Status",
        columnName: "1",
        dataKey: "status",
        width: 10,
        // minWidth: '80px',
        fixed: true,
        show: true
    },
    {
        // columnName: "Device Name",
        columnName: "2",
        dataKey: "deviceName",
        // width: 40,
        width: 10,
        // minWidth: '200px',
        fixed: true,
        show: true
    },
    {
        // columnName: "Label",
        columnName: "3",
        dataKey: "aliasName",
        // width: 30,
        width: 10,
        // minWidth: '150px',
        fixed: true,
        show: true
    },
    {
        // columnName: "Enrolled Status",
        columnName: "4",
        dataKey: "deviceState",
        // width: 20,
        width: 10,
        // minWidth: '130px'
        fixed: true,
    },
    {
        columnName: "5",
        dataKey: "deviceState",
        width: 10,
        show: true
    },
    {
        columnName: "6",
        dataKey: "deviceState",
        width: 10,
        show: true
    },
    {
        columnName: "7",
        dataKey: "deviceState",
        width: 10,
        show: false
    },
    {
        columnName: "8",
        dataKey: "deviceState",
        width: 10,
        show: true
    },
    {
        columnName: "9",
        dataKey: "deviceState",
        width: 10,
        show: false
    },
    {
        columnName: "10",
        dataKey: "deviceState",
        width: 10,
        show: true
    },
]
const deviceListTableName = ref("deviceListTable")
const deviceTooltipContent = ref('Double click to edit.')

const devicesChecked = ref([])
const deviceListTable = ref()
function getDeviceCheckedData() {
    devicesChecked.value = deviceListTable.value.getCheckedData()
}
function canEdit(event, id) {
    // console.log(event);
    let triggerDeviceDOM = document.getElementById(id);
    let deviceDOMs = document.querySelectorAll(`.label`);
    deviceDOMs.forEach((DOM) => {
        DOM.classList.remove("can_edit");
    });
    if (event === "click") {
        triggerDeviceDOM.classList.add("can_edit");
    }
}
//手機版長按編輯標籤
const touchTimer = ref(null);
const touchTime = 800;
function thisTouchStart(index) {
    touchstart();
    watch(touchTimer, (newVal) => {
        if (newVal === "longpress") {
            canEdit("click", index);
        }
    });
}
function touchstart() {
    touchTimer.value = setTimeout(() => {
        touchTimer.value = "longpress";
    }, touchTime);
}
function clearTouchTimer() {
    clearTimeout(touchTimer.value);
    touchTimer.value = null;
}


//add device
const addDeviceDialogOpen = ref(false)
const searchAddDeviceText = ref("")
const activeTab = ref(0)
const addDeviceCheckedList = ref([])
const hasNoDeviceChecked = computed(()=>{return addDeviceCheckedList.value.length==0})
const addDeviceTabs = reactive([
    {
        name: "UNASSIGNED",
        addAmount: 0
    },
    {
        name: "INACTIVE",
        addAmount: 0
    }
])
function addDeviceCheck(data){
    addDeviceCheckedList.value = data
}
function addDeviceAllOrganize(groupdata = []) {
    let allResult = []
    if (groupdata.length > 0) {

        allResult = groupdata.find((group) => group.slaveGroupName === addDeviceTabs[activeTab.value].name)
    }
    if (allResult.devices) {
        allResult = allResult.devices
    }
    addDeviceAllResult.value = allResult

}
watch(groupTreeData, (newVal) => {
    addDeviceAllOrganize(newVal)
})
watch(activeTab, () => {
    addDeviceAllOrganize(groupTreeData.value)
    if (searchAddDeviceText.value !== "") {
        searchDevice()
    }
})
const addDeviceAllResult = ref([])
function searchDevice() {
    addDeviceSearchResult.value = addDeviceAllResult.value.filter((device) => {
        return searchAddDeviceText.value.toUpperCase().includes(device.deviceName.toUpperCase())
    })
}
const addDeviceSearchResult = ref(addDeviceAllResult)

const addDeviceTooltipName = ref()
function setTooltipName(e){
    addDeviceTooltipName.value = e.target.innerText
}

//RWD
const windowWidth = ref(window.innerWidth);
const mobileSize = ref(576);
window.addEventListener("resize", watchWindowWidth);
function watchWindowWidth() {
    windowWidth.value = window.innerWidth;
    isMoblieGroupChildren();
}
function isMoblieGroupChildren() {
    breadCrumbList.length = 0;
    groupChildren.length = 0;
    if (windowWidth.value < mobileSize.value) {
        // console.log(groupTreeData.value);
        groupTreeData.value.forEach((group) => {
            let node = treeRef.value.getNode(group.slaveGroupId);
            // console.log(node);``
            groupChildren.push(node);
        });
    }
}
setTimeout(watchWindowWidth, 1);
onBeforeUnmount(() => {
    window.removeEventListener("resize", watchWindowWidth);
});

const searchPopoverWidth = ref(400);
watch(windowWidth, () => {
    if (windowWidth.value < mobileSize.value) {
        searchPopoverWidth.value = windowWidth.value - 20;
    }
});


//batchLoad
const getDataLen = ref(30)
const URL = ref(`/data/batchload/`)
const testResult = computed(() => {
    let allData = JSON.parse(JSON.stringify(store.state.scrollBatchLoad.allData))
    let emptyLength = allData.filter((data) => !data.deviceId).length
    let emptyStartIndex = allData.findIndex((data) => !data.deviceId)
    allData.splice(emptyStartIndex, emptyLength)
    return allData
})


let testTableProps = [
    {
        columnName: "DeviceName",
        dataKey: "deviceName",
        width: 50,
        // fixed:true
    },
    {
        columnName: "ID",
        dataKey: "deviceId",
    },
]

</script>
<template>
    <div class="layout-content">
        <div class="group_function_bar d-flex align-items-center mb-sm-3 px-3 py-1 p-sm-0">
            <el-scrollbar class="d-sm-none" ref="breadCrumbScrollbar" v-show="!searchInputOpen">
                <div class="bread_crumb d-flex align-items-center d-sm-none">
                    <IconBtn iconClass="fa-solid fa-house" @click="isMoblieGroupChildren" />
                    <el-breadcrumb :separator-icon="ArrowRight" class="ms-2">
                        <el-breadcrumb-item v-for="item in breadCrumbList" :key="`path-${item}`">
                            <a href="" class="text-nowrap" @click.prevent="showNodeData(item)">{{ item.data.slaveGroupName }}</a>
                        </el-breadcrumb-item>
                    </el-breadcrumb>
                </div>
            </el-scrollbar>
            <IconCircleBtn iconClass="fa-solid fa-arrows-rotate" class="order-sm-2 ms-sm-auto d-none d-sm-block" />
            <div class="order-sm-3 d-flex justify-content-end align-items-center">
                <IconBtn class="d-sm-none" iconClass="fa-solid fa-magnifying-glass" @click="searchInputOpen = true" v-show="!searchInputOpen" />
                <IconBtn class="d-sm-none" iconClass="fa-solid fa-xmark" @click="searchInputOpen = false" v-show="searchInputOpen" />
                <div class="search-input ms-sm-3" :class="{ open: searchInputOpen }">
                    <el-popover :width="searchPopoverWidth" :visible="searchInputFocus && searchText !== ''" popper-class="search_result">
                        <template #reference>
                            <el-input v-model="searchText" size="large" placeholder="Please Input" :prefix-icon="Search" @input="searchGroupData(groupTreeData)" @focus="searchInputFocus = true" @blur="searchInputFocus = false">
                                <template #prepend>
                                    <el-select v-model="searchType" placeholder="群組" style="width: 115px" @change="clearResult" size="large">
                                        <el-option label="群組" value="group" />
                                        <el-option label="裝置" value="device" />
                                    </el-select>
                                </template>
                            </el-input>
                        </template>
                        <div class="layout-content overflow-auto" style="max-height: 50vh">
                            <div class="p-4 text-center" v-if="searchResult.length == 0">
                                查無資料
                            </div>
                            <ul class="list-unstyled m-0" v-if="searchResult.length > 0">
                                <li v-for="(item, index) in searchResult" :key="index" class="px-2">
                                    <a href="" class="py-3 border-b d-flex align-items-center" @click.prevent="showNodeData(item); searchInputOpen = false;">
                                        <template v-if="searchType !== 'device'">
                                            <span class="me-2">
                                                <font-awesome-icon icon="fa-solid fa-folder" class="active" size="lg" />
                                            </span>
                                            <div>
                                                <span class="active">{{ item.breadCrumb[item.breadCrumb.length - 1].slaveGroupName }}</span>
                                                <p class="m-0">
                                                    <el-breadcrumb :separator-icon="ArrowRight">
                                                        <el-breadcrumb-item v-for="crumb in item.breadCrumb" :key="crumb.slaveGroupId">
                                                            <template v-slot:default>
                                                                <span class="fs-7">{{ crumb.slaveGroupName }}</span>
                                                            </template>
                                                        </el-breadcrumb-item>
                                                    </el-breadcrumb>
                                                </p>
                                            </div>
                                        </template>
                                        <template v-else-if="searchType === 'device'">
                                            <span class="highLight">{{ item.device.deviceName }}</span>
                                        </template>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </el-popover>
                </div>
            </div>
            <div class="action-btn order-sm-1 felx-shirnk-0 me-sm-3">
                <el-dropdown trigger="click" placement="bottom-start">
                    <div>
                        <div class="d-none d-sm-block">
                            <BtnComponent content="Action" iconClass="fa-solid fa-caret-right" iconSize="lg" />
                        </div>
                        <div class="d-block d-sm-none">
                            <IconBtn iconClass="fa-solid fa-ellipsis-vertical" />
                        </div>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item :icon="FolderAdd">
                                <span>Create New Group</span>
                            </el-dropdown-item>
                            <el-dropdown-item :icon="Plus" @click="addDeviceDialogOpen = true">
                                <span>Add Device</span>
                            </el-dropdown-item>
                            <el-dropdown-item :icon="EditPen" divided>
                                <span>Rename Group</span>
                            </el-dropdown-item>
                            <el-dropdown-item :icon="Delete">
                                <span>Remove Group</span>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <el-dialog v-model="addDeviceDialogOpen" top="auto" width="60%" class="pop_dialog" :show-close="false">
                    <template #header>
                        <span class="fs-4">Add Device</span>
                    </template>
                    <div class="layout-content" style="min-height:400px;max-height:700px">
                        <div class="adddevice-searchbar row px-4">
                            <div class="col-6 col-sm-8">
                                <p>Select device and add to <span class="fw-bold">{{ currentNode.slaveGroupName }}</span></p>
                            </div>
                            <div class="col-6 col-sm-4">
                                <div class="d-flex align-items-center">
                                    <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
                                    <el-input class="ms-3" v-model="searchAddDeviceText" placeholder="Search" @input="searchDevice" />
                                </div>
                            </div>
                        </div>
                        <ul class="custom-tabs mb-2">
                            <li class="custom-tab" v-for="(item, index) in addDeviceTabs" :key="index" :class="{ 'active': activeTab == index }" @click="activeTab = index">
                                <span class="me-2">{{ item.name }}</span>
                                <span class="adddevice-tab__number py-2 px-1">{{ item.addAmount }}</span>
                            </li>
                        </ul>
                        <div class="device-result w-100 py-2 px-3 layout-content">
                            <InefiVirtualTable ref="deviceTable" :item-size="54" 
                            :table-props="testTableProps" :items="testResult" key-field="deviceId" 
                            :openIfEllipsis="true" tooltipRef="deviceName" :tooltipContent="addDeviceTooltipName" tooltipTrigger="click"
                            @tooltipOpen="setTooltipName" :tooltipModel="addDeviceDialogOpen"
                            :getDataLen="getDataLen" :batchLoad="true" :URL="URL" :showCheckBox="true"
                            @haveCheckedData="addDeviceCheck"/>
                        </div>
                    </div>

                    <template #footer>
                        <el-button @click="addDeviceDialogOpen = false">Cancel</el-button>
                        <el-button class="ms-3" :type="!hasNoDeviceChecked ? 'primary' : 'info'" @click="getDeviceCheckedData" :disabled="hasNoDeviceChecked">
                            Go
                        </el-button>
                    </template>
                </el-dialog>
            </div>
        </div>
        <BigCard class="flex-row layout-content">
            <template v-slot:content>
                <el-drawer v-model="treeDrawerOpen" direction="btt" :show-close="false" :with-header="false" class="tree_drawer px-3" modal-class="tree_drawer_overlay" size="80%">
                    <el-scrollbar class="py-3 ps-2">
                        <el-tree :data="groupTreeData" :props="defaultProps" ref="treeRefMobile" :highlight-current="true" :expand-on-click-node="false" :check-on-click-node="true" node-key="slaveGroupId">
                            <template #default="{ node }">
                                <label class="d-flex align-items-center w-100" @click="
                                    showNodeData(node, 'mobile');
                                treeDrawerOpen = false;
                                ">
                                    <font-awesome-icon icon="fa-solid fa-folder" v-show="!node.expanded" />
                                    <font-awesome-icon icon="fa-solid fa-folder-open" v-show="node.expanded" />
                                    <span class="ms-2" :class="{
                                        highLight:
                                            currentNode.slaveGroupId ===
                                            node.data.slaveGroupId,
                                    }">{{ node.label }}</span>
                                </label>
                            </template>
                        </el-tree>
                    </el-scrollbar>
                </el-drawer>
                <splitpanes>
                    <pane class="d-none d-sm-block" min-size="20" max-size="35">
                        <el-scrollbar class="py-3 ps-2">
                            <el-tree :data="groupTreeData" :props="defaultProps" ref="treeRef" :highlight-current="true" :expand-on-click-node="false" :check-on-click-node="true" node-key="slaveGroupId">
                                <template #default="{ node }">
                                    <label class="d-flex align-items-center w-100" @click="showNodeData(node)">
                                        <font-awesome-icon icon="fa-solid fa-folder" v-show="!node.expanded" />
                                        <font-awesome-icon icon="fa-solid fa-folder-open" v-show="node.expanded" />
                                        <span class="ms-2" :class="{
                                            highLight:
                                                currentNode.slaveGroupId ===
                                                node.data.slaveGroupId,
                                        }">{{ node.label }}</span>
                                    </label>
                                </template>
                            </el-tree>
                        </el-scrollbar>
                    </pane>
                    <pane>
                        <div class="layout-content">
                            <div class="d-none d-sm-flex py-2 px-2 border-b align-items-center">
                                <IconBtn iconClass="fa-solid fa-house" />
                                <div class="ms-2">
                                    <el-breadcrumb :separator-icon="ArrowRight">
                                        <el-breadcrumb-item v-for="item in breadCrumbList" :key="`path-${item}`">
                                            <a href="" @click.prevent="showNodeData(item)">{{ item.data.slaveGroupName }}</a>
                                        </el-breadcrumb-item>
                                    </el-breadcrumb>
                                </div>
                            </div>
                            <div class="layout-content">
                                <splitpanes horizontal>
                                    <pane>
                                        <div class="layout-content">
                                            <div class="list-refresh border-b px-3 d-sm-none d-flex justify-content-end">
                                                <IconBtn iconClass="fa-solid fa-list" active @click="
                                                    treeDrawerOpen = true
                                                    " />
                                                <IconBtn iconClass="fa-solid fa-refresh" active />
                                            </div>
                                            <div class="row p-3 border-b d-none d-sm-flex">
                                                <div class="col-6">
                                                    <span>群組名稱</span>
                                                </div>
                                                <div class="col-6">
                                                    <span>環境設定</span>
                                                </div>
                                            </div>
                                            <div class="layout-content">
                                                <el-scrollbar max-height="100%">
                                                    <ul class="p-0">
                                                        <li class="row border-b py-2 py-sm-3 p-sm-2" v-for="(item, index) in groupChildren" :key="index" @click="showNodeData(item)">
                                                            <div class="col-12 col-sm-6 d-flex align-items-center ps-4">
                                                                <font-awesome-icon class="active" icon="fa-solid fa-folder" size="2xl" />
                                                                <div class="ms-2 p-sm-0">
                                                                    <span class="active">{{ item.data.slaveGroupName }}</span>
                                                                    <div class="d-sm-none d-flex align-items-end">
                                                                        <span class="fs-7">
                                                                            環境設定:
                                                                            <span class="fs-7" v-if="item.data.profiles">{{ item.data.profiles[0].assignedProfileName }}</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="col-sm-6 d-none d-sm-block" v-if="item.data.profiles">
                                                                {{ item.data.profiles[0].assignedProfileName }}
                                                            </div>
                                                        </li>
                                                    </ul>
                                                    <div class="d-flex p-3 justify-content-center" v-if="groupChildren.length ===
                                                        0
                                                        ">
                                                        無群組資料
                                                    </div>
                                                </el-scrollbar>
                                            </div>
                                        </div>
                                    </pane>
                                    <pane>
                                        <div class="layout-content">
                                            <div class="header border-b p-3 d-flex align-items-center justify-content-between">
                                                <span class="d-sm-none fs-4">裝置</span>
                                                <div class="operate d-flex align-items-center flex-grow-1">
                                                    <div class="" :style="{ color: devicesChecked.length == 0 ? '#d6d6d6' : '' }">
                                                        <font-awesome-icon icon="fa-solid fa-folder" />
                                                        <span class="ms-2">移動</span>
                                                    </div>
                                                    <div class="ms-4" :style="{ color: devicesChecked.length == 0 ? '#d6d6d6' : '' }">
                                                        <font-awesome-icon icon="fa-solid fa-trash" />
                                                        <span class="ms-2">刪除</span>
                                                    </div>
                                                    <div class="ms-auto">
                                                        <ColumnController :tableNameRef="deviceListTableName"/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="layout-content">
                                                <InefiVirtualTable ref="deviceListTable" :item-size="50" :table-props="deviceTableProps" 
                                                :items="deviceResult" key-field="deviceId" :showCheckBox="true"
                                                tooltipTrigger="hover" :tooltipContent="deviceTooltipContent" tooltipRef="aliasName"
                                                @haveCheckedData="getDeviceCheckedData" @noCheckedData="devicesChecked = []"
                                                :table-name="deviceListTableName">
                                                    <template #aliasName="{item}">
                                                        <div class="label px-2" :id="item.deviceId" @dblclick="canEdit('click', item.deviceId)" @touchstart="thisTouchStart(item.deviceId)" 
                                                            @touchmove="clearTouchTimer" @touchend="clearTouchTimer">
                                                            <div class="alias_name">{{ item.aliasName }}</div>
                                                            <div class="alias_input">
                                                                <el-input v-model="item.aliasName" @blur="canEdit('blur')" size="small" />
                                                            </div>
                                                        </div>
                                                    </template>
                                                    <template #deviceState="{item}">
                                                        {{ item.deviceState === "REGISTERED" ? "已註冊" : "未註冊" }}
                                                    </template>
                                                </InefiVirtualTable>
                                            </div>
                                        </div>
                                    </pane>
                                </splitpanes>
                            </div>
                        </div>
                    </pane>
                </splitpanes>
            </template>
        </BigCard>
    </div>
</template>
<style lang="scss">
@import "@/assets/scss/all.scss";

.group_function_bar {
    background-color: #fff;
    border-bottom: 3px solid #eee;

    .el-scrollbar {
        flex-grow: 1;
    }

    .el-scrollbar__view {
        height: 100%;
        display: flex;
        align-items: center;
    }
}

@include bstrp(sm) {
    .group_function_bar {
        background-color: transparent;
        border-bottom: none;
    }
}

.custom-tabs {
    display: flex;
    margin: 0;
    padding-left: 0;
}

.custom-tab {
    padding: 10px 20px;
    font-size: 24px;
    list-style: none;
    cursor: pointer;
    position: relative;

    span {
        text-transform: uppercase;
    }

    &::before {
        content: '';
        display: block;
        width: 100%;
        height: 4px;
        position: absolute;
        bottom: 0;
        left: 0;
    }

    &.active {
        &::before {
            background-color: $primary;
        }
    }
}

.adddevice-tab__number {
    background-color: #efefef;
    border-radius: 4px;
}

.search-input {
    width: 0;
    overflow: hidden;

    // transition: 0.5s;
    &.open {
        width: 100%;
        overflow: auto;
    }
}

.el-input-group__prepend {
    background-color: #fff;
    color: #aaa;
}

@include bstrp(sm) {
    .search-input {
        width: 350px;
        // max-width: 350px;
        min-width: 250px;

        &.open {
            width: 350px;
            // max-width: 350px;
            min-width: 250px;
        }
    }
}

.bread_crumb {
    .el-breadcrumb {
        width: 100%;
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
    }
}

.tree_drawer_overlay {
    background-color: rbga(100, 100, 100, 0.1);
}

.tree_drawer {
    background-color: transparent;
    box-shadow: 0px 0px 0px 0px transparent;
    overflow: visible;
    height: 80%;

    .el-drawer__body {
        background-color: #fff;
        border-top-left-radius: 30px;
        border-top-right-radius: 30px;
        box-shadow: 5px 0px 8px 5px rgba(90, 90, 90, 0.1);
    }
}

.highLight {
    font-weight: 700;
    color: $primary;
    cursor: pointer;
}

.label {
    width: 100%;
    height: 100%;
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

.bigcard-component {
    .splitpanes__splitter {
        background-color: #eee;
        position: relative;

        &::before {
            content: "";
            display: block;
            position: absolute;
            left: 0;
            top: 0;
            transition: opacity 0.4s;
            background-color: rgba(0, 0, 0, 0.3);
            opacity: 0;
            z-index: 0;
        }

        &:hover {
            &::before {
                opacity: 1;
            }
        }
    }

    .splitpanes--vertical>.splitpanes__splitter {
        min-width: 6px;
        border-right: 1px solid #ccc;
        border-left: 1px solid #ccc;

        &::before {
            left: -4px;
            right: -4px;
            height: 100%;
            width: 230%;
        }
    }

    .splitpanes--horizontal>.splitpanes__splitter {
        min-height: 12px;
        border-top: 1px solid #ccc;
        border-bottom: 1px solid #ccc;

        &::before {
            top: -4px;
            bottom: -4px;
            width: 100%;
            height: 230%;
        }
    }

    .splitpanes--vertical>.splitpanes__splitter {
        display: none;
    }
}

@include bstrp(sm) {
    .bigcard-component {
        .splitpanes--vertical>.splitpanes__splitter {
            display: block;
        }

        .splitpanes--horizontal>.splitpanes__splitter {
            min-height: 6px;
        }
    }
}

.vue-recycle-scroller__slot {
    position: sticky;
    z-index: 10;
    top: 0;
    background-color: #fff;
}
</style>
