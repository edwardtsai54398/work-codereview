<script setup>
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { navList } from "@/assets/data/navList";
const store = useStore();
const router = useRouter();

const activePath = ref("/dashboard");
watch(router.currentRoute, (newPath) => {
    activePath.value = newPath.path;
});
onMounted
</script>
<template>
    <div
        class="py-2 d-flex justify-content-between align-items-center"
        style="border-bottom: 1px solid #aaa"
    >
        <img
            src="@/assets/images/drawer_logo.webp"
            alt="inefi logo"
            width="150"
        />
        <div class="user_plan py-1 px-2 fz-6 fw-bold" v-if="store.state.user.isPremium">premium</div>
    </div>
    <el-menu
        :default-active="activePath"
        class="el-menu-vertical-demo"
        @open="handleOpen"
        @close="handleClose"
    >
        <template v-for="(item, index) in navList" :key="index">
            <template
                v-if="!item.meta.requiresPremium || store.state.user.isPremium"
            >
                <template v-if="!item.children">
                    <el-menu-item :index="item.path">
                        <router-link :to="item.path" class="d-flex align-items-center flex-grow-1" @click="$emit('close')">
                            <font-awesome-icon :icon="item.icon" />
                            <span class="ms-3">{{ item.title }}</span>
                        </router-link>
                    </el-menu-item>
                </template>
                <template v-if="item.children && item.children.length > 0">
                    <el-sub-menu :index="item.path">
                        <template #title>
                            <font-awesome-icon :icon="item.icon" />
                            <span class="ms-3">{{ item.title }}</span>
                        </template>
                        <template
                            v-for="(subItem, i) in item.children"
                            :key="i"
                        >
                            <el-menu-item :index="subItem.path">
                                <router-link :to="`${item.path}/${subItem.path}`" class="flex-grow-1" @click="$emit('close')">{{ subItem.title }}</router-link>
                            </el-menu-item>
                        </template>
                    </el-sub-menu>
                </template>
            </template>
        </template>
    </el-menu>
</template>
<style lang="scss">
@import "@/assets/scss/all.scss";
.user_plan {
    color: $primary;
    background-color: #d4f0f9;
    border-radius: 4px;
    text-transform: uppercase;
}
.el-menu {
    border: none;
    *{
        color: $secondary;
    }
}
.is-active>a{
    color: $primary;
    &>*{
        color: $primary;
    }
}
</style>
