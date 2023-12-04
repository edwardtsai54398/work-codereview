<script setup>
import { defineProps, nextTick, watch } from 'vue'
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { reactive } from 'vue'
import { computed } from 'vue'
import { SortUp } from "@element-plus/icons-vue";
import { SortDown } from "@element-plus/icons-vue";
import {useStore} from 'vuex'
const store = useStore()
const props = defineProps({
    items: Array,
    keyField: String,//id key
    itemSize: Number,//每列資料高度
    tableProps: Array,//每個欄位設定
    // {columnName欄位名稱,dataKey要綁的資料key,index欄位排序可選,width(Number:% String:px),minWidth(px),fixed(Boolean)}
    showCheckBox: {
        type: Boolean,
        default: false
    },
    sortable: {
        type: Boolean,
        default: false
    },
    getDataLen: Number,//batchload每次讀取筆數
})
import { defineExpose, defineEmits } from 'vue'
const emit = defineEmits([
    "haveCheckedData"/*當有一個以上的勾選資料*/, 
    "noCheckedData"/*當沒有勾選資料*/, 
    "scrollDownDataHalf"/*當往下滑到最後一批資料的一半*/, 
    "scrollUpGetErr" /*當有資料有點變動且往上滑*/])

defineExpose({ 
    getCheckedData /*返回已勾選資料*/ , 
    clearChecked/*清除全部勾選*/ 
})

store.commit("scrollBatchLoad/setProps",{
    getDataLen:props.getDataLen,
    keyField:props.keyField,
})


const tablePropsSorted = ref(sortTablePropsByIndex(props.tableProps))
const tablePropsFixed = ref(tablePropsFiltFixed(tablePropsSorted.value, true))
//整理tableProps
function sortTablePropsByIndex(props) {
    let columnWithIndex = []
    let columnNoIndex = []

    props.forEach((column) => {
        if (column.index) {
            columnWithIndex.push(column)
        } else {
            columnNoIndex.push(column)
        }
    })

    columnWithIndex.forEach((column, index) => {
        for (let i = 0; i < columnWithIndex.length - 1 - index; i++) {
            if (column.index > columnWithIndex[i + 1].index) {
                let temp = { ...column }
                columnWithIndex[i] = { ...columnWithIndex[i + 1] }
                columnWithIndex[i + 1] = { ...temp }
            }
        }
    })
    return [...columnWithIndex, ...columnNoIndex]
}
function tablePropsFiltFixed(props = [], isfixed) {
    let propsWithFixed = []
    if (isfixed) {
        propsWithFixed = props.filter((obj) => {
            return obj.fixed
        })

    } else {
        propsWithFixed = props.filter((obj) => {
            return !obj.fixed
        })
    }
    return propsWithFixed
}
function getColumnWidth(column) {
    if (typeof column.width === 'string') {
        return column.width
    } else if (typeof column.width === 'number') {
        if (column.fixed) {
            let checkboxWidth = 38
            let paddindX = 32
            if (column.width) {
                return `${(tableMainWidth.value - checkboxWidth - paddindX) * column.width / 100}px`
            } else if (!column.width) {
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
    let paddingX = '32px'
    allWidth += paddingX
    tablePropsSorted.value.forEach((column) => {
        let str = ''
        if (column.minWidth) {
            str = column.minWidth
        } else if (column.fixed) {
            str = getColumnWidth(column)
        } else {
            str = '120px'
        }
        allWidth += ` + ${str}`
    })
    if (props.showCheckBox) {
        let checkboxWidth = '38px'
        allWidth += ` + ${checkboxWidth}`
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
        emit("haveCheckedData")
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
const scrollYHeight = ref(0)
const scrollYBarHeight = ref(0)
const tableMainHeight = ref(0)
setTimeout(() => {
    const scrollerWrapperHeight = props.itemSize * props.items.length
    tableMainHeight.value = tableMain.value.offsetHeight
    scrollYHeight.value = tableMainHeight.value - scrollYTop.value
    scrollYBarHeight.value = scrollYHeight.value / scrollerWrapperHeight * 100
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
const tooltipIsOpen = ref(false)
const triggerRef = ref(null)
const tooltipContent = ref("")
function tooltipCanBeOpen(e) {
    let canOpen = true
    if (e.target.parentNode.offsetWidth == e.target.parentNode.scrollWidth) {
        //判斷是否有ellipsis
        canOpen = false
    }
    if (e.target == triggerRef.value && tooltipIsOpen.value) {
        canOpen = false
    }
    return canOpen
}
function tooltipOpen(e) {
    if (tooltipCanBeOpen(e)) {
        triggerRef.value = e.target
        tooltipIsOpen.value = true
        tooltipContent.value = e.target.innerText
    }
    else {
        tooltipIsOpen.value = false
    }
}
function tooltipClose() {
    tooltipIsOpen.value = false
}
onMounted(() => {
    tableMain.value.addEventListener("click", tooltipClose)
})
//tooltip滾動超出消失
function tooltipScrollHide() {
    if (tooltipIsOpen.value) {
        let scrollerSlot = document.querySelector('.inefi-table-v2__main .vue-recycle-scroller__slot')
        let scrollerSlotBottom = scrollerSlot.getBoundingClientRect().top + props.itemSize
        let tablemainBottom = tableMain.value.getBoundingClientRect().bottom
        let tooltip = document.querySelector('.el-popper.is-dark')
        if (tooltip.getBoundingClientRect().top <= scrollerSlotBottom + 10) {
            tooltipIsOpen.value = false
        } else if (tooltip.getBoundingClientRect().bottom + 10 >= tablemainBottom) {
            tooltipIsOpen.value = false

        }
    }
}

//欄位排序
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

//批量加載
const getNextDataTrigger = ref(1)
const getFormerDataTrigger = ref(1)
const alreadyScrollTop = ref(0)
const scrollZone = ref(1)

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
        if (store.state.scrollBatchLoad.batchesTrustList.some((boolean)=> !boolean)) {
            store.commit("scrollBatchLoad/setOffset", (scrollZone.value - 1) * props.getDataLen)
            if (mainVirtualScrollY.scrollTop < scrollzone * singleLenH - props.itemSize*2 && getFormerDataTrigger.value) {
                console.log("getFormerDataTrigger");
                getFormerDataTrigger.value = 0
            }
        }
    }
    alreadyScrollTop.value = mainVirtualScrollY.scrollTop
}

watch(getNextDataTrigger, (newVal) => {
    if (!newVal) {
        emit("scrollDownDataHalf")
    }
}, { deep: true })

watch(getFormerDataTrigger, (newVal) => {
    if (!newVal) {
        batchLoadScrollupCheck()
    }
}, { deep: true })
const batchLoadScrollupCheck = () => {
    //若在第2區，抓第2區的資料
    if (!store.state.scrollBatchLoad.batchesTrustList[scrollZone.value-1]) {
        emit("scrollUpGetErr")
    }
}


onMounted(() => {
    mainVirtualScrollY.addEventListener("scroll", scrollDownOrUp)
})
onBeforeUnmount(() => {
    mainVirtualScrollY.removeEventListener("scroll", scrollDownOrUp)
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
            <div class="layout-content" ref="tableMainInner" :style="{ minWidth: `calc(${calcMainMinWidth})` }">
                <RecycleScroller :key="magicKey" :items="finalData" :itemSize="itemSize" :keyField="keyField">
                    <template #before>
                        <div class="table-columns py-2 px-3" :style="{ height: `${itemSize}px` }">
                            <div class="px-2" v-if="showCheckBox">
                                <el-checkbox class="p-1" />
                            </div>
                            <div class="px-2 column-name" v-for="(column, index) in tablePropsSorted" :key="index" :style="{
                                width: getColumnWidth(column),
                                minWidth: column.minWidth ? column.minWidth : (column.fixed ? getColumnWidth(column) : '')
                            }" @click="setSortTableDataKey(column.dataKey)">
                                <span class="me-3">{{ column.columnName }}</span>
                                <span v-if="sortable && column.dataKey == sortTableDataKey">
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
                        <div class="table-row py-2 px-3" :style="{ height: `${itemSize}px` }">
                            <div class="px-2" v-if="showCheckBox">
                                <el-checkbox class="p-1" />
                            </div>
                            <div class="px-2 data" v-for="(column, index) in tablePropsSorted" :key="index" :style="{
                                width: `${getColumnWidth(column)}`,
                                minWidth: column.minWidth ? column.minWidth : (column.fixed ? getColumnWidth(column) : '')
                            }">
                                <span @click.stop="tooltipOpen">{{ item[column.dataKey] }}</span>
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
                        <div class="fixed-left__table-columns py-2 ps-3" :style="{ height: `${itemSize}px` }">
                            <div class="px-2" v-if="showCheckBox">
                                <el-checkbox class="p-1" @change="selectAllChange" v-model="selectAll" :indeterminate="isIndeterminate" />
                            </div>
                            <div class="px-2 column-name" v-for="(column, index) in tablePropsFixed" :key="index" :style="{
                                width: getColumnWidth(column),
                                minWidth: column.minWidth ? column.minWidth : getColumnWidth(column)
                            }" @click="setSortTableDataKey(column.dataKey)">
                                <span class="me-3">{{ column.columnName }}</span>
                                <span v-if="sortable && column.dataKey == sortTableDataKey">
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
                        <div class="fixed-left__table-row py-2 ps-3" :style="{ height: `${itemSize}px` }">
                            <div class="px-2 " v-if="showCheckBox">
                                <el-checkbox class="p-1" @change="setRowIsCheck(item)" :model-value="isRowChecked(item)" />
                            </div>
                            <div class="px-2 data" v-for="(column, index) in tablePropsFixed" :key="index" :style="{
                                width: getColumnWidth(column),
                                minWidth: column.minWidth ? column.minWidth : getColumnWidth(column)
                            }">
                                <span @click.stop="tooltipOpen">{{ item[column.dataKey] }}</span>
                            </div>
                        </div>
                    </template>
                </RecycleScroller>
            </div>
        </div>
        <div class="inefi-table-v2__scrolly" :style="{ top: `${scrollYTop}px`, height: `${scrollYHeight}px` }">
            <div class="scroll-thumb" :style="{ height: `${scrollYBarHeight}%`, transform: `translateY(${scrollbarYTranslate}px)` }"></div>
        </div>
        <div class="inefi-table-v2__scrollx" v-show="scrollXShow" :style="{ width: `${scrollXWidth}px` }">
            <div class="scroll-thumb" :style="{ width: `${scrollBarXWidth}px`, transform: `translateX(${scrollbarXTranslate}px)` }"></div>
        </div>
        <el-tooltip :content="tooltipContent" placement="top" effect="dark" trigger="click" :visible="tooltipIsOpen" virtual-triggering :virtual-ref="triggerRef" :disabled="false" />
    </div>
</template>
<style lang="scss">
@import "@/assets/scss/all.scss";

.table-columns {
    display: flex;
    align-items: center;
    @extend .border-b;

    .column-name {
        display: flex;
        align-items: center
    }
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
    // opacity: 0.3;
    position: absolute;
    top: 0;
    // right: 100%;
    left: 0;
    z-index: 20;
    background-color: #fff;
    box-shadow: 5px 0 8px -8px rgba(0, 0, 0, 0.3);
    // padding-bottom: 6px;
}

.fixed-left__table-columns {
    @extend .table-columns;

    .column-name {
        display: flex;
        align-items: center
    }
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
    opacity: 0;
    transition: opacity .5s;
}

.inefi-table-v2:hover {
    .scroll-thumb {
        opacity: 1;
    }
}
</style>