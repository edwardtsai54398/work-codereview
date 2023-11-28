<script setup></script>
<template>
    <div class="bigcard-component">
        <slot name="content"></slot>
    </div>
</template>
<style lang="scss">
@import "@/assets/scss/all.scss";
.bigcard-component {
    background-color: #fff;
}
@include bstrp(sm) {
    .bigcard-component {
        border-radius: 12px;
        box-shadow: 8px 8px 20px 0px rgba(0, 0, 0, 0.3);
    }
}
</style>
