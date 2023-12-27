<script setup>
import { defineProps} from 'vue'
import { defineEmits} from 'vue'
import {ref} from 'vue'
import {computed} from 'vue'
import { CaretBottom } from "@element-plus/icons-vue";
const props = defineProps({
    options: Array,
    loading: {
        type: Boolean,
        default: false
    },
    darkMode: {
        type: Boolean,
        default: false
    },
})
const emit = defineEmits([
    "sentParam"//傳送filter參數
])
const typeVal = ref(null)

const typeName  = computed(()=>{
    return typeVal.value ? props.options.find((option)=>option.dataKey == typeVal.value).typeName : ""
})
const typeOptions = computed(()=>{
    return typeVal.value ? props.options.find((option)=>option.dataKey == typeVal.value).options : []
})
const optionsVal = ref(null)
const optionName = ref("")

const popoverRef = ref(null)
const visible = ref(false)

function hidePopover(){
    popoverRef.value.hide()
}
function setParams(){
    let params = {
        type:typeVal.value,
        value:optionsVal.value
    }
    emit("sentParam", params)
    paramSended.value = true
    optionName.value = typeOptions.value.find((option)=>option.value == optionsVal.value).valName

    hidePopover()
}

//loading
const paramSended = ref(false)
</script>
<template>
    <span>
        <el-popover placement="bottom" :width="200" trigger="manual" popper-class="filter-popover" ref="popoverRef" :visible="visible"
        :effect="darkMode?'dark':'light'">
            <template #reference>
                <button class="table-expansion filter-expansion py-1 py-sm-2" :class="{disable:loading, sended:paramSended}" 
                    @click="visible = !visible" :disabled="loading">
                    <span v-show="!paramSended">
                        <font-awesome-icon icon="fa-solid fa-filter" />
                        <span class="d-none d-sm-inline ms-2">Add Filter</span>
                    </span>
                    <span v-if="paramSended" class="d-flex align-items-center">
                        <span class="fw-bold me-2">{{ typeName }}</span>
                        <span class="me-2" style="font-weight: 500">{{ optionName }}</span>
                        <button class="circle-closebtn"><font-awesome-icon icon="fa-solid fa-xmark" /></button>
                    </span>
                </button>
            </template>
            <el-select v-model="typeVal" class="mb-2" placeholder="Choose Type" :suffix-icon="CaretBottom" 
            :effect="darkMode?'dark':'light'" :disabled="paramSended">
                <el-option v-for="item in options" :key="item.dataKey" :label="item.typeName" :value="item.dataKey" />
            </el-select>
            <el-select v-model="optionsVal" :placeholder="`Choose ${typeName}`" :suffix-icon="CaretBottom"
            :disabled="!typeVal" :effect="darkMode?'dark':'light'">
                <el-option v-for="item in typeOptions" :key="item.value" :label="item.valName" :value="item.value" />
            </el-select>
            <div class="filter_button-group d-flex justify-content-end mt-3 align-items-center">
                <button @click="hidePopover">Cancel</button>
                <button class="color_prim ms-3" @click="setParams" :disable="!optionsVal">Apply</button>
            </div>
        </el-popover>
    </span>
</template>
<style lang="scss">
@import "@/assets/scss/all.scss";
.filter-popover{
    .el-input.is-focus{
        border-color: $primary;
    }
}
.filter-expansion{
    &.disable.sended{
        border-color:#bbb;
        background-color: #ddd;
        span{
            color: #bbb;
        }
    }
    &.sended{
        background-color: #e7f9ff;
    }
}
.circle-closebtn{
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: .5s;
    &:hover{
        background-color: $primary;
        color: #fff;
    }
}
</style>