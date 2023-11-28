<script setup>
import { defineProps, nextTick } from 'vue'
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { reactive } from 'vue'
import { computed } from 'vue'
const props = defineProps({
    items: Array,
    keyField: String,
    minItemSize: Number,
    sizeDependencies: String,
    tableProps: Array,
    showCheckBox: {
        type: Boolean,
        default: false
    }
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
    let checkboxWidth = '38px'
    let paddingX = '32px'
    allWidth += `${paddingX} + `
    tablePropsSorted.value.forEach((column) => {
        let str = ''
        if (column.minWidth) {
            str = column.minWidth
        }else if (column.fixed) {
            str = getColumnWidth(column)
        } else {
            str = '120px'
        }
        allWidth += `${str} + `
    })
    if (props.showCheckBox) {
        allWidth += checkboxWidth
    }
    return allWidth
})

//計算監測欄位寬度
const getDependencyColumnWidth = computed(()=>{
    let DependencyColumnWidth = ''
    let dependColumn = tablePropsSorted.value.find((column)=>column.dataKey == props.sizeDependencies)
    let dependColumnWidthString = getColumnWidth(dependColumn)
    if(dependColumnWidthString.includes('px')){
        DependencyColumnWidth = dependColumnWidthString
    }else if(dependColumnWidthString.includes('%')){
        let checkboxWidth = 38
        let paddingX = 32
        DependencyColumnWidth = `${(tableMainWidth.value-checkboxWidth-paddingX)*parseInt(dependColumnWidthString)/100}px`
    }
    return DependencyColumnWidth
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

//fixedLeft位移
const fixedLeft = ref(null)
const fixedLeftTranslate = ref(0)
if (props.showCheckBox) {
    nextTick(() => {
        console.log('fixedLeft',fixedLeft.value.offsetWidth);
        fixedLeftTranslate.value = fixedLeft.value.offsetWidth
    })

}

//scrollbar
//計算scrollbarY高度
const tableColumn = ref(null)
const scrollYTop = ref(0)
const scrollYHeight = ref(0)
const scrollYBarHeight = ref(0)
nextTick(() => {
    scrollYTop.value = tableColumn.value.offsetHeight
    const scrollerWrapper = document.querySelector('.inefi-table-v2__main .vue-recycle-scroller__item-wrapper')
    // console.log(scrollerWrapper.getAttribute("style"));
    let tableMainHeight = tableMain.value.offsetHeight

    scrollYHeight.value = tableMainHeight - scrollYTop.value
    scrollYBarHeight.value = 100 - (scrollYHeight.value / (scrollerWrapper.offsetHeight - scrollYHeight.value)) * 100
})
//計算scrollX寬度
const tableMain = ref(null)
const tableMainWidth = ref(null)
const tableMainInner = ref(null)
const tableMainInnerWidth = ref(null)
const scrollXShow = ref(false)
const scrollXWidth = ref(0)
const scrollBarXWidth = ref(0)

nextTick(() => {
    tableMainWidth.value = tableMain.value.offsetWidth
    tableMainInnerWidth.value = tableMainInner.value.offsetWidth
    // console.log(tableMainWidth.value);
    // console.log(tableMainInnerWidth.value);
    if (tableMainWidth.value < tableMainInnerWidth.value) {
        scrollXShow.value = true
        calcScrollbarXSize()
    }
})

const watchTableInnerWider = debounce((entries) => {
    tableMainWidth.value = entries[0].contentRect.width

    if (tableMainWidth.value < tableMainInnerWidth.value) {
        //內層比外層大了
        scrollXShow.value = true
        calcScrollbarXSize()
    } else {
        scrollXShow.value = false
    }
}, 5)

const scrollResizeObserver = new ResizeObserver(watchTableInnerWider)
onMounted(() => {
    scrollResizeObserver.observe(tableMain.value)
    // scrollResizeObserver.observe()
})
function calcScrollbarXSize() {
    let fixedLeftWidth = 0
    nextTick(()=>{fixedLeftWidth = fixedLeft.value.offsetWidth})
    scrollXWidth.value = tableMainWidth.value - fixedLeftWidth
    scrollBarXWidth.value = 100 - ((tableMainInnerWidth.value - tableMainWidth.value) / scrollXWidth.value) * 100
}

//main, fixed滾動聯動
let mainVirtualScrollY
let mainVirtualScrollX
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
    scrollbarYTranslate.value = (mainVirtualScrollY.scrollTop / scrollYHeight.value) * scrollYHeight.value
}
function Xscroll() {
    scrollbarXTranslate.value = (mainVirtualScrollX.scrollLeft / scrollXWidth.value) * scrollXWidth.value
}
onMounted(() => {
    mainVirtualScrollY = document.querySelector('.inefi-table-v2__main .vue-recycle-scroller')
    mainVirtualScrollX = document.querySelector('.inefi-table-v2__main')
    mainVirtualScrollY.addEventListener("scroll", Yscroll)
    mainVirtualScrollX.addEventListener("scroll", Xscroll)
    if (props.showCheckBox) {
        
        fixedVirtualScrollY = document.querySelector('.inefi-table-v2__fixed-left .vue-recycle-scroller')
        mainVirtualScrollY.addEventListener("scroll", mainConnectFixedScroll)
        fixedVirtualScrollY.addEventListener("scroll", fixedConnectMainScroll)
    }
})
onBeforeUnmount(() => {
    mainVirtualScrollY.removeEventListener("scroll", Yscroll);
    mainVirtualScrollX.removeEventListener("scroll", Xscroll)
    if (props.showCheckBox) {
        mainVirtualScrollY.removeEventListener("scroll", mainConnectFixedScroll);
        fixedVirtualScrollY.removeEventListener("scroll", fixedConnectMainScroll);

        fixedVirtualScrollY.removeEventListener("scroll", fixedConnectMainScroll)
    }
});

//監看tableColumn高度折行
const watchTableColumnHeight = debounce((entires) => {
    scrollYTop.value = entires[0].borderBoxSize[0].blockSize
}, 5)
const tableColumnResizeObserver = new ResizeObserver(watchTableColumnHeight)
onMounted(() => {
    tableColumnResizeObserver.observe(tableColumn.value)
})

function debounce(func, delay) {
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

</script>
<template>
    <div class="inefi-table-v2 layout-content">
        <div class="inefi-table-v2__main layout-content overflow-auto" ref="tableMain">
            <div class="layout-content" ref="tableMainInner" :style="{ minWidth: `calc(${calcMainMinWidth})` }">
                <DynamicScroller :items="items" :minItemSize="minItemSize" :keyField="keyField">
                    <template #before>
                        <div class="table-columns py-2 px-3" ref="tableColumn" :style="{height:`${minItemSize}px`}">
                            <div class="px-2" v-if="showCheckBox">
                                <el-checkbox class="p-1" />
                            </div>
                            <div class="px-2" v-for="(column, index) in tablePropsSorted" :key="index" :style="{
                                width: `${getColumnWidth(column)}`,
                                minWidth: column.fixed ? getColumnWidth(column) : (column.minWidth ? `${column.minWidth}` : '')
                            }">
                                {{ column.columnName }}
                            </div>
                        </div>
                    </template>
                    <template v-slot="{ item, index, active }">
                        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item[sizeDependencies]]" :data-index="index">
                            <div class="table-row py-2 px-3" :style="{height:`${minItemSize}px`}">
                                <div class="px-2" v-if="showCheckBox">
                                    <el-checkbox class="p-1" />
                                </div>
                                <div class="px-2" v-for="(column, index) in tablePropsSorted" :key="index" :style="{
                                    width: `${getColumnWidth(column)}`,
                                    minWidth: column.fixed ? getColumnWidth(column) : (column.minWidth ? `${column.minWidth}` : '')
                                }">
                                    <span>{{ item[column.dataKey] }}</span>
                                </div>
                            </div>
                        </DynamicScrollerItem>
                    </template>
                </DynamicScroller>
            </div>
        </div>
        <div class="layout-content inefi-table-v2__fixed-left" style="position: absolute;" v-if="showCheckBox"
            :style="{ 
            transform: (tablePropsFixed.length == 0)?`translateX(${fixedLeftTranslate}px)`:false,
            right:(tablePropsFixed.length == 0)?'100%':false,
            left:(tablePropsFixed.length == 0)?false:'0' }" >
            <div class="layout-content">
                <DynamicScroller :items="items" :minItemSize="minItemSize" :keyField="keyField">
                    <template #before>
                        <div class="d-flex" :style="{height:`${minItemSize}px`}">
                            <!-- :style="{ height: `${scrollYTop}px` }" -->
                            <div class="py-2 px-2" v-if="tablePropsFixed.length == 0" :style="{minWidth: getDependencyColumnWidth}">
                                
                                {{ tablePropsSorted.find((column) => column.dataKey == sizeDependencies).columnName }}
                            </div>
                            <div class="fixed-left__table-columns py-2 ps-3" ref="fixedLeft">
                                <div class="px-2">
                                    <el-checkbox class="p-1" @change="selectAllChange" v-model="selectAll" :indeterminate="isIndeterminate" />
                                </div>
                                <div class="px-2" v-for="(column, index) in tablePropsFixed" :key="index" :style="{ 
                                    width: `${getColumnWidth(column)}`,
                                    minWidth: getColumnWidth(column) }">
                                    {{ column.columnName }}
                                </div>
                            </div>
                        </div>
                    </template>
                    <template v-slot="{ item, index, active }">
                        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.deviceName]" :data-index="index">
                            <div class="d-flex" :style="{height:`${minItemSize}px`}">
                                <div class="py-2 px-2" v-if="tablePropsFixed.length == 0" :style="{minWidth: getDependencyColumnWidth}">
                                    {{ item[tablePropsSorted.find((column) => column.dataKey == sizeDependencies).dataKey] }}
                                </div>
                                <div class="fixed-left__table-row py-2 ps-3">
                                    <div class="px-2 ">
                                        <el-checkbox class="p-1" @change="setRowIsCheck(item)" :model-value="isRowChecked(item)" />
                                    </div>
                                    <div class="px-2" v-for="(column, index) in tablePropsFixed" :key="index" :style="{ 
                                        width: `${getColumnWidth(column)}`,
                                        minWidth: getColumnWidth(column) }">
                                        <span>{{ item[column.dataKey] }}</span>
                                    </div>
                                </div>
                            </div>
                        </DynamicScrollerItem>
                    </template>
                </DynamicScroller>
            </div>
        </div>
        <div class="inefi-table-v2__scrolly" :style="{ top: `${scrollYTop}px`, height: `${scrollYHeight}px)` }">
            <div class="scroll-thumb" :style="{ height: `${scrollYBarHeight}px`, transform: `translateY(${scrollbarYTranslate}px)` }"></div>
        </div>
        <div class="inefi-table-v2__scrollx" v-show="scrollXShow" :style="{ width: `${scrollXWidth}px` }">
            <div class="scroll-thumb" :style="{ width: `${scrollBarXWidth}%`, transform: `translateX(${scrollbarXTranslate}px)` }"></div>
        </div>
    </div>
</template>
<style lang="scss">
@import "@/assets/scss/all.scss";

.table-columns,
.table-row,
.fixed-left__table-columns,
.fixed-left__table-row {
    display: flex;
    align-items: center;
    @extend .border-b;
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
    // left: 0;
    z-index: 20;
    background-color: #fff;
    box-shadow: 5px 0 8px -8px rgba(0, 0, 0, 0.3);
    // padding-bottom: 6px;
}

.fixed-left__table-columns {
    @extend .table-columns;
    // justify-content: end;
}

.fixed-left__table-row {
    @extend .fixed-left__table-columns;
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
    background-color: #aaf;

    .scroll-thumb {
        width: 100%;
    }
}

.inefi-table-v2__scrollx {
    position: absolute;
    bottom: 0;
    right: 0;
    height: 6px;
    background-color: #faf;

    .scroll-thumb {
        height: 100%;
    }
}

.scroll-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    background-color: #000;
    border-radius: 6px;

}
</style>