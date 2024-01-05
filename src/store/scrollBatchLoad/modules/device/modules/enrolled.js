import getters from "@/store/scrollBatchLoad/getters.js";
import mutations from "@/store/scrollBatchLoad/mutations.js";
import actions from "@/store/scrollBatchLoad/actions.js";
import deviceGetters from "@/store/scrollBatchLoad/modules/device/deviceGetters.js";
import deviceMutations from "@/store/scrollBatchLoad/modules/device/deviceMutations.js";
import deviceActions from "@/store/scrollBatchLoad/modules/device/deviceActions.js";

// import convertUnixTimestamp from "@/utilit/convertUnixTimestamp";

const prefixURL = ""
// const prefixURL = "/work-codereview"
const enrolled = {
    namespaced: true,
    state: {
        getDataLen: 0,
        keyField: "",
        offset: 0,
        loadStart: false,
        loading: false,
        allData: [],
        batchesTrustList: [],
        filterOn: false,
        filterData:[],
        filterTrustList: [],
        dataNum: 1,
    },
    getters:{
        ...getters,
        ...deviceGetters,
        totalDataCount:(state, getters, rootState)=>rootState.scrollBatchLoad.totalDeviceCount.total,
    },
    mutations:{
        ...mutations,
        ...deviceMutations,

    },
    actions: {
        ...actions,
        ...deviceActions,
        async batchLoadData({ dispatch, commit, state }, url) {
            state.loading = true;
            if (state.dataNum > 2) {
                url = `${prefixURL}/data/devices/enrolledNew.json`;
            }
            try {
                state.dataNum += 1;
                let res = await dispatch("getDataAPI", { url });
                console.log(res);
                await dispatch("checkTotalCountChange", res);
                if (!state.loadStart) {
                    state.loadStart = true
                }
                commit("setNewData", res);
            } catch (error) {
                console.error("An error occurred:", error.message);
            }
            state.loading = false;
        },
        async checkTotalCountChange({ commit, state, getters }, data) {
            if (getters["totalDeviceCount"].total > 0 
            && getters["totalDataCount"] !== data.total) {
                commit("allTrustListFalse");
                this.commit("scrollBatchLoad/connected/allTrustListFalse");
                this.commit("scrollBatchLoad/disconnected/allTrustListFalse");

                this.commit("scrollBatchLoad/newUrl"); //

                let dataChangeCount = data.total - getters["totalDataCount"]
                if (dataChangeCount > 0 && state.loadStart) {
                    console.log("checkTotalCountChange/setEmptyObjects/enroll");
                    //資料有多
                    commit("setEmptyObjects", data.list);
                    // this.commit("scrollBatchLoad/connected/pushEmptyObject", data.connected - getters["totalDeviceCount"].connected);
                    // this.commit("scrollBatchLoad/disconnected/pushEmptyObject", data.disconnected - getters["totalDeviceCount"].disconnected);
                }
            }
        },
    },
};
export default enrolled;
