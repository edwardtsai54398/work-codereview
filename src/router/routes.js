const routes = [
    {
        path: "/",
        name: "main",
        component: () => import("@/views/MainView.vue"),
        redirect: "/dashboard",
        children: [
            {
                path: "/dashboard",
                name: "dashboard",
                component: () => import("@/views/DashboardView.vue"),
                meta: { requiresPremium: false },
                icon: "fa-solid fa-chart-simple",
                title: "Dashboard",
            },
            {
                path: "/deviceManagement",
                name: "deviceManagement",
                component: () =>
                    import("@/views/deviceManagement/DeviceManagement.vue"),
                meta: { requiresPremium: false },
                icon: "fa-solid fa-hard-drive",
                title: "Device Management",
                redirect: "/deviceManagement/device/enrolled",
                children: [
                    {
                        path: "device",
                        name: "device",
                        component: () =>
                            import("@/views/deviceManagement/DeviceView.vue"),
                        meta: { compoName: "DeviceView" },
                        title: "Device",
                        redirect: "/deviceManagement/device/enrolled",
                        children: [
                            {
                                path: "enrolled",
                                name: "enrolled",
                                props: true,
                                meta: { compoName: "EnrolledView" },
                                component: () =>import("@/views/deviceManagement/device/EnrolledView.vue"),
                            },
                            {
                                path: "connected",
                                name: "connected",
                                props: true,
                                meta: { compoName: "ConnectedView" },
                                component: () =>import("@/views/deviceManagement/device/ConnectedView.vue"),
                            },
                            {
                                path: "disconnected",
                                name: "disconnected",
                                meta: { compoName: "DisconnectedView" },
                                props: true,
                                component: () =>import("@/views/deviceManagement/device/DisconnectedView.vue"),
                            },
                        ],
                    },
                    {
                        path: "group",
                        name: "group",
                        component: () =>
                            import("@/views/deviceManagement/GroupView.vue"),
                        title: "Group",
                        meta: { compoName: "GroupView" },
                    },
                    {
                        path: "package",
                        name: "package",
                        component: () =>
                            import("@/views/deviceManagement/PackageView.vue"),
                        title: "Package",
                        meta: { compoName: "PackageView" },
                    },
                ],
            },
            {
                path: "/insights",
                name: "insights",
                component: () => import("@/views/InsightsView.vue"),
                meta: { requiresPremium: true },
                icon: "fa-solid fa-arrow-trend-up",
                title: "Insights",
            },
            {
                path: "/groupHealth",
                name: "groupHealth",
                component: () => import("@/views/GroupHealthView.vue"),
                meta: { requiresPremium: false },
                icon: "fa-solid fa-folder",
                title: "Group Health",
            },
            {
                path: "/administration",
                name: "administration",
                component: () =>
                    import("@/views/administration/AdministrationView.vue"),
                meta: { requiresPremium: false },
                icon: "fa-solid fa-gear",
                title: "Administration",
                redirect: "/administration/user",
                children: [
                    {
                        path: "user",
                        name: "user",
                        component: () =>
                            import("@/views/administration/UserView.vue"),
                    },
                ],
            },
            {
                path: "/support",
                name: "support",
                component: () => import("@/views/SupportView.vue"),
                meta: { requiresPremium: false },
                icon: "fa-solid fa-headphones",
                title: "Support",
            },
            {
                path: "/deviceManagement/groupMobile",
                name: "groupMobile",
                component: () =>
                    import("@/views/deviceManagement/GroupMobileView.vue"),
                meta: { requiresPremium: false },
                icon: "fa-brands fa-artstation",
                title: "Group PWA",
            },
        ],
    },
    {
        path: "/:pathMatch(.*)*",
        name: "not-found",
        component: () => import("@/views/NotFoundView.vue"), // 404 页面组件
    },
];
export default routes;
