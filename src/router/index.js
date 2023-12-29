import { createRouter, createWebHashHistory } from 'vue-router';
import store from '../store'
import routes from './routes'

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next)=>{
  if(to.meta.requiresPremium){
    if(store.state.user.isPremium){
      store.commit("pushInclude", to.meta.compoName)
      next()
      console.log(to.name);
    }else{
      next(from.path)
    }
  }else{
    store.commit("pushInclude", to.meta.compoName)
    next()
    console.log(to.name);
  }
})

export default router;