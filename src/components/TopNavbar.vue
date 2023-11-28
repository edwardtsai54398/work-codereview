<script setup>
import DrawerMenu from "@/components/DrawerMenu.vue";
import { ref,watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

let store = useStore();
const router = useRouter()

const isSideMenuOpen = ref(false);
function mobileSideMenuToggle() {
    isSideMenuOpen.value = !isSideMenuOpen.value;
}

const navTitle = ref('dashboard')
watch(router.currentRoute, (newPath)=>{
    let str = newPath.path.split('/')[1]
    navTitle.value = str
})

import { loadLocaleMessgae } from "@/lang/i18n";

function onLangChange(val){
    loadLocaleMessgae(val)
}
</script>

<template>
    <el-drawer
        v-model="isSideMenuOpen"
        direction="ltr"
        :with-header="false"
        size="300"
    >
        <DrawerMenu @close="isSideMenuOpen=false"/>
    </el-drawer>
    <nav class="navbar top_navbar justify-content-end px-3 px-sm-5 gap-3">
        <div class="d-flex d-sm-none me-auto align-items-center">
            <div
                class="hamburger d-flex flex-column justify-content-between"
                @click="mobileSideMenuToggle"
            >
                <span></span><span></span><span></span>
            </div>
            <div class="route_title ms-3">{{ navTitle }}</div>
        </div>
        <div
            class="topnav_plan d-none d-sm-block d-lg-none"
            v-if="store.state.user.isPremium"
        >
            premium
        </div>
        <a href="#" class="topnav_item d-none d-sm-block">
            <font-awesome-icon icon="fa-regular fa-circle-question" />
        </a>
        <el-popover trigger="hover" placement="bottom">
            <template #reference>
                <div class="topnav_item">
                    <font-awesome-icon icon="fa-solid fa-earth-americas" />
                </div>
            </template>
            <el-menu mode="horizontal" @select="handleSelect" :default-active="$i18n.locale">
                <template v-for="item in $i18n.availableLocales" :key="`locale-${item}`">
                    <el-menu-item @click="onLangChange(item)" :index="item">
                        {{ $i18n.getLocaleMessage(item).title }}
                    </el-menu-item>
                </template>
            </el-menu>
        </el-popover>
        <div class="topnav_item">
            <font-awesome-icon icon="fa-solid fa-circle-user" />
        </div>
    </nav>
</template>

<style lang="scss" scoped>
@import "@/assets/scss/all.scss";
@import "@/assets/scss/components/topNav.scss";
</style>
