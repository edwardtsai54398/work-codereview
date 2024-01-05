import { createRouter, createWebHashHistory } from 'vue-router';
import store from '../store'
import routes from './routes'
import DeviceManagement from "@/views/deviceManagement/DeviceManagementView.vue"

routes[0].children[1].component = DeviceManagement

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next)=>{
  if(to.meta.requiresPremium){
    if(store.state.user.isPremium){
      store.commit("pushInclude", to.meta.compoName)
      next()
    }else{
      next(from.path)
    }
  }else{
    store.commit("pushInclude", to.meta.compoName)
    next()
  }
})

export default router;