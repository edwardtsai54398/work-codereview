// import { defineAsyncComponent } from 'vue'
// const DeviceManagement = defineAsyncComponent(() => import('@/views/deviceManagement/DeviceManagementView.vue'))

// import Main from "@/views/MainView.vue"
import Dashboard from "@/views/DashboardView.vue"
// import DeviceManagement from "@/views/deviceManagement/DeviceManagementView.vue"
import Device from "@/views/deviceManagement/DeviceView.vue"
import Enroll from "@/views/deviceManagement/device/EnrolledView.vue"
import Connect from "@/views/deviceManagement/device/ConnectedView.vue"
import Disconnect from "@/views/deviceManagement/device/DisconnectedView.vue"
import Group from "@/views/deviceManagement/GroupView.vue"
import Package from "@/views/deviceManagement/PackageView.vue"
import Insights from "@/views/InsightsView.vue"
import GroupHealth from "@/views/GroupHealthView.vue"
import Administration from "@/views/administration/AdministrationView.vue"
import User from "@/views/administration/UserView.vue"
import Support from "@/views/SupportView.vue"
const routes = [
    {
        path: "/",
        name: "main",
        component: ()=>import("@/views/MainView.vue"),
        // component: Main,
        redirect: "/dashboard",
        children: [
            {
                path: "/dashboard",
                name: "dashboard",
                component: Dashboard,
                meta: { requiresPremium: false },
                icon: "fa-solid fa-chart-simple",
                title: "Dashboard",
            },
            {
                path: "/deviceManagement",
                name: "deviceManagement",
                component: () => import("@/views/deviceManagement/DeviceManagementView.vue"),
                // component: DeviceManagement,
                meta: { requiresPremium: false },
                icon: "fa-solid fa-hard-drive",
                title: "Device Management",
                redirect: "/deviceManagement/device",
                children: [
                    {
                        path: "device",
                        name: "device",
                        component: Device,
                        meta: { compoName: "DeviceView" },
                        title: "Device",
                        redirect: "/deviceManagement/device/enrolled",
                        children: [
                            {
                                path: "enrolled",
                                name: "enrolled",
                                props: true,
                                meta: { compoName: "EnrolledView" },
                                component: Enroll,
                            },
                            {
                                path: "connected",
                                name: "connected",
                                props: true,
                                meta: { compoName: "ConnectedView" },
                                component: Connect,
                            },
                            {
                                path: "disconnected",
                                name: "disconnected",
                                meta: { compoName: "DisconnectedView" },
                                props: true,
                                component: Disconnect,
                            },
                        ],
                    },
                    {
                        path: "group",
                        name: "group",
                        component: Group,
                        title: "Group",
                        meta: { compoName: "GroupView" },
                    },
                    {
                        path: "package",
                        name: "package",
                        component: Package,
                        title: "Package",
                        meta: { compoName: "PackageView" },
                    },
                ],
            },
            {
                path: "/insights",
                name: "insights",
                component: Insights,
                meta: { requiresPremium: true },
                icon: "fa-solid fa-arrow-trend-up",
                title: "Insights",
            },
            {
                path: "/groupHealth",
                name: "groupHealth",
                component: GroupHealth,
                meta: { requiresPremium: false },
                icon: "fa-solid fa-folder",
                title: "Group Health",
            },
            {
                path: "/administration",
                name: "administration",
                component: Administration,
                meta: { requiresPremium: false },
                icon: "fa-solid fa-gear",
                title: "Administration",
                redirect: "/administration/user",
                children: [
                    {
                        path: "user",
                        name: "user",
                        component: User,
                    },
                ],
            },
            {
                path: "/support",
                name: "support",
                component: Support,
                meta: { requiresPremium: false },
                icon: "fa-solid fa-headphones",
                title: "Support",
            },
        ],
    },
    {
        path: "/:pathMatch(.*)*",
        name: "not-found",
        component: () => import("@/views/NotFoundView.vue"), // 404 页面组件
    },
];
console.log("routes", routes);
export default routes;
