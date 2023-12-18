<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import { onBeforeMount } from 'vue'
import { computed } from 'vue'
import { watch } from 'vue'
import { defineProps } from 'vue'
import { useStore } from 'vuex'
const store = useStore()
const props = defineProps({
    tableNameRef: {
        type: String,
        default: "inefiVirtualTable"
    },//對應要控制的tablem元件的字串
    direction: {
        type: String,
        default: "rtl"
    },//drawer方向
    panelSize: {
        type: Number || String,
        default: 300
    }
})

const panelOpen = ref(false)

//切換頁面tab
const activeTab = computed(() => {
    return [props.tableNameRef] in store.state.columnControl.activeTab ? store.state.columnControl.activeTab[props.tableNameRef] : undefined
})

const columnList = computed(() => {
    let columnListRefernce = store.state.columnControl.tables[props.tableNameRef] ? store.state.columnControl.tables[props.tableNameRef] : []
    if (activeTab.value) {
        columnListRefernce = store.state.columnControl.tables[props.tableNameRef][activeTab.value]
    }
    return columnListRefernce
})

const columnNoFixed = computed(() => {
    return columnList.value.filter((column) => !column.fixed)
})
const columnNoShow = computed(() => {
    return columnList.value.filter((column) => !column.show)
})
function switchShow(columnName) {
    store.commit("columnControl/setColumnShow", {
        tableName: props.tableNameRef,
        columnName,
    })
    saveCustomColumnsSetting()
}
import draggable from 'vuedraggable'
const drag = ref(false)
const dragOptions = computed(() => {
    return {
        animation: 250,
        handle: ".dragHandle",
        sort: true
    }
})
function Onchange(e) {
    if (e.moved) {
        store.commit("columnControl/setMovedNewOrder", {
            tableName: props.tableNameRef,
            e: e.moved
        })

    } else if (e.added) {
        store.commit("columnControl/setAddedNewOrder", {
            tableName: props.tableNameRef,
            e: e.added
        })
    }
    saveCustomColumnsSetting()
}

//欄位全部顯示
function showAllColumns() {
    store.commit("columnControl/setAllColumnsShow", {
        tableName: props.tableNameRef
    })
    saveCustomColumnsSetting()
}
//欄位回到初始設定
function resetColumn() {
    store.commit("columnControl/resetColumn", {
        tableName: props.tableNameRef
    })
    saveCustomColumnsSetting()
}

function saveCustomColumnsSetting() {
    let data = [
        { tables: store.state.columnControl.tables },
        { oringinSetting: store.state.columnControl.oringinSetting }
    ]
    localStorage.setItem("customizeColumns", JSON.stringify(data))
}
function setStorageColumnSetting() {
    let storage = JSON.parse(localStorage.getItem("customizeColumns"))
    if (storage) {
        for (const [tableName, columns] of Object.entries(storage[1].oringinSetting)) {
            if (!Array.isArray(columns)) {
                for (const [tabName, subColumns] of Object.entries(columns)) {
                    store.commit("columnControl/setActiveTab", {
                        tableName,
                        tab: tabName
                    })
                    store.commit("columnControl/saveColumnSortedOringinal", {
                        tableName,
                        columns: subColumns
                    });
                }
            } else {
                store.commit("columnControl/saveColumnSortedOringinal", {
                    tableName,
                    columns
                });
            }
        }
        for (const [tableName, columns] of Object.entries(storage[0].tables)) {
            if (!Array.isArray(columns)) {
                for (const [tabName, subColumns] of Object.entries(columns)) {
                    store.commit("columnControl/setActiveTab", {
                        tableName,
                        tab: tabName
                    })
                    store.commit("columnControl/setColumnSortedByFixed", {
                        tableName,
                        columns: subColumns
                    });
                }
                store.commit("columnControl/setActiveTab", {
                    tableName,
                    tab: Object.keys(columns)[0]
                })
            } else {
                store.commit("columnControl/setColumnSortedByFixed", {
                    tableName,
                    columns
                });
            }
        }

    }
}
onMounted(() => {
    setStorageColumnSetting()
})


//手機板欄位變成預設設定
const windowW = ref(0)
function getWindowW() {
    windowW.value = window.innerWidth
}
onMounted(() => {
    getWindowW()
    window.addEventListener("resize", getWindowW)
})
onBeforeMount(() => {
    window.removeEventListener("resize", getWindowW)
})
watch(windowW, (newVal) => {

    if (newVal < 500) {
        store.commit("columnControl/resetColumn", {
            tableName: props.tableNameRef
        })
    }else{
        setStorageColumnSetting()
    }
}, { deep: true })
</script>
<template>
    <span class="d-none d-sm-inline-block column-controller">
        <span @click="panelOpen = !panelOpen">
            <slot name="btn">
                <button class="table-expansion d-none d-sm-inline-block">
                    <font-awesome-icon icon="fa-solid fa-table-columns" />
                    <span class="ms-2">Customize Columns</span>
                </button>
            </slot>
        </span>
        <el-drawer v-model="panelOpen" :direction="panelDirection" :size="size">
            <div class="p-2 px-3 border-b fw-bold">Fixed Columns</div>
            <div class="column-controller__item-show py-4 px-3" v-if="!(columnList.some((column) => column.fixed))"></div>
            <draggable v-model="columnList" tag="ul" :group="{ name: 'show', put: true }" :item-key="`order`" @change="Onchange" :animation="250">
                <template #item="{ element }">
                    <li class="column-controller__item-show py-2 px-3 flex-sm-row-reverse" v-if="element.fixed">
                        <button @click="switchShow(element.columnName)">
                            <font-awesome-icon icon="fa-solid fa-circle-minus" size="lg" color="#FF3D00" />
                        </button>
                        <span class="ms-auto me-sm-auto ms-sm-0">{{ element.columnName }}</span>
                        <button class="ms-2 ms-sm-0 me-sm-2 dragHandle">
                            <font-awesome-icon icon="fa-solid fa-bars" color="#ccc" />
                        </button>
                    </li>
                </template>
            </draggable>
            <div class="p-2 border-b d-flex justify-content-between">
                <span class="fw-bold">Shown Columns</span>
                <button style="color:#29BFED" @click="showAllColumns">Show all</button>
            </div>
            <div class="column-controller__item-show py-4 px-3" v-if="!(columnList.some((column) => column.show && !column.fixed))"></div>
            <draggable v-model="columnNoFixed" tag="ul" @start="drag = true" @end="drag = false" @change="Onchange" :item-key="`order`" v-bind="dragOptions" :group="{ name: 'show', put: true }">
                <template #item="{ element }">
                    <li class="column-controller__item-show py-2 px-3 flex-sm-row-reverse" v-if="element.show && !element.fixed">
                        <button @click="switchShow(element.columnName)">
                            <font-awesome-icon icon="fa-solid fa-circle-minus" size="lg" color="#FF3D00" />
                        </button>
                        <span class="ms-auto me-sm-auto ms-sm-0">{{ element.columnName }}</span>
                        <button class="ms-2 me-sm-2 ms-sm-0 dragHandle">
                            <font-awesome-icon icon="fa-solid fa-bars" color="#ccc" />
                        </button>
                    </li>
                </template>
            </draggable>
            <div class="p-2 border-b fw-bold">Hidden Columns</div>
            <ul class="column-controller__hide-list">
                <li class="column-controller__item-hide py-2 px-3 flex-sm-row-reverse" v-for="(column, index) in columnNoShow" :key="`${column.columnName}-${index}`">
                    <button @click="switchShow(column.columnName)">
                        <font-awesome-icon icon="fa-solid fa-circle-plus" size="lg" color="#35C099" />
                    </button>
                    <span>{{ column.columnName }}</span>
                </li>
            </ul>
            <template #footer>
                <el-button style="color:#29BFED" @click="resetColumn">
                    <font-awesome-icon icon="fa-solid fa-rotate-right" />
                    <span class="ms-2">Reset</span>
                </el-button>
            </template>
        </el-drawer>
    </span>
</template>
<style lang="scss">
@import "@/assets/scss/all.scss";

.column-controller {
    .el-drawer__header {
        margin-bottom: 0;
    }
}

.column-controller__item-show {
    display: flex;
    align-items: center;
    width: 100%;
    @extend .border-b;
}

.column-controller__item-hide {
    display: flex;
    justify-content: space-between;
    align-items: center;
    @extend .border-b;

}
</style>