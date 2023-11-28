<script setup>
import { ArrowRight } from "@element-plus/icons-vue";
import { ArrowRightBold } from "@element-plus/icons-vue";
import { Search } from "@element-plus/icons-vue";
import { ref } from "vue";
import { reactive } from "vue";
import { watch } from "vue";
import axios from "axios";


const searchType = ref("");
const searchText = ref("");
const searchInputFocus = ref(false);
const treeDrawerOpen = ref(true);
const searchOverlayOpen = ref(false);


const groupTreeData = ref([]);
// let url = 'https://fakestoreapi.com/products/1'
let url = "/data/group_tree.json";
function getTreeData() {
    axios
        .get(url)
        .then((res) => {
            let inefiData = res.data;
            groupTreeData.value = [...orgnizeTreeData(inefiData.result)];
        })
        .catch((err) => {
            console.log(err);
        });
}

function orgnizeTreeData(data) {
    data.forEach((item) => {
        item.slaveGroupName = item.masterGroupName;
        item.slaveGroupUUID = item.masterGroupUUID;
        item.slaveGroupId = item.masterGroupId;
    });

    return data;
}

getTreeData();
const defaultProps = reactive({
    label: "slaveGroupName",
    children: "subgroup",
});

//一進來先抓store.state.checkSlaveGroupId
//找不到群組跳通知
import store from "@/store";
import { ElMessage } from "element-plus";

const treeRef = ref();

let group = store.state.checkSlaveGroup;

setTimeout(() => {
    if (group !== "") {
        let node = treeRef.value.getNode(group.slaveGroupId);
        console.log("setTimeout", node);
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

watch(treeRef, () => {
    treeDrawerOpen.value = false;
});
setTimeout(() => {
    groupTreeData.value.forEach((group) => {
        let node = treeRef.value.getNode(group.slaveGroupId);
        groupChildren.push(node);
    });
}, 2);
//node變化
const breadCrumbList = reactive([]);
const groupChildren = reactive([]);
const deviceResult = ref([]);
const currentNode = ref("");

function showNodeData(node) {
    breadCrumbList.length = 0;
    clearResult();
    if (node.nodeSlaveGroupId) {
        console.log(node.nodeSlaveGroupId);
        node = treeRef.value.getNode(node.nodeSlaveGroupId);
        console.log(node);
    } else if (node.device) {
        deviceResult.value = node.device;
        let id = node.breadCrumb[node.breadCrumb.length - 1].slaveGroupId;
        console.log(id);
        node = treeRef.value.getNode(id);
    }

    function pushBreadcrumb(node) {
        if (node.level === 0) return;
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
        if (node.data.devices) {
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
    expandTree(node);
    if (node.level !== 0) {
        currentNode.value = node.data;
    }
}

//搜尋群組
const searchResult = ref([]);
function searchGroupData(treeData, parentItem = []) {
    let results = [];

    if (Array.isArray(treeData)) {
        treeData.forEach((item) => {
            if (searchType.value === "device") {
                let items = { breadCrumb: [...parentItem, item] };
                if (item.subgroup) {
                    const subResult = searchGroupData(
                        item.subgroup,
                        items.breadCrumb
                    );
                    results.push(...subResult);
                } else if (item.devices) {
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
    currentNode.value = "";
}

//虛擬化表格
const columns = reactive([
    {
        title: "Status",
        dataIndex: "deviceState"
    },
    {
        title: "Device Name",
        dataIndex: "deviceName"
    },
    {
        title: "Label",
        dataIndex: "aliasName"
    },
    {
        title: "Enrolled Status",
        dataIndex: "deviceState"
    }
])
</script>
<template>
    <div class="groupPWA layout-content">
        <div class="search_overlay layout-content" :class="{ open: searchOverlayOpen }">
            <div class="search_bar p-3 ps-2 d-flex align-items-center border-b">
                <button class="me-2 px-2" @click="searchOverlayOpen = false">
                    <font-awesome-icon icon="fa-solid fa-chevron-left" size="lg" />
                </button>
                <el-input v-model="searchText" class="w-100" size="large" placeholder="" :prefix-icon="Search" @input="searchGroupData(groupTreeData)" @focus="searchInputFocus = true" @blur="searchInputFocus = false">
                    <template #prepend>
                        <el-select v-model="searchType" placeholder="群組" style="width: 115px" @change="clearResult">
                            <el-option label="群組" value="group" />
                            <el-option label="裝置" value="device" />
                        </el-select>
                    </template>
                </el-input>
            </div>
            <div class="layout-content search_result">
                <div class="p-4 text-center" v-if="searchText !== '' && searchResult.length == 0">
                    查無資料
                </div>
                <el-scrollbar>
                    <ul class="list-unstyled px-2" v-if="searchText !== '' && searchResult.length > 0">
                        <li v-for="(item, index) in searchResult" :key="index" class="p-3 border-b">
                            <a href="" @click.prevent="showNodeData(item); searchOverlayOpen = false">
                                <template v-if="searchType !== 'device'">
                                    <div class="d-flex align-items-center">
                                        <span class="me-2">
                                            <font-awesome-icon icon="fa-solid fa-folder" size="xl" />
                                        </span>
                                        <el-breadcrumb :separator-icon="ArrowRight">
                                            <el-breadcrumb-item v-for="crumb in item.breadCrumb" :key="crumb.slaveGroupId">
                                                <template v-slot:default>
                                                    <span :class="{
                                                        highLight:
                                                            crumb.slaveGroupId ===
                                                            item.nodeSlaveGroupId,
                                                    }">
                                                        {{ crumb.slaveGroupName }}
                                                    </span>
                                                </template>
                                            </el-breadcrumb-item>
                                        </el-breadcrumb>
                                    </div>
                                </template>
                                <template v-else-if="searchType === 'device'">
                                    <span class="highLight">{{
                                        item.device.deviceName
                                    }}</span>
                                </template>
                            </a>
                        </li>
                    </ul>
                </el-scrollbar>
            </div>
        </div>
        <div class="quick_btn_group">
            <button @click="treeDrawerOpen = !treeDrawerOpen" class="active_folder">
                <font-awesome-icon icon="fa-solid fa-list" size="lg" />
            </button>
            <button class="refresh_btn p-1 active_folder mt-4">
                <font-awesome-icon icon="fa-solid fa-arrows-rotate" />
            </button>
        </div>
        <div class="d-flex px-3 py-2 pe-2 border-b align-items-center bread_crumb">
            <el-scrollbar>
                <div class="d-flex align-items-center">
                    <font-awesome-icon icon="fa-solid fa-house" size="lg" />
                    <div class="ms-3">
                        <el-breadcrumb :separator-icon="ArrowRight">
                            <el-breadcrumb-item v-for="item in breadCrumbList" :key="`path-${item}`">
                                <a href="" @click.prevent="showNodeData(item)">{{ item.data.slaveGroupName }}</a>
                            </el-breadcrumb-item>
                        </el-breadcrumb>
                    </div>
                </div>
            </el-scrollbar>
            <button class="ms-3 px-3 py-1" @click="searchOverlayOpen = true">
                <font-awesome-icon icon="fa-solid fa-magnifying-glass" size="lg" />
            </button>
            <el-popover placement="bottom" trigger="click">
                <template #reference>
                    <button class="px-3 py-1">
                        <font-awesome-icon icon="fa-solid fa-ellipsis-vertical" size="lg" />
                    </button>
                </template>
                <div class="border-b d-flex flex-column mb-3">
                    <span class="ps-2 mb-3">Create Group</span>
                    <span class="ps-2 mb-3">Add Device</span>
                </div>
                <div class="border-b d-flex flex-column mb-3">
                    <span class="ps-2 mb-3">Rename</span>
                    <span class="ps-2 mb-3">Remove</span>
                </div>
                <div class="border-b d-flex flex-column mb-3">
                    <span class="ps-2 mb-3">Assign Package</span>
                    <span class="ps-2 mb-3">Assign Profile</span>
                    <span class="ps-2 mb-3">Assign Media</span>
                </div>
                <div class="d-flex flex-column">
                    <span class="ps-2">Reboot</span>
                </div>
            </el-popover>
        </div>
        <div class="d-flex ps-2 pe-3 py-2 align-items-center file_name" v-if="breadCrumbList.length > 0">
            <button class="px-3 py-1" v-if="currentNode !== ''" @click="
                showNodeData(
                    breadCrumbList[breadCrumbList.length - 1].parent
                )
                ">
                <font-awesome-icon icon="fa-solid fa-chevron-left" />
            </button>
            <span class="ms-2 flex-grow-1">{{ currentNode.slaveGroupName }}</span>
        </div>
        <div class="layout-content">
            <el-scrollbar class="d-none">
                <div class="px-2">
                    <div class="d-flex py-3 px-2 border-b align-items-center" v-for="item in groupChildren" :key="item.data.slaveGroupId" @click="showNodeData(item)">
                        <font-awesome-icon icon="fa-solid fa-folder" size="lg" />
                        <div class="w-50 ms-3">
                            {{ item.data.slaveGroupName }}
                        </div>
                        <div class="devide-line-v"></div>
                        <div class="w-50"></div>
                        <font-awesome-icon icon="fa-solid fa-chevron-right" />
                    </div>
                    <p class="py-3 text-center" v-if="groupChildren.length === 0">
                        無群組資料
                    </p>
                </div>
            </el-scrollbar>
            <s-table :columns="columns" :data-source="deviceResult"></s-table>
        </div>
        <el-drawer v-model="treeDrawerOpen" direction="btt" :show-close="false" :with-header="false" class="drawer_pwa px-3" modal-class="drawer_pwa_overlay" size="80%">
            <el-scrollbar max-height="100%">
                <el-tree :data="groupTreeData" :props="defaultProps" ref="treeRef" :highlight-current="true" :expand-on-click-node="false" :check-on-click-node="true" node-key="slaveGroupId" :icon="ArrowRightBold">
                    <template #default="{ node }">
                        <label class="d-flex align-items-center w-100" @click="
                            showNodeData(node);
                        treeDrawerOpen = !treeDrawerOpen;
                        ">
                            <font-awesome-icon icon="fa-solid fa-folder" size="xl" v-show="!node.expanded" />
                            <font-awesome-icon icon="fa-solid fa-folder-open" size="xl" v-show="node.expanded" />
                            <span class="ms-2" :class="{
                                highLight: currentNode === node.data,
                            }">{{ node.label }}</span>
                        </label>
                    </template>
                </el-tree>
            </el-scrollbar>
        </el-drawer>

    </div>
</template>
<style lang="scss" scoped>
@import "@/assets/scss/all.scss";

.groupPWA {
    background-color: #fff;
}

.search_overlay {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    height: 100%;
    width: 100%;
    background-color: #fff;
    opacity: 0;
    visibility: hidden;
    transition: .5s;

    &.open {
        opacity: 1;
        visibility: visible;

    }
}

.quick_btn_group {
    position: fixed;
    z-index: 1;
    bottom: 30px;
    right: 30px;
    display: flex;
    flex-direction: column;

    button {
        display: block;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background-color: #fff;
        box-shadow: 0px 0px 8px 5px rgba(90, 90, 90, 0.1);
        display: flex;
        justify-content: center;
        align-items: center;
    }
}

.refresh_btn {
    background-color: #fff;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    box-shadow: 0px 0px 8px 5px rgba(90, 90, 90, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
}

.bread_crumb {
    border-bottom: 3px solid #eee;

    .el-breadcrumb {
        width: 100%;
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
    }

    .el-scrollbar {
        flex-grow: 1;
    }

    .el-scrollbar__view {
        height: 100%;
        display: flex;
        align-items: center;
    }
}

.drawer_pwa_overlay {
    background-color: transparent;
}

.drawer_pwa {
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

.el-tree-node__content {
    padding: 8px 0;
    height: fit-content;

    .el-icon {
        padding: 8px;
        padding-right: 12px;
    }
}

.highLight {
    font-weight: 700;
    color: $primary;
    cursor: pointer;
}

.device {
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

.splitpanes__splitter {
    background-color: #fa0;
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
    min-width: 2px;

    &::before {
        left: -4px;
        right: -4px;
        height: 100%;
        width: 400%;
    }
}

.splitpanes--horizontal>.splitpanes__splitter {
    min-height: 2px;

    &::before {
        top: -4px;
        bottom: -4px;
        width: 100%;
        height: 400%;
    }
}
</style>
