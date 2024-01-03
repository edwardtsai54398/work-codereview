<script setup>
import { ref, watch } from "vue";
import {inject} from "vue"
import CardComponent from "@/components/CardComponent.vue";
import { Refresh } from "@element-plus/icons-vue";
import axios from "axios";

const prefixURL = inject('prefixURL');
let groupTreeUrl = `${prefixURL}/data/group_tree.json`;
let groupHealthUrl = `${prefixURL}/data/group_health_moniter.json`;
const groupTreeData = ref([]);

axios
    .get(groupTreeUrl)
    .then((res) => {
        let inefiData = res.data;
        groupTreeData.value = [...orgnizeTreeData(inefiData.result)];
    })
    .catch((err) => {
        console.log(err);
    });

function orgnizeTreeData(data) {
    data.forEach((item) => {
        item.slaveGroupName = item.masterGroupName;
        item.slaveGroupUUID = item.masterGroupUUID;
        item.slaveGroupId = item.masterGroupId;
    });

    return data;
}

const groupHealthMointor = ref([]);
axios.get(groupHealthUrl).then((res) => {
    groupHealthMointor.value = res.data.result;
});

//找出所有被監測的群組，並統計狀態數量(total - disconneted - inactive - OOB)

//找出有被監測的群組，回傳這些群組
const groupWatchedList = ref([]);
const groupBeenDeleted = ref([]);
watch([groupHealthMointor, groupTreeData], ([newVal1, newVal2]) => {
    let groupWatchedFounded = findGroupWatched(newVal1, newVal2);
    //如果有被刪除的監看群組，發通知
    // if (groupWatchedFounded.length !== newVal1.length) {
    //     findGroupDeleted(newVal1, groupWatchedFounded);
    // } else {
    //     groupWatchedList.value = groupWatchedFounded;
    // }
    groupWatchedList.value = groupWatchedFounded;
});
function findGroupWatched(monitorData = [], groupTree = []) {
    let watchedList = [];

    let mainResult = groupTree.filter((group) => {
        if (group.subgroup) {
            let subResult = findGroupWatched(monitorData, group.subgroup);
            watchedList.push(...subResult);
        }
        let isMatch = monitorData.some((monitor) => {
            if (monitor.groupUUID === group.slaveGroupUUID) {
                group.titleOfDeviceHealthGroup =
                    monitor.titleOfDeviceHealthGroup;
                group.idOfDeviceHealthGroup = monitor.idOfDeviceHealthGroup;
            }
            return monitor.groupUUID === group.slaveGroupUUID;
        });

        return isMatch;
    });

    watchedList.push(...mainResult);
    return watchedList;
}
// function findGroupDeleted(monitorData = [], groupFounded = []) {
//     let groupDeletedList = [];
//     monitorData.forEach((monitor) => {
//         let isExist = groupFounded.some(
//             (group) => monitor.groupUUID === group.slaveGroupUUID
//         );
//         if (!isExist) {
//             groupDeletedList.push(monitor);
//         }
//     });
//     if (groupDeletedList.length) {
//         groupBeenDeleted.value = groupDeletedList;
//         groupDeletedDialogVisible.value = true;
//     }
// }
//確認刪除對話框
const groupDeletedDialogVisible = ref(false);
const userConfirmGroupDeleted = ref(false);
function confirmGroupDeleted() {
    userConfirmGroupDeleted.value = true;
    groupDeletedDialogVisible.value = false;
    groupBeenDeleted.value.forEach((group) => {
        console.log(`發送API delete groupUUID: ${group.groupUUID}`);
    });
}
watch(userConfirmGroupDeleted, (newVal) => {
    if (newVal) {
        groupWatchedList.value = findGroupWatched(
            groupHealthMointor.value,
            groupTreeData.value
        );
    }
});

//計算群組devices的connected的狀態數量，新增內容並回傳
const healthAllResult = ref([]);
watch(groupWatchedList, (newVal) => {
    healthAllResult.value = calcDevicesConnectedAmount(newVal);
});
function calcDevicesConnectedAmount(watchedList = []) {
    watchedList.forEach((group) => {
        group.devicesStatus = {
            total: 0,
            good: 0,
            warn: 0,
            error: 0,
            unknown: 0,
        };
        if (group.devices) {
            let watchSuccesList = group.devices.filter((device) => {
                return (
                    device.deviceState === "REGISTERED" &&
                    device.healthStatus !== "DISCONNECTED" &&
                    device.healthStatus !== "OOB" &&
                    device.isConnected === true
                );
            });
            if (watchSuccesList.length === 0) {
                group.devices = [];
            }
            let deviceGood = watchSuccesList.filter((device) => {
                return device.healthStatus === "GOOD";
            });
            let deviceWarn = watchSuccesList.filter((device) => {
                return device.healthStatus === "WARN";
            });
            let deviceError = watchSuccesList.filter((device) => {
                return device.healthStatus === "ERROR";
            });
            let deviceUnknown = watchSuccesList.filter((device) => {
                return device.healthStatus === "UNKNOWN";
            });
            group.devicesStatus.total = watchSuccesList.length;
            group.devicesStatus.good = deviceGood.length;
            group.devicesStatus.warn = deviceWarn.length;
            group.devicesStatus.error = deviceError.length;
            group.devicesStatus.unknown = deviceUnknown.length;
        } else {
            group.devices = [];
        }
    });
    return watchedList;
}

//計算監看群組的健康度
function calcGroupHealthScore(groupStatus) {
    let score = (groupStatus.good / groupStatus.total) * 100;
    return score;
}
function calcGroupHealthStatus(groupStatus) {
    let score = calcGroupHealthScore(groupStatus);
    let healthStatus = "";
    if (score > 70) {
        healthStatus = "GOOD";
    } else if (score < 70 && score > 30) {
        healthStatus = "WARNING";
    } else if (score < 30) {
        healthStatus = "ERROR";
    }
    return healthStatus;
}

//點狀態出現裝置名稱
const statusDialogTitle = ref("");
const statusDialogDevices = ref([]);
const statusDialogVisible = ref(false);
const showDevicesInfo = (statusKey, devices = []) => {
    statusDialogVisible.value = true;
    let checkDevicesList = devices.filter(
        (device) => device.healthStatus === statusKey.toUpperCase()
    );
    statusDialogDevices.value = checkDevicesList;
    if (statusKey === "good") {
        statusDialogTitle.value = "良好";
    } else if (statusKey === "warn") {
        statusDialogTitle.value = "警告";
    } else if (statusKey === "error") {
        statusDialogTitle.value = "錯誤";
    } else if (statusKey === "unknown") {
        statusDialogTitle.value = "未知";
    }
};

//點群組資料夾跳轉到群組管理頁的特定群組
import { useRouter } from "vue-router";
const router = useRouter();
import { useStore } from "vuex";
const store = useStore();
function toManagePageGroup(group) {
    store.commit("groupHealth/setCheckSlaveGroupId", group);
    router.path = "/deviceManagement/group";
}
</script>

<template>
    <div class="layout-content px-4 py-3">
        <el-dialog v-model="groupDeletedDialogVisible" width="200px" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false" :align-center="true">
            <template #header>
                <p class="mb-2">被刪除的群組</p>
            </template>
            <p class="mb-2" v-for="group in groupBeenDeleted" :key="group.groupUUID">
                {{ group.titleOfDeviceHealthGroup }}
            </p>
            <template #footer>
                <el-button type="info" @click="confirmGroupDeleted">
                    確認
                </el-button>
            </template>
        </el-dialog>
        <div class="header py-3 d-flex justify-content-between align-items-center">
            <div class="title d-flex align-items-center">
                <h3 class="mb-0 me-3 fw-bold">群組健康度</h3>
                <el-button :icon="Refresh" size="large" circle />
            </div>
        </div>
        <div class="layout-content">
            <el-scrollbar>
                <div class="row m-0">
                    <div class="col-12 mt-3" v-for="item in healthAllResult" :key="item.slaveGroupId">
                        <CardComponent class="p-3 w-100">
                            <template v-slot:content>
                                <div class="health_outer_layout d-flex">
                                    <div class="row flex-grow-1 ps-2 pb-2">
                                        <div class="col-12 col-xxl-2 mb-4 ms-2 ps-xxl-3 m-xxl-0">
                                            <div class="row h-100 flex-wrap">
                                                <div class="col-6 col-md-4 col-xxl-12">
                                                    <div class="h-100 d-flex align-items-center">
                                                        {{item.titleOfDeviceHealthGroup}}
                                                    </div>
                                                </div>
                                                <div class="col-6 col-md-4 col-xxl-12">
                                                    <div class="d-flex align-items-center active_folder h-100">
                                                        <font-awesome-icon icon="fa-solid fa-folder" />
                                                        <router-link to="/deviceManagement/group" class="ms-2 highLight" @click="toManagePageGroup(item)">
                                                            {{item.slaveGroupName}}
                                                        </router-link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-12 col-lg-8 col-xl-7 col-xxl-5 device-amount mb-4 mb-lg-0">
                                            <div class="d-flex flex-column flex-md-row align-items-md-center h-100">
                                                <div class="total-device align-items-center align-items-md-start align-items-xl-center mb-2 mb-md-0 ms-xl-3 ms-xxl-0">
                                                    <div class="title">
                                                        總連線裝置
                                                    </div>
                                                    <div class="amount">
                                                        {{item.devicesStatus.total}}
                                                    </div>
                                                </div>
                                                <div class="device-status justify-content-evenly p-1 p-lg-2 ms-md-3 ms-xl-5">
                                                    <template v-for="(status, key) in item.devicesStatus" :key="status">
                                                        <div class="status p-2" v-if="key !== 'total'" @click="showDevicesInfo(key, item.devices)">
                                                            <div class="status_name mb-2" :class="[
                                                                { good: key === 'good' },
                                                                { warn: key === 'warn' },
                                                                { error: key === 'error' },
                                                                { unknown: key === 'unknown' },
                                                            ]">
                                                                <div class="dot"></div>
                                                                <span class="ms-2" v-if="key === 'good'">良好</span>
                                                                <span class="ms-2" v-if="key === 'warn'">警告</span>
                                                                <span class="ms-2" v-if="key === 'error'">錯誤</span>
                                                                <span class="ms-2" v-if="key === 'unknown'">未知</span>
                                                            </div>
                                                            <div class="amount">
                                                                {{ status }}
                                                            </div>
                                                        </div>
                                                    </template>
                                                    <el-dialog v-model="statusDialogVisible
                                                        " width="400px" :align-center="true" class="pop_message" :show-close="false">
                                                        <template #header>
                                                            <div class="title fw-bold p-3">
                                                                {{ statusDialogTitle }}
                                                            </div>
                                                        </template>
                                                        <div class="layout-content p-3">
                                                            <div class="row border-b p-2">
                                                                <div class="col-6">
                                                                    名稱
                                                                </div>
                                                                <div class="col-6">
                                                                    標籤
                                                                </div>
                                                            </div>
                                                            <template v-if="statusDialogDevices.length">
                                                                <div class="row border-b p-2" v-for="row in statusDialogDevices" :key="row.nodeId">
                                                                    <div class="col-6">
                                                                        {{ row.deviceName }}
                                                                    </div>
                                                                    <div class="col-6">
                                                                        {{ row.aliasName }}
                                                                    </div>
                                                                </div>
                                                            </template>
                                                            <div class="p-2 text-center" v-else-if="statusDialogDevices.length === 0">
                                                                無裝置資料
                                                            </div>
                                                        </div>
                                                        <template #footer>
                                                            <el-button type="info" @click="statusDialogVisible = false">關閉</el-button>
                                                        </template>
                                                    </el-dialog>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-12 col-lg-4 col-xl-5">
                                            <div class="row align-items-center ps-3 ps-md-0 h-100">
                                                <div class="col-6 col-md-8 col-lg-12 col-xl-5 mb-lg-4 mb-xl-0">
                                                    <div class="device_health">
                                                        <h4 class="mb-0">
                                                            群組健康度
                                                        </h4>
                                                        <span class="mt-3 fw-bold" v-if="item.devices
                                                            .length ===
                                                            0
                                                            ">
                                                            沒有裝置
                                                        </span>
                                                        <span class="mt-3 fw-bold" v-else-if="item.devices
                                                            .length
                                                            " :class="[
        {
            good:
                calcGroupHealthScore(
                    item.devicesStatus
                ) > 70,
        },
        {
            warn:
                calcGroupHealthScore(
                    item.devicesStatus
                ) <
                70 &&
                calcGroupHealthScore(
                    item.devicesStatus
                ) > 30,
        },
        {
            error:
                calcGroupHealthScore(
                    item.devicesStatus
                ) < 30,
        },
    ]">
                                                            {{
                                                                calcGroupHealthStatus(
                                                                    item.devicesStatus
                                                                )
                                                            }}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div class="col-6 col-md-4 col-lg-12 col-xl-6">
                                                    <div class="health_score">
                                                        <font-awesome-icon icon="fa-solid fa-folder" size="2xl" />
                                                        <div class="score p-3 ms-3 fw-bold" v-if="item.devices
                                                                    .length ===
                                                                0
                                                                ">
                                                            沒有裝置
                                                        </div>
                                                        <div class="score number p-3 ms-3 fw-bold" v-else-if="item.devices
                                                            .length
                                                            " :class="[
        {
            good:
                calcGroupHealthScore(
                    item.devicesStatus
                ) > 70,
        },
        {
            warn:
                calcGroupHealthScore(
                    item.devicesStatus
                ) <
                70 &&
                calcGroupHealthScore(
                    item.devicesStatus
                ) > 30,
        },
        {
            error:
                calcGroupHealthScore(
                    item.devicesStatus
                ) < 30,
        },
    ]">
                                                            {{
                                                                calcGroupHealthScore(
                                                                    item.devicesStatus
                                                                )
                                                            }}%
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="more_oparate px-0 px-xxl-2 justify-content-start justify-content-md-center">
                                        <div class="icon">
                                            <span></span><span></span><span></span>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </CardComponent>
                    </div>
                </div>
            </el-scrollbar>
        </div>
    </div>
</template>
<style lang="scss">
@import "@/assets/scss/all.scss";
$delete-icon-size: 24px;
$gray-bgc: #efefef;

.more_oparate {
    display: flex;
    flex-direction: column;

    .icon {
        background-color: $gray-bgc;
        width: $delete-icon-size;
        height: $delete-icon-size;
        border-radius: 50%;
        display: flex;
        justify-content: space-evenly;
        align-items: center;

        &:hover {
            cursor: pointer;
        }

        span {
            display: block;
            width: 3px;
            height: 3px;
            background-color: #555;
            border-radius: 50%;
        }
    }
}

.total-device {
    display: flex;
    flex-direction: column;
    justify-content: center;

    .title {
        font-size: 16px;
    }

    .amount {
        font-size: 30px;
    }
}

.device-status {
    display: flex;
    gap: 16px;
    align-items: center;
    background-color: $gray-bgc;
    border-radius: 4px;
}

.status {
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 8px;

    .amount {
        font-size: 16px;
    }

    &:hover {
        cursor: pointer;
        background-color: darken($gray-bgc, 5%);
    }
}

$succces: rgb(35, 217, 151);
$warn: rgb(255, 218, 7);
$danger: red;
$unknown: #666;

.status_name {
    display: flex;
    align-items: center;

    .dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
    }

    &.good {
        .dot {
            background-color: $succces;
        }

        span {
            color: $succces;
        }
    }

    &.warn {
        .dot {
            background-color: $warn;
        }

        span {
            color: $warn;
        }
    }

    &.error {
        .dot {
            background-color: $danger;
        }

        span {
            color: $danger;
        }
    }

    &.unknown {
        .dot {
            background-color: $unknown;
        }
    }
}

.device_health {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;

    h4 {
        font-size: 14px;
    }

    span {
        font-size: 24px;
    }
}

.health_score {
    display: flex;
    align-items: center;
    height: 100%;
}

.score {
    width: 100px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: $gray-bgc;
    font-size: 16px;

    &.number {
        font-size: 24px;
    }
}

.good {
    color: $succces;
}

.warn {
    color: $warn;
}

.error {
    color: $danger;
}

.el-dialog__header {
    padding: 0;
    margin-right: 0;
}

.el-dialog__body {
    padding: 0;
}

.el-overlay {
    background-color: rgba(0, 0, 0, 0.2);
}

.pop_message {
    border-radius: 24px;
    width: 400px;
    max-height: 400px;
    background-color: #fff;
    overflow: hidden;

    .title {
        color: #fff;
        font-size: 20px;
        background: linear-gradient(to left, $primary 30%, #75d6f4);
    }
}
</style>
