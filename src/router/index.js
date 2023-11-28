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
      next()
    }else{
      next(from.path)
    }
  }else{
    next()
  }
})



// function nestRoutes(routes){
//   let orgnizedRoutes = []
//   routes.forEach((route)=>{
//     if(route.path.split('/').length-1 === 1){
//       //如果是父路由
//       orgnizedRoutes.push(route)
//     }
//   })
//   return orgnizedRoutes
// }
//原本做法
// if(!store.state.user.isPremium){
//   router.removeRoute('insights')
// }
// const userRoutes = router.getRoutes(); 
// store.commit('setUserRoutes', nestRoutes(userRoutes));

export default router;