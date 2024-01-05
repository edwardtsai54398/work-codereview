import routes from '@/router/routes'
let navArr = routes.find((route)=>route.name === 'main')
const navList = navArr.children
const device = navList.find((route)=>route.name === 'deviceManagement')
const administration = navList.find((route)=>route.name === 'administration')
const deiveSubNavList = device.children
const adminisSubNavList = administration.children
export {navList, deiveSubNavList, adminisSubNavList}