<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import { onBeforeMount } from 'vue'
import { computed } from 'vue'
import { watch } from 'vue'
import { defineProps } from 'vue'
import { defineEmits } from 'vue'
// import { useStore } from 'vuex'
// const store = useStore()
const props = defineProps({
    tableName: String,//對應要控制的tablem元件的字串
    columns: {
        type: Array,
        default: () => []
    },
    direction: {
        type: String,
        default: "rtl"
    },//drawer方向
    panelSize: {
        type: Number || String,
        default: 300
    },
    loading:{
        type: Boolean,
        default: false
    },
})
const emit = defineEmits([
    "change"
])
const panelOpen = ref(false)

function deepcopy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function columnSortedByFixed(columns) {
    let columnWithFixed = [];
    let columnNoFixed = [];

    columns.forEach((column) => {
        if (column.fixed) {
            columnWithFixed.push(column);
        } else {
            columnNoFixed.push(column);
        }
    });

    columnWithFixed.forEach((column, index) => {
        column.order = index + 1;
    });
    columnNoFixed.forEach((column, index) => {
        column.order = index + 1 + columnWithFixed.length;
    });
    return [...columnWithFixed, ...columnNoFixed];
}
const storageSetting = ref([])
const oringinSetting = computed(() => { return columnSortedByFixed(props.columns) })

//localStorage
function saveCustomColumnsSetting() {
    let otherTable = {}
    let otherTableOringinal = {}
    if(storageSetting.value.length){
        otherTable = Object.keys(storageSetting.value[0].tables).reduce((result, key) => {
                if (key !== props.tableName) {
                    result[key] = storageSetting.value[0].tables[key];
                }
                return result;
            }, {})
    
        otherTableOringinal = Object.keys(storageSetting.value[1].oringinSetting).reduce((result, key) => {
                if (key !== props.tableName) {
                    result[key] = storageSetting.value[1].oringinSetting[key];
                }
                return result;
            }, {})
    }
    let data = [
        { tables: { ...otherTable, [props.tableName]: columnList.value } },
        { oringinSetting: { ...otherTableOringinal, [props.tableName]: oringinSetting.value } }
    ]
    localStorage.setItem("columnsSetting", JSON.stringify(data))
}
function getStorageColumnSetting() {
    let storage = JSON.parse(localStorage.getItem("columnsSetting"))
    if (storage) {
        storageSetting.value = storage
    }
}
getStorageColumnSetting()

const columnList = computed(() => { 
    return (storageSetting.value.length && storageSetting.value[0].tables[props.tableName]) 
    ? storageSetting.value[0].tables[props.tableName] 
    : deepcopy(oringinSetting.value) 
})
emit("change", columnList.value)

const columnFixed = computed(() => {
    return columnList.value.filter((column) => column.fixed)
})
const columnNoFixed = computed(() => {
    return columnList.value.filter((column) => !column.fixed)
})
const columnNoShow = computed(() => {
    return columnList.value.filter((column) => !column.show)
})

//客製設定
function switchShow(columnName) {
    let column = columnList.value.find((column) => columnName === column.columnName);
    column.show = !column.show;
    if (column.fixed) {
        column.fixed = false;
    }
    reorderColumn()
    saveCustomColumnsSetting()
    getStorageColumnSetting()
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
        setMovedNewOrder(e.moved)

    } else if (e.added) {
        fixedShownSwitchNewOrder(e.added)
    }
    saveCustomColumnsSetting()
    getStorageColumnSetting()
}
function setMovedNewOrder(e) {
    let columnTarget = columnList.value
    let groupStartOrder = 1;
    if (!e.element.fixed) {
        groupStartOrder = columnTarget.filter((column) => column.fixed).length + 1;
    }
    let moveColumn = columnTarget.find(
        (column) => e.element.columnName === column.columnName
    );

    let newOrder = e.newIndex + groupStartOrder;
    let oldOrder = e.oldIndex + groupStartOrder;
    if (oldOrder > newOrder) {
        columnTarget.forEach((column) => {
            if (column.order < oldOrder && column.order >= newOrder) {
                column.order += 1;
            }
        });
    } else if (oldOrder < newOrder) {
        columnTarget.forEach((column) => {
            if (column.order > oldOrder && column.order <= newOrder) {
                column.order -= 1;
            }
        });
    }
    moveColumn.order = newOrder;

    reorderColumn()
}

function fixedShownSwitchNewOrder(e) {
    let columnTarget = columnList.value
    let moveColumn = columnTarget.find((column) => e.element.columnName === column.columnName);
    let groupStartOrder = 1;
    if (moveColumn.fixed) {
        groupStartOrder = columnTarget.filter((column) => { return column.fixed; }).length;
    }
    let newOrder = e.newIndex + groupStartOrder;
    let oldOrder = moveColumn.order;
    if (oldOrder > newOrder) {
        columnTarget.forEach((column) => {
            if (column.order < oldOrder && column.order >= newOrder) {
                column.order += 1;
            }
        });
    } else if (oldOrder < newOrder) {
        columnTarget.forEach((column) => {
            if (column.order > oldOrder && column.order <= newOrder) {
                column.order -= 1;
            }
        });
    }
    moveColumn.order = newOrder;
    moveColumn.fixed = !moveColumn.fixed;
    reorderColumn()
    if (moveColumn.fixed) {
        columnList.value = columnSortedByFixed(columnList.value)
    }
}
function reorderColumn() {
    let columnTarget = columnList.value
    for (let i = 0; i < columnTarget.length; i++) {
        for (let j = i + 1; j < columnTarget.length; j++) {
            if (columnTarget[i].order > columnTarget[j].order) {
                let temp = { ...columnTarget[i] };
                columnTarget[i] = {
                    ...columnTarget[j],
                };
                columnTarget[j] = { ...temp };
            }
        }
    }
}

//欄位全部顯示
function showAllColumns() {
    columnList.value.forEach((column) => { column.show = true; })

    saveCustomColumnsSetting()
    getStorageColumnSetting()
}
//欄位回到初始設定
function resetColumn() {
    storageSetting.value[0].tables[props.tableName] = deepcopy(oringinSetting.value)

    saveCustomColumnsSetting()
    getStorageColumnSetting()
}

//切換頁面
watch(columnList,()=>{
    emit("change", columnList.value)
},{deep:true})

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
        storageSetting.value[0].tables[props.tableName] = null
    } else {
        getStorageColumnSetting()
    }
}, { deep: true })
</script>
<template>
    <span class="d-none d-sm-inline-block column-controller">
        <span @click="panelOpen = !panelOpen">
            <slot name="btn">
                <button class="table-expansion d-none d-sm-inline-block" :disabled="loading" :class="{disable:loading}">
                    <font-awesome-icon icon="fa-solid fa-table-columns" />
                    <span class="ms-2">Columns Setting</span>
                </button>
            </slot>
        </span>
        <el-drawer v-model="panelOpen" :direction="direction" :size="panelSize">
            <div class="p-2 px-3 border-b fw-bold">Fixed Columns</div>
            <div class="column-controller__item-show py-4 px-3" v-if="!(columnList.some((column) => column.fixed))"></div>
            <draggable v-model="columnFixed" tag="ul" :group="{ name: 'show', put: true }" :item-key="`order`" @change="Onchange" :animation="250">
                <template #item="{ element }">
                    <li class="column-controller__item-show py-2 px-3 flex-sm-row-reverse">
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