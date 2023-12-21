<template>
    <div class="web">
        
            <AsideComponent />
        <div class="layout-content">
            <TopNavbar />
            <div class="router_page layout-content">
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>
<script setup>
import AsideComponent from "@/components/AsideComponent.vue";
import TopNavbar from "@/components/TopNavbar.vue";
</script>

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
