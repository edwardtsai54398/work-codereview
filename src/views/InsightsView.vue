<script setup>
import CardComponent from "@/components/CardComponent.vue";
</script>
<template>
    <div class="layout-content p-3">
        <div class="pb-3" style="background-color:#fa0;height:60px;">

        </div>
        <CardComponent class="layout-content p-3" style="background-color: #a0a;">
            <template v-slot:content>
                <div class="layout-content flex-row">
                    <div class="tree_group layout-content overflow-auto w-25" style="border-right: 1px solid #aaa;background-color: #a00;">
                        <p class="p-3 border-b mb-0" v-for="n in 20" :key="n">
                            content
                        </p>
                    </div>
                    <div class="layout-content w-75"></div>
                </div>
            </template>
        </CardComponent>
    </div>
</template>
<style lang="scss">
@import "@/assets/scss/all.scss";

.highLight {
    font-weight: 700;
    color: $primary;
    cursor: pointer;
}

.border-b {
    border-bottom: 1px solid #aaa;
}
</style>
