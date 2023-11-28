<script setup>
import { loadLocaleMessgae } from "@/lang/i18n";

function onLangChange(val){
    loadLocaleMessgae(val)
}
</script>
<template>
    <div class="row vertical" data-inset="1rem">
        <h1>{{ $t("header") }}</h1>
        <p>{{ $t("message.hello") }}</p>
        <br />
        <el-select v-model="$i18n.locale" @change="onLangChange">
            <el-option
                v-for="item in $i18n.availableLocales"
                :key="`locale-${item}`"
                :label="$i18n.getLocaleMessage(item).title"
                :value="item"
            />
        </el-select>
        <br />
    </div>
</template>