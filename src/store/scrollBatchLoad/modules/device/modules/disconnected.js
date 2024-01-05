// import state from "@/store/scrollBatchLoad/state.js"
import getters from "@/store/scrollBatchLoad/getters.js";
import mutations from "@/store/scrollBatchLoad/mutations.js";
import actions from "@/store/scrollBatchLoad/actions.js";
import deviceGetters from "@/store/scrollBatchLoad/modules/device/deviceGetters.js";
import deviceMutations from "@/store/scrollBatchLoad/modules/device/deviceMutations.js";
import deviceActions from "@/store/scrollBatchLoad/modules/device/deviceActions.js";

// import convertUnixTimestamp from "@/utilit/convertUnixTimestamp";
const disconnected = {
    namespaced: true,
    state: {
        getDataLen: 0,
        keyField: "",
        offset: 0,
        loadStart: false,
        loading: false,
        allData: [],
        batchesTrustList: [],
    },
    getters:{
        ...getters,
        ...deviceGetters,
        totalDataCount:(state, getters, rootState)=>rootState.scrollBatchLoad.totalDeviceCount.disconnected,
    },
    mutations:{
        ...mutations,
        ...deviceMutations,
    },
    actions:{
        ...actions,
        ...deviceActions,
        async checkTotalCountChange({commit, state, getters }, data){
            console.log("discconet/checkTotalCountChange",data);
            if (getters["totalDataCount"] > 0 
            && getters["totalDataCount"] !== data.disconnected) {
                commit("allTrustListFalse")
                this.commit("scrollBatchLoad/connected/allTrustListFalse")
                this.commit("scrollBatchLoad/enrolled/allTrustListFalse")

                let dataChangeCount = data.disconnected - getters["totalDataCount"]
                if (dataChangeCount > 0 && state.loadStart) {
                    //資料有多
                    commit("setEmptyObjects", dataChangeCount);
                    // this.commit("scrollBatchLoad/connected/pushEmptyObject", data.connected - getters["totalDeviceCount"].connected);
                    // this.commit("scrollBatchLoad/enrolled/pushEmptyObject", data.total - getters["totalDeviceCount"].total);
                }
            }
        },
    }
};
export default disconnected;
