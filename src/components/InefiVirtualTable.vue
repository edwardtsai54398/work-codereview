<script setup>
import { defineProps, nextTick, watch, computed, reactive, onMounted, onBeforeUnmount, ref } from 'vue'
import { SortUp } from "@element-plus/icons-vue";
import { SortDown } from "@element-plus/icons-vue";
import { useStore } from 'vuex'
const store = useStore()
const props = defineProps({
    items: Array,
    keyField: String,//id key
    itemSize: Number,//每列資料高度
    tableProps: Array,//每個欄位設定
    // {columnName欄位名稱,
    //     dataKey要綁的資料key,
    //     width(Number(%) String(px)),
    //     minWidth(String(px)),
    //     fixed(Boolean),
    //     show(Boolean),}
    showCheckBox: {
        type: Boolean,
        default: false
    },
    tooltipTrigger: {
        type: String,
        default: "hover"
    },
    tooltipContent: String,
    tooltipRef: String,//tooltip作用的欄位的dataKey
    openIfEllipsis: {
        type: Boolean,
        default: false
    },//true的話，有ellipsis才會顯現tooltip
    tooltipModel:{
        type:Boolean,
        defalut: true
    },//正常情況tooltip會依trigger開關，其他情況如:視窗關閉，可透過父組件把tooltip關掉
    sortable: {
        type: Boolean,
        default: false
    },
    getDataLen: {
        type: Number,
        default: 0
    },//batchload每次讀取筆數
    batchLoad: {
        type: Boolean,
        default: false
    },
    URL: String,//API網址
    tableName: String,//如果有column controller，要傳入相同的字串
})
import { defineExpose, defineEmits } from 'vue'
const emit = defineEmits([
    "haveCheckedData"/*當有一個以上的勾選資料*/,
    "noCheckedData"/*當沒有勾選資料*/,
    "tooltipOpen"
])

defineExpose({
    getCheckedData /*返回已勾選資料*/,
    clearChecked/*清除全部勾選*/
})

store.commit("scrollBatchLoad/setProps", {
    batchLoad: props.batchLoad,
    getDataLen: props.getDataLen,
    keyField: props.keyField,
})

store.commit("columnControl/setColumnSortedByFixed", {
    tableName: props.tableName, 
    props: props.tableProps
})
const tablePropsSorted = computed(()=>{
    return store.state.columnControl.tables[props.tableName]
})
const tablePropsFixed = computed(()=>{
    return tablePropsSorted.value.filter((column) => {return column.fixed})
})

function getColumnWidth(column) {
    if(!column.show){
        return '0px'
    }else if (typeof column.width === 'string') {
        return column.width
    } else if (typeof column.width === 'number') {
        if (column.fixed) {
            let checkboxWidth = 46
            if (("width" in column)) {
                return `${(tableMainWidth.value - checkboxWidth) * column.width / 100}px`
            } else if (!("width" in column)) {
                console.log("Column with 'fixed:true' should have 'width' attribute")
                console.error("Column with 'fixed:true' should have 'width' attribute")
            }
        } else {
            return `${column.width}%`
        }
        
    } else if (!column.width) {
        let columnsWithWidth = tablePropsSorted.value.filter((column) => {
            return column.width
        })
        let sum = 0
        columnsWithWidth.forEach((column) => {
            sum += column.width
        })
        let widthRemain = 100 - sum
        let widthRemainMinus = widthRemain / (tablePropsSorted.value.length - columnsWithWidth.length)
        let widthRemainAverage = 100 / tablePropsSorted.value.length

        if (columnsWithWidth.length > 0) {
            return `${widthRemainMinus}%`
        } else {

            return `${widthRemainAverage}%`
        }

    }
}
const calcMainMinWidth = computed(() => {
    let allWidth = ''
    tablePropsSorted.value.forEach((column) => {
        if(column.show){
            let str = ''
            if ("minWidth" in column) {
                str = column.minWidth
            } else if (column.fixed) {
                str = getColumnWidth(column)
            } else {
                str = '120px'
            }
            allWidth += `${str} + `

        }
    })
    if (props.showCheckBox) {
        let checkboxWidth = '46px'
        allWidth += checkboxWidth
    }
    return allWidth
})

//全選功能
const selectAll = ref(false)
const rowDataChecked = reactive([])
const isIndeterminate = ref(false)
function selectAllChange(value) {
    rowDataChecked.length = 0
    if (value) {
        props.items.forEach((item) => {
            rowDataChecked.push(item)
        })
    }
    isIndeterminate.value = false
}
function setRowIsCheck(item) {
    if (isRowChecked(item)) {
        rowDataChecked.splice(rowDataChecked.indexOf(item), 1)
    } else {
        rowDataChecked.push(item)
    }
    if (rowDataChecked.length === props.items.length) {
        selectAll.value = true
        isIndeterminate.value = false
    } else if (rowDataChecked.length === 0) {
        selectAll.value = false
        isIndeterminate.value = false
    } else {
        selectAll.value = false
        isIndeterminate.value = true
    }
}
function isRowChecked(item) {
    let rowDataCheckedExistRow = rowDataChecked.some((row) => row[props.keyField] === item[props.keyField])
    return rowDataCheckedExistRow
}

//被選取的資料傳到父層事件

watch(rowDataChecked, (newVal) => {
    if (newVal.length > 0) {
        emit("haveCheckedData", newVal)
    } else {
        emit("noCheckedData")

    }
})
function getCheckedData() {
    return [...rowDataChecked]
}
function clearChecked() {
    rowDataChecked.length = 0
    selectAll.value = false
    isIndeterminate.value = false
}

//scrollbar
//計算scrollbarY高度
const scrollYTop = ref(props.itemSize)
const tableMainHeight = ref(0)
const scrollYHeight = computed(()=>{return tableMainHeight.value - scrollYTop.value})
const scrollYBarHeight = computed(() => {
    return scrollYHeight.value / (props.itemSize * props.items.length) * scrollYHeight.value
})
setTimeout(() => {
    tableMainHeight.value = tableMain.value.offsetHeight
    scrollYHeight.value = tableMainHeight.value - scrollYTop.value
}, 1)

//計算scrollX寬度
const tableMain = ref(null)
const tableMainWidth = ref(null)
const tableMainInner = ref(null)
const tableMainInnerWidth = ref(null)
const fixedLeft = ref(null)
const fixedLeftWidth = ref(0)
const scrollXShow = ref(false)
const scrollXWidth = ref(0)
const scrollBarXWidth = ref(0)

nextTick(() => {
    tableMainWidth.value = tableMain.value.offsetWidth
    tableMainInnerWidth.value = tableMainInner.value.offsetWidth
    if (tableMainWidth.value < tableMainInnerWidth.value) {
        scrollXShow.value = true
        calcScrollbarXSize()
    }
})

const getfixedLeftWidth = debounce((entries) => {
    fixedLeftWidth.value = entries[0].contentRect.width
}, 5)
const getTableInnerWidth = debounce((entries) => {
    tableMainInnerWidth.value = entries[0].contentRect.width
}, 5)
const compareTableInnerWider = debounce((entries) => {
    tableMainWidth.value = entries[0].contentRect.width
    if (tableMainWidth.value < tableMainInnerWidth.value) {
        //內層比外層大了
        scrollXShow.value = true
        calcScrollbarXSize()
    } else {
        scrollXShow.value = false
    }
}, 5)
const fixedLeftResizeObserver = new ResizeObserver(getfixedLeftWidth)
const tableMainInnerResizeObserver = new ResizeObserver(getTableInnerWidth)
const tableMainResizeObserver = new ResizeObserver(compareTableInnerWider)

onMounted(() => {
    if (props.showCheckBox || tablePropsFixed.value.length > 0) {
        fixedLeftResizeObserver.observe(fixedLeft.value)
    }
    tableMainInnerResizeObserver.observe(tableMainInner.value)
    tableMainResizeObserver.observe(tableMain.value)
})

function calcScrollbarXSize() {
    if (props.showCheckBox || tablePropsFixed.value.length > 0) {
        scrollXWidth.value = tableMainWidth.value - fixedLeftWidth.value
    } else {
        scrollXWidth.value = tableMainWidth.value
    }
    scrollBarXWidth.value = (tableMainWidth.value / tableMainInnerWidth.value) * scrollXWidth.value
}

//main, fixed滾動聯動
let mainVirtualScrollY
let fixedVirtualScrollY
const scrollbarYTranslate = ref(0)
const scrollbarXTranslate = ref(0)
function mainConnectFixedScroll() {
    fixedVirtualScrollY.scrollTop = mainVirtualScrollY.scrollTop;
}
function fixedConnectMainScroll() {
    mainVirtualScrollY.scrollTop = fixedVirtualScrollY.scrollTop;
}
function Yscroll() {
    let scrollerWrapperHeight = props.itemSize * props.items.length
    scrollbarYTranslate.value = (mainVirtualScrollY.scrollTop / scrollerWrapperHeight) * scrollYHeight.value
    tooltipScrollHide()
}
function Xscroll() {
    scrollbarXTranslate.value = (tableMain.value.scrollLeft / tableMainInnerWidth.value) * scrollXWidth.value
}
onMounted(() => {
    mainVirtualScrollY = document.querySelector('.inefi-table-v2__main .vue-recycle-scroller')
    mainVirtualScrollY.addEventListener("scroll", Yscroll)
    tableMain.value.addEventListener("scroll", Xscroll)
    if (props.showCheckBox || tablePropsFixed.value.length > 0) {

        fixedVirtualScrollY = document.querySelector('.inefi-table-v2__fixed-left .vue-recycle-scroller')
        mainVirtualScrollY.addEventListener("scroll", mainConnectFixedScroll)
        fixedVirtualScrollY.addEventListener("scroll", fixedConnectMainScroll)
    }
})
onBeforeUnmount(() => {
    mainVirtualScrollY.removeEventListener("scroll", Yscroll);
    tableMain.value.removeEventListener("scroll", Xscroll)
    if (props.showCheckBox || tablePropsFixed.value.length > 0) {
        mainVirtualScrollY.removeEventListener("scroll", mainConnectFixedScroll);
        fixedVirtualScrollY.removeEventListener("scroll", fixedConnectMainScroll);

        fixedVirtualScrollY.removeEventListener("scroll", fixedConnectMainScroll)
    }
});


function debounce(func, delay = 250) {
    let timeoutId;

    return function () {
        const context = this;
        const args = arguments;

        clearTimeout(timeoutId);

        timeoutId = setTimeout(function () {
            func.apply(context, args);
        }, delay);
    };
}

// tootltip效能優化
const tooltipToggle = ref(false)
const tooltipIsOpen = computed(()=>{
    return props.tooltipModel ? tooltipToggle.value : props.tooltipModel
})
const toolTiptriggerRef = ref(null)

function tooltipOpen(e) {
    e.stopPropagation();
    emit("tooltipOpen", e)
    if (tooltipCanBeOpen(e)) {
        toolTiptriggerRef.value = e.target
        if(e.type==="click"){
            tooltipToggle.value = true
        }else if(e.type==="mouseleave" || e.type==="mouseover"){
            tooltipToggle.value = !tooltipToggle.value
        }
    }else{
        tooltipToggle.value = false
    }
}
function tooltipClose() {
    tooltipToggle.value = false
}
function tooltipCanBeOpen(e) {
    let canOpen = true
    if (props.openIfEllipsis && e.target.parentNode.offsetWidth == e.target.parentNode.scrollWidth) {
        //判斷是否有ellipsis
        canOpen = false
    }
    if (e.target == toolTiptriggerRef.value && tooltipToggle.value) {
        canOpen = false
    }
    return canOpen
}
onMounted(() => {
    tableMain.value.addEventListener("click", tooltipClose)
})
watch(() => props.items, (newVal) => {
    if (newVal.length > 0 && props.tooltipRef) {
        setTimeout(() => {
            let refDOMs = document.querySelectorAll(`.${props.tooltipRef}`)
            if (props.tooltipTrigger === "click") {
                refDOMs.forEach((dom) => {
                    dom.addEventListener("click", tooltipOpen)
                })
            } else if (props.tooltipTrigger === "hover" || !props.tooltipTrigger) {
                refDOMs.forEach((dom) => {
                    dom.addEventListener("mouseover", tooltipOpen)
                    dom.addEventListener("mouseleave", tooltipClose)
                })
            }
        },10)

    }
})
//tooltip滾動超出消失
function tooltipScrollHide() {
    if (props.tooltipRef && tooltipToggle.value) {
        let scrollerSlot = document.querySelector('.inefi-table-v2__main .vue-recycle-scroller__slot')
        let scrollerSlotBottom = scrollerSlot.getBoundingClientRect().top + props.itemSize
        let tablemainBottom = tableMain.value.getBoundingClientRect().bottom
        let tooltip = document.querySelector('.el-popper.is-dark')
        if (tooltip.getBoundingClientRect().top <= scrollerSlotBottom + 10) {
            tooltipToggle.value = false
        } else if (tooltip.getBoundingClientRect().bottom + 10 >= tablemainBottom) {
            tooltipToggle.value = false

        }
    }
}

//資料排序
const sortable = ref(props.sortable)
const sortUp = ref(true)
const DefaultSortColumn = ref(tablePropsSorted.value[0])
const sortTableDataKey = ref(DefaultSortColumn.value.dataKey)
const sortedData = computed(() => {
    let newData = [...props.items]
    if (sortUp.value) {
        //從小到大
        for (let i = 0; i < newData.length; i++) {
            for (let j = i + 1; j < newData.length; j++) {
                if (newData[i][sortTableDataKey.value] === "") {
                    newData.push(newData[i])
                    newData.splice(i, 1)
                } else if (newData[i][sortTableDataKey.value] > newData[j][sortTableDataKey.value] &&
                    newData[j][sortTableDataKey.value] !== "") {
                    let temp = { ...newData[i] }
                    newData[i] = { ...newData[j] }
                    newData[j] = { ...temp }
                }
            }
        }
    } else if (!sortUp.value) {
        for (let i = 0; i < newData.length; i++) {
            for (let j = i + 1; j < newData.length; j++) {
                if (newData[i][sortTableDataKey.value] < newData[j][sortTableDataKey.value]) {
                    let temp = { ...newData[i] }
                    newData[i] = { ...newData[j] }
                    newData[j] = { ...temp }
                }
            }
        }
    }
    return newData
})

if (props.batchLoad && props.sortable) {
    sortable.value = false
    console.warn("If 'batchLoad' is true, then 'sortable' will be set to false.")
}
function setSortTableDataKey(dataKey) {
    if (dataKey === sortTableDataKey.value) {
        sortUp.value = !sortUp.value
    } else {
        sortTableDataKey.value = dataKey
        sortUp.value = true
    }
}
const magicKey = ref(0)

watch(sortedData.value, () => {
    if (sortable.value) {
        magicKey.value = (magicKey.value > 0) ? -1 : 1
        //重新掛載virtual-scroller
        setTimeout(() => {
            nextTick(() => {
                mainVirtualScrollY = document.querySelector('.inefi-table-v2__main .vue-recycle-scroller')
                mainVirtualScrollY.addEventListener("scroll", Yscroll)
                tableMain.value.addEventListener("scroll", Xscroll)
                if (props.showCheckBox || tablePropsFixed.value.length > 0) {

                    fixedVirtualScrollY = document.querySelector('.inefi-table-v2__fixed-left .vue-recycle-scroller')
                    mainVirtualScrollY.addEventListener("scroll", mainConnectFixedScroll)
                    fixedVirtualScrollY.addEventListener("scroll", fixedConnectMainScroll)
                }

            })
        }, 500)
    }
}, { deep: true })

//batchLoad
const getNextDataTrigger = ref(1)
const getFormerDataTrigger = ref(1)
const alreadyScrollTop = ref(0)
const scrollZone = ref(1)
if (props.batchLoad && props.getDataLen) {
    store.dispatch("scrollBatchLoad/batchLoadData", props.URL)
} else if (props.batchLoad && !props.getDataLen ||
    props.getDataLen && !props.batchLoad) {
    console.error("You can't use 'batchLoadData' without setting VirtualTable component props 'batchLoad: true' or 'getDataLen'");
}

function scrollDownOrUp() {
    let singleLenH = props.getDataLen * props.itemSize
    let scrollzone = Math.floor(mainVirtualScrollY.scrollTop / singleLenH) + 1
    if (scrollzone !== scrollZone.value) {
        getNextDataTrigger.value = 1
        getFormerDataTrigger.value = 1
        scrollZone.value = scrollzone
    }
    if (mainVirtualScrollY.scrollTop >= alreadyScrollTop.value) {
        store.commit("scrollBatchLoad/setOffset", scrollZone.value * props.getDataLen)
        if (mainVirtualScrollY.scrollTop >= scrollzone * singleLenH - singleLenH / 2 && getNextDataTrigger.value) {
            getNextDataTrigger.value = 0
        }
    } else {
        if (store.state.scrollBatchLoad.batchesTrustList.some((boolean) => !boolean)) {
            store.commit("scrollBatchLoad/setOffset", (scrollZone.value - 1) * props.getDataLen)
            if (mainVirtualScrollY.scrollTop < scrollzone * singleLenH - props.itemSize * 2 && getFormerDataTrigger.value) {
                getFormerDataTrigger.value = 0
            }
        }
    }
    alreadyScrollTop.value = mainVirtualScrollY.scrollTop
}

watch(getNextDataTrigger, (newVal) => {
    if (!newVal) {
        store.dispatch("scrollBatchLoad/batchLoadData", props.URL)
    }
}, { deep: true })

watch(getFormerDataTrigger, (newVal) => {
    if (!newVal) {
        batchLoadScrollupCheck()
    }
}, { deep: true })
const batchLoadScrollupCheck = () => {
    //若在第2區，抓第2區的資料
    if (!store.state.scrollBatchLoad.batchesTrustList[scrollZone.value - 1]) {
        store.dispatch("scrollBatchLoad/getFormerZoneData", props.URL)
    }
}
onMounted(() => {
    if (props.batchLoad && props.getDataLen) {
        mainVirtualScrollY.addEventListener("scroll", scrollDownOrUp)
    }
})
onBeforeUnmount(() => {
    if (props.batchLoad && props.getDataLen) {
        mainVirtualScrollY.removeEventListener("scroll", scrollDownOrUp)
    }
})

const finalData = computed(() => {
    let data = props.items
    if (props.sortable) {
        data = sortedData.value
    }
    return data
})
</script>
<template>
    <div class="inefi-table-v2 layout-content">
        <div class="inefi-table-v2__main layout-content overflow-auto" ref="tableMain">
            <div class="layout-content" ref="tableMainInner" :style="{ minWidth: !tableName ? `calc(${calcMainMinWidth})`: null}">
                <RecycleScroller :key="magicKey" :items="finalData" :itemSize="itemSize" :keyField="keyField">
                    <template #before>
                        <div class="table-columns py-2" :style="{ height: `${itemSize}px` }">
                            <div class="px-2" v-if="showCheckBox">
                                <el-checkbox class="p-2" />
                            </div>
                            <div class="column-name" v-for="(column, index) in tablePropsSorted" :key="index" :style="{
                                width: getColumnWidth(column),
                                minWidth: column.show ? (column.minWidth ? column.minWidth : (column.fixed ? getColumnWidth(column) : '')) : '0px'
                            }" @click="setSortTableDataKey(column.dataKey)">
                                <span class="px-2">{{ column.columnName }}</span>
                                <span class="ms-3" v-if="sortable && column.dataKey == sortTableDataKey">
                                    <el-icon v-show="sortUp">
                                        <SortUp />
                                    </el-icon>
                                    <el-icon v-show="!sortUp">
                                        <SortDown />
                                    </el-icon>
                                </span>
                            </div>
                        </div>
                    </template>
                    <template v-slot="{ item }">
                        <div class="table-row py-2" :style="{ height: `${itemSize}px` }">
                            <div class="px-2" v-if="showCheckBox">
                                <el-checkbox class="p-2" />
                            </div>
                            <div class="data" v-for="(column, index) in tablePropsSorted" :key="index" :style="{
                                width: `${getColumnWidth(column)}`,
                                minWidth: column.show ? (column.minWidth ? column.minWidth : (column.fixed ? getColumnWidth(column) : '')) : '0px',
                                height: (item[column.dataKey]==='')?'100%':''
                            }" :class="column.dataKey">
                                <slot :name="column.dataKey" :item="item">
                                    <span class="px-2">{{ item[column.dataKey] }}</span>
                                </slot>
                            </div>
                        </div>
                    </template>
                </RecycleScroller>
            </div>
        </div>
        <div class="layout-content inefi-table-v2__fixed-left" ref="fixedLeft" style="position: absolute;" v-if="showCheckBox || tablePropsFixed.length > 0">
            <div class="layout-content">
                <RecycleScroller :key="magicKey" :items="finalData" :itemSize="itemSize" :keyField="keyField">
                    <template #before>
                        <div class="fixed-left__table-columns py-2" :style="{ height: `${itemSize}px` }">
                            <div class="px-2" v-if="showCheckBox">
                                <el-checkbox class="p-2" @change="selectAllChange" v-model="selectAll" :indeterminate="isIndeterminate" />
                            </div>
                            <div class="column-name" v-for="(column, index) in tablePropsFixed" :key="index" :style="{
                                width: getColumnWidth(column),
                                minWidth: column.show ? (column.minWidth ? column.minWidth : (column.fixed ? getColumnWidth(column) : '')) : '0px'
                            }" @click="setSortTableDataKey(column.dataKey)">
                                <span class="px-2">{{ column.columnName }}</span>
                                <span class="ms-3" v-if="sortable && column.dataKey == sortTableDataKey">
                                    <el-icon v-show="sortUp">
                                        <SortUp />
                                    </el-icon>
                                    <el-icon v-show="!sortUp">
                                        <SortDown />
                                    </el-icon>
                                </span>
                            </div>
                        </div>
                    </template>
                    <template v-slot="{ item }">
                        <div class="fixed-left__table-row py-2" :style="{ height: `${itemSize}px` }">
                            <div class="px-2 " v-if="showCheckBox">
                                <el-checkbox class="p-2" @change="setRowIsCheck(item)" :model-value="isRowChecked(item)" />
                            </div>
                            <div class="data" v-for="(column, index) in tablePropsFixed" :key="index" :style="{
                                width: getColumnWidth(column),
                                minWidth: column.show ? (column.minWidth ? column.minWidth : (column.fixed ? getColumnWidth(column) : '')) : '0px'
                            }" :class="column.dataKey">
                                <slot :name="column.dataKey" :item="item">
                                    <span class="px-2">{{ item[column.dataKey] }}</span>
                                </slot>
                            </div>
                        </div>
                    </template>
                </RecycleScroller>
            </div>
        </div>
        <div class="inefi-table-v2__scrolly" :style="{ top: `${scrollYTop}px`, height: `${scrollYHeight}px` }">
            <div class="scroll-thumb" :style="{ height: `${scrollYBarHeight}px`, transform: `translateY(${scrollbarYTranslate}px)`}" v-show="scrollYBarHeight <= scrollYHeight"></div>
        </div>
        <div class="inefi-table-v2__scrollx" v-show="scrollXShow" :style="{ width: `${scrollXWidth}px` }">
            <div class="scroll-thumb" :style="{ width: `${scrollBarXWidth}px`, transform: `translateX(${scrollbarXTranslate}px)` }"></div>
        </div>
        <template v-if="tooltipRef">
            <el-tooltip :content="tooltipContent" placement="top" effect="dark" :trigger="tooltipTrigger" :visible="tooltipIsOpen" virtual-triggering :virtual-ref="toolTiptriggerRef" :disabled="false" />
        </template>
    </div>
</template>
<style lang="scss">
@import "@/assets/scss/all.scss";

.table-columns {
    display: flex;
    align-items: center;
    @extend .border-b;

}
.column-name {
    display: flex;
    align-items: center;
    overflow: hidden;
    white-space: nowrap;
    transition: .5s;
}

.table-row {
    @extend .table-columns;
    .data {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
}

.inefi-table-v2 {
    .vue-recycle-scroller {
        width: 100%;

    }

    .vue-recycle-scroller__slot {
        position: sticky;
        z-index: 10;
        top: 0;
        background-color: #fff;
    }
    .vue-recycle-scroller__item-view{
        &:last-child{
            .table-row, .fixed-left__table-row{
                border-bottom: none;
            }
        }
    }
}

.inefi-table-v2__main {
    @extend .scrollbar-none;

    &::-webkit-scrollbar {
        display: none;
    }

    &::-webkit-scrollbar-track {
        display: none;
    }

    &::-webkit-scrollbar-thumb {
        display: none;
    }
}

.inefi-table-v2__fixed-left {
    @extend .scrollbar-none;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 20;
    background-color: #fff;
    box-shadow: 5px 0 8px -8px rgba(0, 0, 0, 0.3);
}

.fixed-left__table-columns {
    @extend .table-columns;

}

.fixed-left__table-row {
    @extend .table-row;

    .data {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
}

@for $i from 0 through 20 {
    .column-order-#{$i} {
        order: $i;
    }
}

.inefi-table-v2__scrolly {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 6px;

    .scroll-thumb {
        width: 100%;
    }
}

.inefi-table-v2__scrollx {
    position: absolute;
    bottom: 0;
    right: 0;
    height: 6px;

    .scroll-thumb {
        height: 100%;
    }
}

.scroll-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    opacity: 1;
}
</style>