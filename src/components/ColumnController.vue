<script setup>
import { ref } from 'vue'
import { unref } from 'vue'
import { computed } from 'vue'
import { defineProps } from 'vue'
import { useStore } from 'vuex'
const store = useStore()
const props = defineProps({
    tableNameRef: {
        type: String,
        default: "inefiVirtualTable"
    },
    panel: {
        type: String,

    }
})

import { ClickOutside as vClickOutside } from 'element-plus';
const panelTrigger = ref()
const popoverPanel = ref()
const onClickOutside = () => {
    if (unref(popoverPanel).popoverPanel) {
        unref(popoverPanel).popoverPanel.hide();
    }
};

const columnList = computed(() => {
    return store.state.columnControl.tables[props.tableNameRef] ? store.state.columnControl.tables[props.tableNameRef] : []
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
        columnName
    })
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

function onEnd() {
    // store.commit("columnControl/setColumnNewOrder", {
    //     tableName: props.tableNameRef,
    //     e
    // })
    drag.value = false
}
function Onchange(e) {
    if(e.moved){
        store.commit("columnControl/setMovedNewOrder", {
            tableName: props.tableNameRef,
            e:e.moved
        })

    }else if(e.added){
        store.commit("columnControl/setAddedNewOrder", {
            tableName: props.tableNameRef,
            e:e.added
        })
    }
}
</script>
<template>
    <span class="column-controller">
        <span ref="panelTrigger" v-click-outside="onClickOutside">
            <slot name="toggleBtn">
                <el-button>Column Controller</el-button>
            </slot>
        </span>
        <el-popover ref="popoverPanel" :virtual-ref="panelTrigger" virtual-triggering placement="bottom" 
        :width="200" trigger="click" popper-class="popover-panel">
            <div class="p-2 px-3 border-b">Fixed Columns</div>
            <li class="column-controller__item-show py-4 px-3" v-if="!(columnList.some((column)=>column.fixed))"></li>
            <draggable v-model="columnList" tag="ul" :group="{ name: 'show',put:true }" :item-key="`order`" @change="Onchange" :animation="250">
                <template #item="{ element }">
                    <li class="column-controller__item-show py-2 px-3" v-if="element.fixed">
                        <button class="me-2 dragHandle">
                            <font-awesome-icon icon="fa-solid fa-bars" color="#ccc"/>
                        </button>
                        <span class="me-auto">{{ element.columnName }}</span>
                        <button @click="switchShow(element.columnName)">
                            <font-awesome-icon icon="fa-solid fa-circle-minus" size="lg" color="red"/>
                        </button>
                    </li>
                </template>
            </draggable>
            <div class="column-devide_line p-1"></div>
            <draggable v-model="columnNoFixed" tag="ul" @start="drag = true" @end="onEnd" @change="Onchange" :item-key="`order`" 
                v-bind="dragOptions" :group="{ name: 'show',put:true }">
                <template #item="{ element }">
                    <li class="column-controller__item-show py-2 px-3" v-if="element.show && !element.fixed">
                        <button class="me-2 dragHandle">
                            <font-awesome-icon icon="fa-solid fa-bars" color="#ccc" />
                        </button>
                        <span class="me-auto">{{ element.columnName }}</span>
                        <button @click="switchShow(element.columnName)">
                            <font-awesome-icon icon="fa-solid fa-circle-minus" size="lg" color="red"/>
                        </button>
                    </li>
                </template>
            </draggable>
            <div class="column-devide_line p-1"></div>
            <ul class="column-controller__hide-list">
                <li class="column-controller__item-hide py-2 px-3" v-for="(column, index) in columnNoShow" :key="`${column.columnName}-${index}`">
                    <span>{{ column.columnName }}</span>
                    <button @click="switchShow(column.columnName)">
                        <font-awesome-icon icon="fa-solid fa-circle-plus" size="lg" color="#75FFE5"/>
                    </button>
                </li>
            </ul>
        </el-popover>
    </span>
</template>
<style lang="scss">
@import "@/assets/scss/all.scss";
.el-popover.popover-panel{
    padding: 0;
    border-radius: 12px;
}
.column-devide_line{
    border-bottom: 1px solid #bbb;
    background-color: #eee;
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

    &:last-child {
        border-bottom: none;
    }
}
</style>