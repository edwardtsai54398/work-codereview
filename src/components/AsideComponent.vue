<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import store from '@/store'
import {navList} from '@/assets/data/navList'
const router = useRouter();

const activePath = ref("/dashboard");
watch(router.currentRoute, (newPath) => {
    let strArr = newPath.path.split('/')
    activePath.value = `/${strArr[1]}`;
});
</script>

<template>
    <div class="aside d-none d-sm-block">
        <div class="logo_group pt-3">
            <div class="logo_img">
                <img src="@/assets/images/logo.jpg" alt="" />
            </div>
            <div class="plan d-none d-lg-block" v-if="store.state.user.isPremium">premium</div>
        </div>
        <nav class="aside_menu mt-3">
            <ul class="list-unstyled">
                <template  v-for="item in navList" :key="item.name">
                    <li class="nav-item menu_item" v-if="!item.meta.requiresPremium || store.state.user.isPremium" :class="{'is-active':activePath === item.path}">
                        <router-link
                            :to="item.path"
                            class="router_link menu_router_link py-3 ms-4"
                            @click="activePath=item.path"
                        >
                            <font-awesome-icon :icon="item.icon" />
                            <span class="d-none d-lg-block ms-3">{{
                                item.title
                            }}</span>
                        </router-link>
                    </li>
                </template>
            </ul>
        </nav>
    </div>
</template>

<style lang="scss" scoped>
@import "@/assets/scss/all.scss";
@import "@/assets/scss/components/aside.scss";
</style>
