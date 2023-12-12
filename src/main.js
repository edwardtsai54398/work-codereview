import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import store from './store'
const app = createApp(App)
app.use(router).use(store)

//element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
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
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { faTableColumns } from '@fortawesome/free-solid-svg-icons'
library.add(faChartSimple, faHardDrive, faArrowTrendUp, faFolder, faFolderOpen, 
    faGear, faHeadphones, faCircleUser, faEarthAmericas, faCircleQuestion,
    faArrowRight, faHouse, faTrash, faArtstation, faEllipsisVertical, faArrowsRotate,
    faRotateRight,faChevronRight, faChevronLeft, faMagnifyingGlass, faList, faCaretRight, faPlus,
    faXmark, faCircleInfo, faCircleMinus, faCirclePlus, faBars, faTableColumns)
app.component('font-awesome-icon', FontAwesomeIcon)

//圖表套件
import VueApexCharts from "vue3-apexcharts"
app.use(VueApexCharts)

//i18n
import i18n from '@/lang/i18n'
app.use(i18n)

//全域引入axios
// import axios from 'axios';
// import VueAxios from 'vue-axios'
// app.provide('axios', app.config.globalProperties.axios)
// app.use(VueAxios, axios)

//vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})
app.use(vuetify)

import VueVirtualScroller  from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
app.use(VueVirtualScroller)

app.mount('#app')
