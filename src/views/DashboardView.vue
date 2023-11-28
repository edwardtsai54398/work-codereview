<script setup>
import { reactive } from "vue";
import CardComponent from "@/components/CardComponent.vue";
const donutGroup = reactive([
    {
        title: "Operating System",
        series: [17.4, 21.7, 21.7, 39.1],
        chartOptions: {
            chart: {
              width: 600,
              events:{
                // dataPointMouseEnter: donutChartMouseEnter,
                // dataPointMouseLeave: donutChartMouseLeave,
              }
            },
            labels: ["UNKNOWN", "Android", "Linux", "Windows"],
            colors: ["#dbdbdb", "#40e2b4", "#f8ac1a", "#29bfed"],
            legend: {
                position: "bottom",
            },
        },
    },
    {
        title: "Device Status",
        series: [100],
        chartOptions: {
            chart: {
              events:{
                // dataPointMouseEnter: 
              }
            },
            labels: ["NODATA"],
            colors: ["#c9c9c9"],
            legend: {
                position: "bottom",
            },
        },
    },
    {
        title: "Connneted Status",
        series: [97.1, 2.9],
        chartOptions: {
            chart: {
              events:{
                // dataPointMouseEnter: 
              }
            },
            labels: ["Disconnected", "Connected"],
            colors: ["#737373", "#29bfed"],
            legend: {
                position: "bottom",
            },
        },
    },
]);

const modelsProportion = reactive([
    {
        title: "VirtualBox",
        proportion: 17.4,
        customColor: "#29BFED",
    },
    {
        title: "EllijhLake",
        proportion: 13,
        customColor: "#89ADF3",
    },
    {
        title: "Razor",
        proportion: 8.7,
        customColor: "#54D752",
    },
    {
        title: "OTHERS",
        proportion: 60.9,
        customColor: "#44FFCA",
    },
]);
const insights = reactive([
    {
        title: "CPU Temperature",
    },
    {
        title: "CPU Utilization",
    },
    {
        title: "Package Assign Status",
    },
    {
        title: "Peripheral Status",
    },
]);
</script>
<template>
    <el-scrollbar height="100%">
        <div class="p-4 pb-0">
            <div class="pie_group row mb-2">
                <div class="col-12 col-lg-6 col-xl-4 mb-3" v-for="(item, index) in donutGroup" :key="index">
                    <CardComponent :title="item.title" class="p-4">
                        <template v-slot:content>
                            <div class="d-flex justify-content-center">
                                <apexchart
                                    width="400"
                                    type="donut"
                                    :options="item.chartOptions"
                                    :series="item.series"
                                ></apexchart>
                            </div>
                        </template>
                    </CardComponent>
                </div>
            </div>
            <div class="row">
                <div class="col-12 col-md-6 col-lg-5 col-xl-4">
                    <div class="top_models">
                        <h5 class="fw-bold mb-3 fs-3">Top 3 Models</h5>
                        <CardComponent>
                            <template v-slot:content>
                                <div class="p-3" v-for="item in modelsProportion" :key="item.title">
                                    <div class="d-flex align-items-center justify-content-between mb-1">
                                        <span class="fw-bold">{{item.title}}</span>
                                        <span>{{ item.proportion }} %</span>
                                    </div>
                                    <el-progress
                                        :percentage="item.proportion"
                                        :color="item.customColor"
                                        :stroke-width="10"
                                        :show-text="false"
                                    />
                                </div>
                            </template>
                        </CardComponent>
                    </div>
                </div>
                <div class="col-12 col-md-6 col-lg-7 col-xl-8">
                    <div class="insights">
                        <div
                            class="d-flex justify-content-between align-items-center mb-3"
                        >
                            <h5 class="fw-bold fs-3 mb-0">Your Insights</h5>
                            <el-button :icon="Search" round>Custom</el-button>
                        </div>
                        <div class="row">
                            <div
                                class="col-12 col-xl-6 col-xxl-4 mb-3"
                                v-for="(item, index) in insights"
                                :key="index"
                            >
                                <CardComponent class="p-4" :title="item.title">
                                    <template v-slot:content>
                                        <div style="height: 300px"></div>
                                        <div
                                            class="d-flex justify-content-end align-items-center"
                                        >
                                            <a href=""
                                                ><span class="me-2"
                                                    >Visit the list</span
                                                ><font-awesome-icon
                                                    icon="fa-solid fa-arrow-right"
                                            /></a>
                                        </div>
                                    </template>
                                </CardComponent>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </el-scrollbar>
</template>
