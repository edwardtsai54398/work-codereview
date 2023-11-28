<script setup>
import {deiveSubNavList} from '@/assets/data/navList'
</script>
<template>
    <div class="layout-content">
        <div class="page_title py-3 px-5 d-none d-xl-block">Device Management</div>
        <el-menu
            default-active="device"
            router="true"
            class="px-4 d-none d-sm-block"
            mode="horizontal"
        >
        <template v-for="(item, index) in deiveSubNavList" :key="index">
            <el-menu-item :index="item.path" :route="item.path">{{item.title}}</el-menu-item>
        </template>
        
        </el-menu>
        <div class="device_route_page p-0 p-sm-3 layout-content">
            <router-view></router-view>
        </div>
    </div>
</template>
<style lang="scss">
@import "@/assets/scss/all.scss";
.page_title{
    font-size: 1.5rem;
    color: #666;
    font-weight: 700;
}

</style>
