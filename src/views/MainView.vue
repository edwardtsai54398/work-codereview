<script setup>
import AsideComponent from "@/components/AsideComponent.vue";
import TopNavbar from "@/components/TopNavbar.vue";
import {useStore} from "vuex"
const store = useStore()
</script>
<template>
    <div class="web">
        
            <AsideComponent />
        <div class="layout-content">
            <TopNavbar />
            <div class="router_page layout-content">
                <router-view v-slot="{Component}">
                    <keep-alive :include="store.state.keepAlive.include">
                        <component :is="Component" />
                    </keep-alive>
                </router-view>
            </div>
        </div>
    </div>
</template>


<style lang="scss">
@import "@/assets/scss/all.scss";
.web {
    display: flex;
    height: 100vh; 
}
.router_page {
    background-color: #efefef;
}
</style>
