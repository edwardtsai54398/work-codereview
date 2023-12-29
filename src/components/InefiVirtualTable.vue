<script setup>
import { defineProps, nextTick, watch, computed, reactive, onMounted, onBeforeUnmount, ref } from 'vue'
import {onActivated} from "vue"
import { SortUp } from "@element-plus/icons-vue";
import { SortDown } from "@element-plus/icons-vue";
import { Search } from "@element-plus/icons-vue";
import ColumnController from "@/components/ColumnController.vue";
import FilterComponent from "@/components/FilterComponent.vue";
import IconCircleBtn from '@/components/IconCircleBtn.vue'
import { useStore } from 'vuex'
const store = useStore()
const state = computed(()=>store.state.scrollBatchLoad[props.tableName])
const getters = (getter)=>store.getters[`scrollBatchLoad/${props.tableName}/${getter}`]
function commit(mutations, param){
    store.commit(`scrollBatchLoad/${props.tableName}/${mutations}`, param)
}
function dispatch(actions, param){
    store.dispatch(`scrollBatchLoad/${props.tableName}/${actions}`, param)
}
const props = defineProps({
    items: Array,//使用batchLoad則不用給，資料會從vuex抓
    keyField: String,//id key
    itemSize: Number,//每列資料高度
    tableProps: Array,//每個欄位設定
    // {columnName欄位名稱,
    //     dataKey要綁的資料key,
    //     width(Number(%) String(px)),
    //     minWidth(String(px)，fixed的話建議要寫),
    //     slotName欄位若要自定義內容，slotName可自定義slot name屬性,
    //     fixed(Boolean),
    //     show(Boolean),}
    hover: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    },
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
        default: true
    },//false的話，即使有ellipsisu也不會顯現tooltip
    tooltipModel: {
        type: Boolean,
        default: true
    },//正常情況tooltip會依trigger開關，其他情況如:視窗關閉，可透過父組件把tooltip關掉
    sortable: {
        type: Boolean,
        default: false
    },
    batchLoad: {
        type: Boolean,
        default: false
    },//如果為true，要設定tableName，並在Vuex建一個與tableName同名的module
    getDataLen: {
        type: Number,
        default: 0
    },//batchload每次讀取筆數
    URL: String,//batchload API網址
    tableName: String,//如果有column controller或batchLoad，要設定名稱
    columnsExcept: {
        type: Array,
        default: () => []
    },//{tab:頁面名稱,except:[columnName...]該頁面不要的欄位名稱}
    activeTab: String,//現在的tab。若要使用tab切換，讓表格顯現不同欄位，或同時有checkbox功能時就必須有
    searchShow: {
        type: Boolean,
        default: true
    },
    searchText: {
        type: String,
        default: ""
    },//如果不要有search框但要有搜尋功能，可傳search文字
    customColumns: {
        type: Boolean,
        default: false
    },//是否要有欄位客製元件。如果為true，要設定tableName
    filter: {
        type: Boolean,
        default: false
    },//是否要有filter
    filterOptions: {
        type: Array,
        default: () => []
    },//filter每個type設定
    // [
    // {dataKey篩選的kayname,
    // typeName篩選的kayname要呈現的label,
    // multi是否可多選,
    // options:[{value資料會有的值,ex:"GOOD", valName選項要呈現的label}]}
    // ]
    darkMode: {
        type: Boolean,
        default: false
    },
})
import { defineExpose, defineEmits } from 'vue'
const emit = defineEmits([
    "reload"/*當reload按鈕被點擊時觸發*/,
    "loaded"/*當資料load完(batchload則是第一批資料load完)*/,
    "clearSearch",//若使用父層傳入searchText，點擊claer search會觸發
    "check"/*row被勾選，傳被勾選的資料*/,
    "uncheck"/*row被取消勾選，傳被取消的資料*/,
    "haveCheckedData"/*當有一個以上的勾選資料，傳所有被選取的資料*/,
    "noCheckedData"/*當沒有勾選資料*/,
    "filt"//filter傳出參數
])

defineExpose({
    getCheckedData /*返回已勾選資料*/,
    clearChecked/*清除全部勾選*/
})

//網頁寬度
const windowW = ref(0)
const userDevice = ref("pc")
function setWindowW() {
    windowW.value = window.innerWidth
}
onMounted(() => {
    setWindowW()
    window.addEventListener("resize", setWindowW)
})

watch(windowW, (newVal) => {
    if (newVal < 500) {
        userDevice.value = "mobile"
    } else if (newVal >= 500 && newVal < 1050) {
        userDevice.value = "pad"
    } else {
        userDevice.value = "pc"
    }
}, { deep: true })

//過濾不要的欄位

const useSwitchTab = computed(() => { return typeof props.activeTab !== "undefined" })
const tablePropsFilted = computed(() => {
    let columnKeep = props.tableProps
    columnKeep.forEach((column) => {
        if (!("show" in column)) {
            column.show = true;
        }
        if (!("fixed" in column)) {
            column.fixed = false;
        } else if (column.fixed) {
            column.show = true;
        }
    })
    if (useSwitchTab.value && props.columnsExcept.length) {
        columnKeep = props.tableProps.filter((column) => {
            let tabExpectList = props.columnsExcept.find((except) => except.tab.toLowerCase() === props.activeTab.toLowerCase())
            return !tabExpectList?.except.some((except) => except == column.columnName)
        })
        if (!columnKeep.length) {
            columnKeep = props.tableProps
        }
    }
    return columnKeep
})
//切換資料表格
const tableNameComputed = computed(() => { return useSwitchTab.value ? props.activeTab : props.tableName })

//整理表格

const tablePropsSorted = ref(tablePropsFilted.value)
function setTableSorted(table) {
    tablePropsSorted.value = table

}
watch(() => props.activeTab, () => {
    if (!props.customColumns) {
        tablePropsSorted.value = tablePropsFilted.value
    }
})

const tablePropsFixed = computed(() => {
    return tablePropsSorted.value.filter((column) => { return column.fixed })
})

//欄位寬度
function getColumnWidth(column) {
    if (!column.show) {
        return '0px'
    } else if (typeof column.width === 'string') {
        return column.width
    } else if (typeof column.width === 'number') {
        if (column.fixed) {
            return getColumnMinWidth(column)
        } else if (ifWidthTotalNo100()) {
            return `${column.width + ifWidthTotalNo100()}%`
        } else {
            return `${column.width}%`
        }
    }
}
function getColumnMinWidth(column) {
    if (!column.show) {
        return '0px'
    }
    if ("minWidth" in column) {
        return column.minWidth
    } else if (column.fixed) {

        if ("width" in column) {
            return `${tableMainWidth.value * (column.width + ifWidthTotalNo100()) / 100}px`
        } else {
            return `${tableMainWidth.value * 0.1}px`
        }
    } else {
        return '0px'
    }
}

function ifWidthTotalNo100() {
    let columnShowList = tablePropsSorted.value.filter((column) => column.show && typeof column.width == 'number')
    if (columnShowList.length < tablePropsSorted.value.length) {
        let sum = 0
        columnShowList.forEach((column) => {
            sum += column.width
        })
        let widthRemain = 100 - sum
        let singleRemain = widthRemain / (columnShowList.length)

        return singleRemain

    } else {
        return 0
    }
}
const calcMainMinWidth = computed(() => {
    let allWidth = ''
    if (props.showCheckBox) {
        let checkboxWidth = '46px + '
        allWidth += checkboxWidth
    }
    for (let i = 0; i < tablePropsSorted.value.length; i++) {
        if (tablePropsSorted.value[i].show) {
            let str = getColumnMinWidth(tablePropsSorted.value[i])
            if (i == 0) {
                allWidth += `${str}`
            } else {
                allWidth += ` + ${str}`
            }
        }
    }
    return allWidth
})

//filter
function emitFilterParam(param) {
    emit("filt", param)
}

//search
const searchbarIsShow = ref(false)
const searchInputText = ref("")
const searchText = computed(() => { return props.searchShow ? searchInputText.value : props.searchText })
const columsDatakeys = reactive(tablePropsSorted.value.map((column) => column.dataKey))
const searchResult = computed(() => {
    let searchResource = props.items
    // if (props.batchLoad) {
    //     searchResource = state.value.allData
    // }
    return searchResource.filter((item) => {
        return columsDatakeys.some((key) => {
            if(typeof item[key] !== "string"){
                return false
            }else{
                return item[key]?.toUpperCase().includes(searchText.value.toUpperCase())
            }
        })
    })
})
const batchloadNotDoneShowText = computed(() => {
    let loadDoneRef = getters("dataLoadDone")
    return props.batchLoad && !loadDoneRef && searchText.value !== ""
    // return false
})
function clearSearch() {
    searchInputText.value = ""
    if (!props.searchShow && props.searchText !== "") {
        emit("clearSearch")
    }
}
function searchbarHide() {
    searchbarIsShow.value = false
}
watch(windowW, () => {
    searchbarIsShow.value = false
}, { deep: true })
onMounted(() => { window.addEventListener("click", searchbarHide) })
onBeforeUnmount(() => { window.removeEventListener("click", searchbarHide) })

const items = computed(() => {
    let items = props.items
    if (props.batchLoad) {
        items = JSON.parse(JSON.stringify(state.value.allData))
        let emptyLength = items.filter((data) => !data[props.keyField]).length
        let emptyStartIndex = items.findIndex((data) => !data[props.keyField])
        items.splice(emptyStartIndex, emptyLength)
    }
    if (searchText.value !== "") {
        items = searchResult.value
    }
    return items
})

//全選功能
const rowDataChecked = reactive([])
const rowDataCheckedUsetab = reactive({})
const checkListRef = computed(() => { return (useSwitchTab.value && props.activeTab in rowDataCheckedUsetab) ? rowDataCheckedUsetab[props.activeTab] : rowDataChecked })
onMounted(() => {
    if (useSwitchTab.value && !(props.activeTab in rowDataCheckedUsetab)) {
        rowDataCheckedUsetab[props.activeTab] = []
    }
})
watch(() => props.activeTab, () => {
    if (!(props.activeTab in rowDataCheckedUsetab)) {
        rowDataCheckedUsetab[props.activeTab] = []
    }
})

const selectAll = computed(() => {
    return checkListRef.value.length === items.value.length && checkListRef.value.length !== 0
})
const isIndeterminate = computed(() => {
    return checkListRef.value.length !== items.value.length && checkListRef.value.length !== 0
})

function selectAllChange(value) {
    let checkedList = rowDataChecked
    if (useSwitchTab.value) {
        if (!(props.activeTab in rowDataCheckedUsetab)) {
            rowDataCheckedUsetab[props.activeTab] = []
        }
        checkedList = rowDataCheckedUsetab[props.activeTab]
    }

    checkedList.length = 0
    if (value) {
        items.value.forEach((item) => {
            checkedList.push(item)
        })
    }
}
function setRowIsCheck(item) {
    let checkedList = rowDataChecked
    if (useSwitchTab.value) {
        if (!(props.activeTab in rowDataCheckedUsetab)) {
            rowDataCheckedUsetab[props.activeTab] = []
        }
        checkedList = rowDataCheckedUsetab[props.activeTab]
    }
    if (isRowChecked(item)) {
        checkedList.splice(checkedList.indexOf(item), 1)
        emit("uncheck", item)
    } else {
        checkedList.push(item)
        emit("check", item)
    }
}
function isRowChecked(item) {
    let rowDataCheckedExistRow = checkListRef.value.some((row) => row[props.keyField] === item[props.keyField])
    return rowDataCheckedExistRow
}

watch(items, () => {
    if (items.value.length == 0) {
        clearChecked()
    }
}, { deep: true })

//被選取的資料傳到父層事件

watch(checkListRef, (newVal) => {
    if (newVal.length > 0) {
        emit("haveCheckedData", newVal)
    } else {
        emit("noCheckedData")

    }
}, { deep: true })

function getCheckedData() {
    return [...checkListRef.value]
}
function clearChecked() {
    let checkedList = rowDataChecked
    if (useSwitchTab.value) {
        if (!(props.activeTab in rowDataCheckedUsetab)) {
            rowDataCheckedUsetab[props.activeTab] = []
        }
        checkedList = rowDataCheckedUsetab[props.activeTab]
    }
    checkedList.length = 0
}




//scrollbar
//監聽容器
const tableMain = ref(null)
const tableMainInner = ref(null)
const fixedLeft = ref(null)
const tableMainWidth = ref(0)
const tableMainHeight = ref(0)
const tableMainInnerWidth = ref(0)
const fixedLeftWidth = ref(0)

const watchTableMain = debounce((entries) => {
    tableMainWidth.value = entries[0].contentRect.width
    tableMainHeight.value = entries[0].contentRect.height
}, 5)
const getTableInnerWidth = debounce((entries) => {
    tableMainInnerWidth.value = entries[0].contentRect.width
    compareTableInnerWider()
}, 5)
const getfixedLeftWidth = debounce((entries) => {
    fixedLeftWidth.value = entries[0].contentRect.width
}, 5)

const tableMainResizeObserver = new ResizeObserver(watchTableMain)
const tableMainInnerResizeObserver = new ResizeObserver(getTableInnerWidth)
const fixedLeftResizeObserver = new ResizeObserver(getfixedLeftWidth)

onMounted(() => {
    tableMainResizeObserver.observe(tableMain.value)
    tableMainInnerResizeObserver.observe(tableMainInner.value)
    fixedLeftResizeObserver.observe(fixedLeft.value)
})

//計算scrollX寬度
const scrollXShow = ref(false)
const scrollXWidth = computed(() => {
    let width
    if (props.showCheckBox || tablePropsFixed.value.length > 0) {
        width = tableMainWidth.value - fixedLeftWidth.value
    } else {
        width = tableMainWidth.value
    }
    return width
})
const scrollBarXWidth = computed(() => { return (tableMainWidth.value / tableMainInnerWidth.value) * scrollXWidth.value })
nextTick(() => {
    tableMainWidth.value = tableMain.value.offsetWidth
    tableMainInnerWidth.value = tableMainInner.value.offsetWidth
    compareTableInnerWider()
})
function compareTableInnerWider() {
    if (tableMainWidth.value < tableMainInnerWidth.value) {
        //內層比外層大了
        scrollXShow.value = true
    } else {
        scrollXShow.value = false
    }
}
//計算scrollbarY高度
const scrollYTop = ref(props.itemSize)
const scrollYHeight = computed(() => { return tableMainHeight.value - scrollYTop.value })
const scrollYBarHeight = computed(() => {
    return scrollYHeight.value / (props.itemSize * items.value.length) * scrollYHeight.value
})

setTimeout(() => {
    tableMainHeight.value = tableMain.value.offsetHeight
    scrollYHeight.value = tableMainHeight.value - scrollYTop.value
}, 1)
//scrollbar 拖曳
const mainScroller = ref()


const mainScrollTop = ref(0)
const scrollbarYTranslate = computed(() => {
    let scrollerWrapperHeight = props.itemSize * items.value.length
    if (batchloadNotDoneShowText.value) {
        scrollerWrapperHeight += props.itemSize * 4
    }
    return (mainScrollTop.value / scrollerWrapperHeight) * scrollYHeight.value
})


const scrollbarXTranslate = ref(0)
const mouseXDown = ref(false)
const mouseYDown = ref(false)
const mouseOriginal = reactive({ x: 0, y: 0 })
onMounted(() => {
    window.addEventListener("mouseup", mouseUp)
    window.addEventListener("mousemove", mouseDragX)
    window.addEventListener("mousemove", mouseDragY)
})
onBeforeUnmount(() => {
    window.removeEventListener("mouseup", mouseUp)
    window.removeEventListener("mousemove", mouseDragX)
    window.removeEventListener("mousemove", mouseDragY)
})

function mouseUp() {
    mouseXDown.value = false
    mouseYDown.value = false
}
function mouseStartX(e) {
    mouseXDown.value = true
    mouseOriginal.x = e.clientX
}
function mouseDragX(e) {
    if (mouseXDown.value) {
        let move = e.clientX - mouseOriginal.x
        mouseOriginal.x = e.clientX
        tableMain.value.scrollLeft = (move + scrollbarXTranslate.value) / scrollXWidth.value * tableMainInnerWidth.value
    }
}
function mouseStartY(e) {
    mouseYDown.value = true
    mouseOriginal.y = e.clientY
}
function mouseDragY(e) {
    if (mouseYDown.value) {
        let move = e.clientY - mouseOriginal.y
        mouseOriginal.y = e.clientY
        let scrollerWrapperHeight = props.itemSize * items.value.length
        if (batchloadNotDoneShowText.value) {
            scrollerWrapperHeight += props.itemSize * 4
        }
        let translate = move + scrollbarYTranslate.value
        if (translate <= 0) {
            translate = 0
        }
        mainScrollTop.value = translate / scrollYHeight.value * scrollerWrapperHeight
    }
}

watch(mainScrollTop, (newVal) => {
    mainScroller.value.scrollToPosition(newVal)
}, { deep: true })

//main, fixed滾動聯動
const fixedScroller = ref()
const fixedScrollTop = ref(0)

function scrollTop() {
    mainScroller.value.scrollToPosition(0)
}

function setMainScrollTop() {
    mainScrollTop.value = mainScroller.value.getScroll().start
}
function setFixedScrollTop() {
    fixedScrollTop.value = fixedScroller.value.getScroll().start
}
watch(mainScrollTop, (newVal) => {
    if (props.showCheckBox || tablePropsFixed.value.length > 0) {
        fixedScroller.value.scrollToPosition(newVal)
    }
}, { deep: true })

watch(fixedScrollTop, (newVal) => {
    mainScroller.value.scrollToPosition(newVal)
}, { deep: true })

function Xscroll() {
    scrollbarXTranslate.value = (tableMain.value.scrollLeft / tableMainInnerWidth.value) * scrollXWidth.value
}


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
const isScrollToBottom = computed(()=>scrollbarYTranslate.value+scrollYBarHeight.value >= tableMainHeight.value-props.itemSize)

// tootltip
//default
const toolTiptriggerRefDefault = ref()
const defaultTipToggle = ref(false)
const tooltipIsOpenDefault = computed(() => {
    return props.tooltipModel ? defaultTipToggle.value : props.tooltipModel
})

const tooltipContentDefault = ref("")
const dataContentWidth = ref(0)
function tooltipCanBeOpen(e) {
    let target = isTargetCorrect(e.target)
    let canOpen = true
    if (props.openIfEllipsis && target.offsetWidth == target.scrollWidth) {
        //判斷是否有ellipsis
        canOpen = false
    }
    if (e.target == toolTiptriggerRefDefault.value && defaultTipToggle.value) {
        canOpen = false
    }
    return canOpen
}
function isTargetCorrect(target) {
    if (target.className !== "px-3") {
        target = isTargetCorrect(target.parentElement)
    }
    return target
}

function defaultTipOpenClick(e) {
    e.stopPropagation()
    if (tooltipCanBeOpen(e)) {
        tooltipContentDefault.value = e.target.innerText
        dataContentWidth.value = e.target.scrollWidth
        defaultTipToggle.value = true
        toolTiptriggerRefDefault.value = e.target
    } else {
        defaultTipToggle.value = false
    }
}
function defaultTipClose() {
    defaultTipToggle.value = false
}
//右擊複製
const copied = ref(false)
function copyText() {
    navigator.clipboard.writeText(tooltipContentDefault.value)
    copied.value = true
    defaultTipToggle.value = false
    setTimeout(() => {
        copied.value = false
    }, 900)
}

//custom
const tooltipToggle = ref(false)
const tooltipIsOpen = computed(() => {
    return props.tooltipModel ? tooltipToggle.value : props.tooltipModel
})
const toolTiptriggerRef = ref(null)

function tooltipOpen(e) {
    e.stopPropagation();
    toolTiptriggerRef.value = e.target
    if (e.type === "click") {
        tooltipToggle.value = true
    } else if (e.type === "mouseenter") {
        tooltipToggle.value = true
    }
}
function tooltipClose() {
    tooltipToggle.value = false
}

onMounted(() => {
    tableMain.value.addEventListener("click", tooltipClose)
    tableMain.value.addEventListener("click", defaultTipClose)
    tableMain.value.addEventListener("click", defaultTipClose)
})
onBeforeUnmount(() => {
    tableMain.value.removeEventListener("click", tooltipClose)
    tableMain.value.removeEventListener("click", defaultTipClose)
    tableMain.value.removeEventListener("click", defaultTipClose)
})

//tooltip滾動超出消失
function tooltipScrollHide() {
    if (tooltipToggle.value || defaultTipToggle.value) {
        let scrollerSlot = mainScroller.value.$refs.before
        let scrollerSlotBottom = scrollerSlot.getBoundingClientRect().top + props.itemSize
        let tablemainBottom = tableMain.value.getBoundingClientRect().bottom
        let tooltip
        if (tooltipToggle.value) {
            tooltip = document.querySelector('.el-popper.VTtooltip')
        } else if (defaultTipToggle.value) {
            tooltip = document.querySelector('.el-popper.VTDefaultTooltip')
        }
        if (tooltip.getBoundingClientRect().top <= scrollerSlotBottom + 10) {
            defaultTipToggle.value = false
            tooltipToggle.value = false
        } else if (tooltip.getBoundingClientRect().bottom + 10 >= tablemainBottom) {
            defaultTipToggle.value = false
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
    let newData = [...items.value]
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

watch(sortedData, () => {
    if (sortable.value) {
        magicKey.value = (magicKey.value > 0) ? -1 : 1
    }
}, { deep: true })

//loading
const firstLoaded = computed(() => {
    let scrollBatchLoadLoadStart = state.value?.loadStart
    return props.batchLoad ? scrollBatchLoadLoadStart : !props.loading
})
const firstLoadingEnd = ref(false)

watch(firstLoaded, (newVal) => {
    if (newVal) {
        setTimeout(() => {
            firstLoadingEnd.value = true
            emit("loaded")
        }, 1000)
    } else {
        firstLoadingEnd.value = false
    }
}, { deep: true, immediate: true })
//reload
function reload() {
    if(firstLoadingEnd.value){
        if (props.batchLoad && !batchLoading.value) {
            batchReloadData()
        } else{
            emit('reload')
        }
    }
}

const batchLoading = computed(()=>{
    let batchLoading = !firstLoadingEnd.value
    if(props.batchLoad){
        batchLoading = state.value.loading
    }
    return !firstLoadingEnd.value ? !firstLoadingEnd.value : batchLoading
})


//batchLoad
if (props.batchLoad) {
    commit("setProps", {
        getDataLen: props.getDataLen,
        keyField: props.keyField,
    })
}

const getNextDataTrigger = ref(1)
const getFormerDataTrigger = ref(1)
const alreadyScrollTop = ref(0)
const scrollZone = ref(1)
if (props.batchLoad && props.getDataLen) {
    dispatch(`batchLoadData`, props.URL)
} else if (props.batchLoad && !props.getDataLen ||
    props.getDataLen && !props.batchLoad) {
    console.error("You can't use 'batchLoadData' without setting VirtualTable component props 'batchLoad: true' or 'getDataLen'");
}

function scrollDownOrUp() {
    let singleLenH = props.getDataLen * props.itemSize
    let scrollzone = Math.floor(mainScrollTop.value / singleLenH) + 1
    if (scrollzone !== scrollZone.value) {
        getNextDataTrigger.value = 1
        getFormerDataTrigger.value = 1
        scrollZone.value = scrollzone
    }
    if (searchText.value === "") {
        if (mainScrollTop.value >= alreadyScrollTop.value) {
            //往下滾動
            commit("setOffset", scrollZone.value * props.getDataLen)
            if (mainScrollTop.value >= scrollzone * singleLenH - singleLenH / 2 && getNextDataTrigger.value) {
                getNextDataTrigger.value = 0
            }
        } else {
            //往上滾動
            if (!getters("dataLoadTrust")) {
                    commit(`setOffset`, (scrollZone.value - 1) * props.getDataLen)
                if (mainScrollTop.value < scrollzone * singleLenH - props.itemSize * 2 && getFormerDataTrigger.value) {
                    getFormerDataTrigger.value = 0
                }
            }
        }
    }
    alreadyScrollTop.value = mainScrollTop.value
}

watch(getNextDataTrigger, (newVal) => {
    if (!newVal && props.batchLoad) {
        if(!getters("dataLoadDone") && state.value.batchesTrustList.length == scrollZone.value){
            dispatch(`batchLoadData`, props.URL)
        }else if(!getters("dataLoadTrust")){
            dispatch("getNextUntrustData", props.URL)
        }
    }
}, { deep: true })

watch(getFormerDataTrigger, (newVal) => {
    if (!newVal) {
        batchLoadScrollupCheck()
    }
}, { deep: true })
function batchLoadScrollupCheck() {
    //若在第2區，抓第2區的資料
    if (!state.value.batchesTrustList[scrollZone.value - 1]) {
        dispatch("getFormerZoneData", props.URL)
    }
}
onActivated(()=>{
    if(props.batchLoad && !getters("dataLoadTrust")){
        dispatch("getNextUntrustData", props.URL)
    }
})

function batchReloadData() {
    commit("resetAllData")
    dispatch("batchLoadData", props.URL)
    scrollTop()
    getFormerDataTrigger.value = 1
    getNextDataTrigger.value = 1
}

function mainScrollEvent() {
    setMainScrollTop()
    tooltipScrollHide()
    if (props.batchLoad) {
        scrollDownOrUp()
    }
}
function fixedScrollEvent() {
    setFixedScrollTop()
}
const finalData = computed(() => {
    let data = items.value
    if (props.sortable) {
        data = sortedData.value
    }
    return data
})
</script>
<template>
    <div class="inefi-table-v2 layout-content pb-1" :class="{ 'no-select': mouseYDown || mouseXDown, dark: darkMode, canHover: hover }">
        <div class="table-func-header d-flex align-items-center justify-content-end px-3 py-2" v-if="customColumns || filter || searchShow">
            <div class="me-auto" v-if="customColumns || filter">
                <ColumnController class="my-2 me-2" :tableName="tableNameComputed" :columns="tablePropsFilted" v-if="customColumns" @change="setTableSorted" :loading="batchLoading" />
                <FilterComponent class="d-inline-block my-2" :options="filterOptions" :darkMode="darkMode" v-if="filter" @sentParam="emitFilterParam" :loading="batchLoading" />
            </div>
            <div v-if="searchShow" class="ms-auto search_group" :class="{ 'with-expansion': customColumns || filter }">
                <div class="row me-1 ps-2">
                    <div class="col-12 d-flex">
                        <IconCircleBtn iconClass="fa-solid fa-arrows-rotate" class="py-2 reload" @click="reload" :class="{ rotate: batchLoading }" />
                        <button class="show-search_bar ms-3" @click.stop="searchbarIsShow = true" v-show="!searchbarIsShow">
                            <font-awesome-icon icon="fa-solid fa-magnifying-glass" color="#aaa" />
                        </button>
                    </div>
                </div>
                <div class="py-2 search_bar" style="width:100%; position: relative;" :class="{ show: searchbarIsShow }">
                    <p class="load-notdone_hint" v-if="batchloadNotDoneShowText">
                        <span class="me-2">
                            Search in {{ state.allData.length }} of {{ state.totalDataCount }}</span>
                        <el-tooltip popper-class="searchTooltip" placement="top-end" content="Search results are from devices that have been loaded. Scroll down to load more devices for complete search results." effect="dark">
                            <font-awesome-icon icon="fa-solid fa-circle-info" />
                        </el-tooltip>
                    </p>
                    <el-input v-model="searchInputText" placeholder="Search" :prefix-icon="Search" size="large" clearable :disabled="batchLoading" @click.stop="searchbarIsShow = true" />
                </div>
            </div>
        </div>
        <div class="layout-content" v-loading="!firstLoadingEnd" element-loading-background="#fff">
            <div class="inefi-table-v2__main layout-content overflow-auto" ref="tableMain" @scroll="Xscroll">
                <div class="layout-content" ref="tableMainInner" :style="{ minWidth: `calc(${calcMainMinWidth})` }">
                    <RecycleScroller :key="magicKey" :items="finalData" :itemSize="itemSize" :keyField="keyField" ref="mainScroller" @scroll="mainScrollEvent">
                        <template #before>
                            <div class="table-columns py-2 border-b" :style="{ height: `${itemSize}px` }">
                                <div class="px-2" v-if="showCheckBox">
                                    <el-checkbox class="p-2" />
                                </div>
                                <div class="column-name" v-for="(column, index) in tablePropsSorted" :key="index" :style="{
                                    width: getColumnWidth(column), minWidth: getColumnMinWidth(column)
                                }" @click="setSortTableDataKey(column.dataKey)">
                                    <span class="px-3">{{ column.columnName }}</span>
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
                        <template v-slot="{ item, index }">
                            <div class="table-row py-2" :style="{ height: `${itemSize}px` }" @contextmenu.prevent :class="{ 'highlight-row': checkListRef.some((row) => row[props.keyField] == item[props.keyField]), 'border-b': finalData.length !== index + 1 }">
                                <div class="px-2" v-if="showCheckBox">
                                    <el-checkbox class="p-2" />
                                </div>
                                <div class="table-row_data" v-for="(column, index) in tablePropsSorted" :key="index" :style="{ width: getColumnWidth(column), minWidth: getColumnMinWidth(column) }" :class="[column.dataKey]">
                                    <div class="px-3" @mouseenter="(tooltipRef == column.dataKey) && tooltipOpen($event)" @mouseleave="(tooltipRef == column.dataKey) && tooltipClose($event)" @click="(tooltipRef !== column.dataKey) ? defaultTipOpenClick($event) : tooltipOpen($event)">
                                        <slot :name="column.slotName" :item="item">
                                            {{ item[column.dataKey] }}
                                        </slot>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template #after>
                            <div class="batchLoading__slot" :style="{height:`${itemSize}px`}" v-loading="batchLoading" v-if="batchLoading"></div>
                            <div class="nomoreData__slot" :style="{height:`${itemSize}px`}" v-else-if="!batchLoading && !batchloadNotDoneShowText">No more Data</div>
                            <el-skeleton animated v-if="batchloadNotDoneShowText">
                                <template #template>
                                    <div class="table-row py-2" :style="{ height: `${itemSize}px` }" v-for="n in 4" :key="n">
                                        <div class="px-2" v-if="showCheckBox">
                                            <el-skeleton-item style="width: 30px" />
                                        </div>
                                        <div class="table-row_data" v-for="(column, index) in tablePropsSorted" :key="index" :style="{ width: getColumnWidth(column), minWidth: getColumnMinWidth(column) }">
                                            <div class="px-3">
                                                <el-skeleton-item style="width: 100%" />
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </el-skeleton>
                        </template>
                    </RecycleScroller>
                </div>
            </div>
            <div class="layout-content inefi-table-v2__fixed-left" ref="fixedLeft" style="position: absolute;">
                <div class="layout-content" v-if="showCheckBox || tablePropsFixed.length > 0">
                    <RecycleScroller :key="magicKey" :items="finalData" :itemSize="itemSize" :keyField="keyField" ref="fixedScroller" @scroll="fixedScrollEvent">
                        <template #before>
                            <div class="fixed-left__table-columns py-2 border-b" :style="{ height: `${itemSize}px` }">
                                <div class="px-2" v-if="showCheckBox">
                                    <el-checkbox class="p-2" @change="selectAllChange" v-model="selectAll" :indeterminate="isIndeterminate" />
                                </div>
                                <div class="column-name" v-for="(column, index) in tablePropsFixed" :key="index" :style="{ width: getColumnWidth(column), minWidth: getColumnMinWidth(column) }" @click="setSortTableDataKey(column.dataKey)">
                                    <span class="px-3">{{ column.columnName }}</span>
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
                        <template v-slot="{ item, index }">
                            <div class="fixed-left__table-row py-2" :style="{ height: `${itemSize}px` }" @contextmenu.prevent :class="{ 'highlight-row': checkListRef.some((row) => row[props.keyField] == item[props.keyField]), 'border-b': finalData.length - 1 !== index }">
                                <div class="px-2 " v-if="showCheckBox">
                                    <el-checkbox class="p-2" @change="setRowIsCheck(item)" :model-value="isRowChecked(item)" />
                                </div>
                                <div class="table-row_data" v-for="(column, index) in tablePropsFixed" :key="index" :style="{ width: getColumnWidth(column), minWidth: getColumnMinWidth(column) }" :class="[column.dataKey]">
                                    <div class="px-3" @mouseenter="(tooltipRef == column.dataKey) && tooltipOpen($event)" @mouseleave="(tooltipRef == column.dataKey) && tooltipClose($event)" @click="(tooltipRef !== column.dataKey) ? defaultTipOpenClick($event) : tooltipOpen($event)">
                                        <slot :name="column.dataKey" :item="item">
                                            {{ item[column.dataKey] }}
                                        </slot>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template #after v-if="batchloadNotDoneShowText">
                            <el-skeleton animated v-if="batchloadNotDoneShowText">
                                <template #template>
                                    <div class="table-row py-2" :style="{ height: `${itemSize}px` }" v-for="n in 4" :key="n">
                                        <div class="px-2" v-if="showCheckBox">
                                            <el-skeleton-item style="width: 30px" />
                                        </div>
                                        <div class="table-row_data" v-for="(column, index) in tablePropsFixed" :key="index" :style="{ width: getColumnWidth(column), minWidth: getColumnMinWidth(column) }">
                                            <div class="px-3">
                                                <el-skeleton-item style="width: 100%" />
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </el-skeleton>
                        </template>
                    </RecycleScroller>
                </div>
            </div>
            <div class="inefi-table-v2__scrolly" :style="{ top: `${scrollYTop}px`, height: `${scrollYHeight}px` }" v-show="scrollYHeight !== scrollYBarHeight">
                <div class="scroll-thumb" :style="{ height: `${scrollYBarHeight}px`, transform: `translateY(${scrollbarYTranslate}px)` }" v-show="scrollYBarHeight <= scrollYHeight" @mousedown="mouseStartY"></div>
            </div>
            <div class="inefi-table-v2__scrollx" v-show="scrollXShow" :style="{ width: `${scrollXWidth}px` }">
                <div class="scroll-thumb" :style="{ width: `${scrollBarXWidth}px`, transform: `translateX(${scrollbarXTranslate}px)` }" @mousedown="mouseStartX"></div>
            </div>
            <div class="load-notdone_clear" v-if="batchloadNotDoneShowText && isScrollToBottom">
                <button class="clear-search p-3 mb-2" @click="clearSearch">
                    <font-awesome-icon icon="fa-solid fa-circle-xmark" />
                    <span class="ms-2">Clear Search</span>
                </button>
                <p>Here shows the search results from loaded devices.<br>
                    Clear search and scroll down to load more devices for complete search results.
                </p>
            </div>
        </div>
        <el-popover placement="top" effect="dark" trigger="click" :visible="tooltipIsOpenDefault" virtual-triggering :virtual-ref="toolTiptriggerRefDefault" popper-class="VTDefaultTooltip" :width="dataContentWidth">
            <span>{{ tooltipContentDefault }} <button class="p-1" @click="copyText"><font-awesome-icon icon="fa-regular fa-clone" /></button></span>
        </el-popover>
        <el-tooltip :virtual-ref="toolTiptriggerRefDefault" virtual-triggering :visible="copied" placement="top">
            <template #content>
                <span><font-awesome-icon icon='fa-solid fa-check' /><span class='ms-2'>Copied!</span></span>
            </template>
        </el-tooltip>
        <template v-if="tooltipRef">
            <el-tooltip :content="tooltipContent" placement="top" effect="dark" :trigger="tooltipTrigger" :visible="tooltipIsOpen" virtual-triggering :virtual-ref="toolTiptriggerRef" popper-class="VTtooltip" />
        </template>
    </div>
</template>
<style lang="scss">
@import "@/assets/scss/all.scss";

@keyframes rotate {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.inefi-table-v2 {
    .search_group {
        display: flex;
        justify-content: end;
        align-items: center;
        width: 100%;

        .el-input {
            width: 100%;
        }

        &.with-expansion {
            width: 250px;

            .show-search_bar {
                display: flex;
            }

            .search_bar {
                display: none;

                &.show {
                    display: block;
                }
            }
        }
    }

    .show-search_bar {
        display: none;
        justify-content: center;
        align-items: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1px solid #aaa;
    }
}

.reload.rotate {
    animation: rotate 1s linear infinite;
    &:hover{
        cursor: not-allowed;
    }
}

@include bstrp(lg) {
    .inefi-table-v2 {
        .search_group {
            width: 350px;

            &.with-expansion {
                width: 350px;

                .show-search_bar {
                    display: none;
                }

                .search_bar {
                    display: block;
                }
            }
        }

        .show-search_bar {
            display: none;
        }
    }
}



.canHover.inefi-table-v2 .vue-recycle-scroller__item-view.hover {
    transition: .3s;
    background-color: rgb(239, 239, 239);
}

.table-columns {
    display: flex;
    align-items: center;

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

    &.highlight-row {
        background-color: rgba(var(--prim-rgb), 0.2);
    }
}

.table-row_data {
    transition: .5s;
    overflow: hidden;

    * {
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

    .vue-recycle-scroller__item-view {
        &:last-child {

            .table-row,
            .fixed-left__table-row {
                border-bottom: none;
            }
        }
    }

    &.no-select * {
        user-select: none;
    }

    &:hover {
        .scroll-thumb {
            opacity: 1;
        }
    }
}

.inefi-table-v2__main {
    @extend .scrollbar-none;
    scroll-padding-bottom: 0;

    &::-webkit-scrollbar {
        display: none;
        ;
    }

    &::-webkit-scrollbar-track {
        display: none;
        ;
    }

    &::-webkit-scrollbar-thumb {
        display: none;
        ;
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

    &.highlight-row {
        background-color: rgba(var(--prim-rgb), 0.2);
    }
}

.darkMode {

    .table-row,
    .fixed-left__table-row {
        &.highlight-row {
            background-color: rgba(var(--prim-rgb), 0.2);
        }
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
    z-index: 20;

    // background-color: #faf;
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
    cursor: grab;

    &:active {
        cursor: grabbing;
    }
}

.load-notdone_hint {
    position: absolute;
    right: 0;
    top: 100%;
    z-index: 21;
    display: flex;
    align-items: center;

    * {
        color: #aaa;
    }
}

.searchTooltip {
    background: #828282;
    width: 200px;
}

.load-notdone_clear {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 20px;
    z-index: 200;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .clear-search {
        display: flex;
        align-items: center;
        border-radius: 12px;
        border: 1px solid $primary;
        background-color: #fff;

        * {
            font-size: 16px;
            color: $primary;
        }
    }

    p {
        text-align: center;
    }
}

.table-expansion {
    padding: 8px;
    border: 1px solid $primary;
    border-radius: 8px;
    color: $primary;
    @extend .fw-bold;

    &:hover {
        background-color: #e7f9ff;
    }

    &:active {
        border: 1px solid $primary;
    }

    &:focus {
        border: 1px solid $primary;
    }

    &.disable {
        border-color: #bbb;
        background-color: #ddd;
        color: #bbb;

        span {
            color: #bbb;
        }

        &:hover {
            cursor: not-allowed;
        }
    }
}

.el-popper.VTDefaultTooltip {
    padding: 6px 8px;
    box-sizing: content-box !important;
    display: flex;
    justify-content: center;
    align-items: center;
}
.nomoreData__slot{
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}
</style>