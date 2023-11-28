<script setup>
import {ref} from 'vue'
const columns= ref([
    {
        title: '名稱',
        key: 'name'
    },
    {
        title: '標籤',
        key: 'alias'
    },
])
const data= ref([
    {
        id: 'row-0',
        name: 'james_test',
        alias: 'aaaa'
    },
    {
        id: 'row-1',
        name: '123',
        alias: 'bbbbbb'
    },
])
</script>
<template>
    <div class="layout-content pop_message">
        <div class="title fw-bold p-3">良好</div>
        <el-auto-resizer>
            <template #default>
                <el-table-v2
                    :columns="columns"
                    :data="data"
                    :width="400"
                    :height="200"
                    fixed
                />
                    
            </template>
        </el-auto-resizer>
    </div>
</template>
<style lang="scss">
@import "@/assets/scss/all.scss";
.pop_message {
    border-radius: 24px;
    width: 400px;
    max-height: 400px;
    background-color: #fff;
    .title {
        color: #fff;
        font-size: 20px;
        background: linear-gradient(to left, $primary 30%, #75d6f4);
    }
}
</style>
