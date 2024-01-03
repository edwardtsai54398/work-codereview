import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import store from './store'
const app = createApp(App)
app.use(router).use(store)

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
//element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
app.use(ElementPlus).component(ElementPlusIconsVue)

//font-awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChartSimple } from '@fortawesome/free-solid-svg-icons'
import { faArrowTrendUp } from '@fortawesome/free-solid-svg-icons'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { faHardDrive } from '@fortawesome/free-solid-svg-icons'
import { faFolder } from '@fortawesome/free-solid-svg-icons'
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons'
import { faHeadphones } from '@fortawesome/free-solid-svg-icons'
import { faCircleUser } from '@fortawesome/free-solid-svg-icons'
import { faCircleQuestion } from '@fortawesome/free-regular-svg-icons'
import { faEarthAmericas } from '@fortawesome/free-solid-svg-icons'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { faHouse } from '@fortawesome/free-solid-svg-icons'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { faArtstation } from '@fortawesome/free-brands-svg-icons'
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
import { faRotateRight } from '@fortawesome/free-solid-svg-icons'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { faList } from '@fortawesome/free-solid-svg-icons'
import { faCaretRight } from '@fortawesome/free-solid-svg-icons'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { faCircleMinus } from '@fortawesome/free-solid-svg-icons'
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons'
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { faTableColumns } from '@fortawesome/free-solid-svg-icons'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { faClone } from '@fortawesome/free-regular-svg-icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { faFileLines } from '@fortawesome/free-solid-svg-icons'
library.add(faChartSimple, faHardDrive, faArrowTrendUp, faFolder, faFolderOpen, 
    faGear, faHeadphones, faCircleUser, faEarthAmericas, faCircleQuestion,
    faArrowRight, faHouse, faTrash, faArtstation, faEllipsisVertical,faEllipsis, faArrowsRotate,
    faRotateRight,faChevronRight, faChevronLeft, faMagnifyingGlass, faList, faCaretRight, faPlus,
    faXmark, faCircleInfo, faCircleMinus, faCirclePlus,faCircleXmark, faBars, faTableColumns,
    faFilter, faClone, faCheck, faFileLines)
app.component('font-awesome-icon', FontAwesomeIcon)

//圖表套件
import VueApexCharts from "vue3-apexcharts"
app.use(VueApexCharts)

//i18n
import i18n from '@/lang/i18n'
app.use(i18n)

import VueVirtualScroller  from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
app.use(VueVirtualScroller)

//url
const prefixURL = ""
// const prefixURL = "/work-codereview"
app.provide('prefixURL', prefixURL);

app.mount('#app')
