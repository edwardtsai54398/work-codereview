import getters from "@/store/scrollBatchLoad/getters.js";
import mutations from "@/store/scrollBatchLoad/mutations.js";
import actions from "@/store/scrollBatchLoad/actions.js";
import deviceGetters from "@/store/scrollBatchLoad/modules/device/deviceGetters.js";
import deviceMutations from "@/store/scrollBatchLoad/modules/device/deviceMutations.js";
import deviceActions from "@/store/scrollBatchLoad/modules/device/deviceActions.js";

// import convertUnixTimestamp from "@/utilit/convertUnixTimestamp";
const connected = {
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
        totalDataCount:(state, getters, rootState)=>rootState.scrollBatchLoad.totalDeviceCount.connected,
    },
    mutations: {
        ...mutations,
        ...deviceMutations,
    },
    actions: {
        ...actions,
        ...deviceActions,
        async checkTotalCountChange({commit, state, getters }, data){
            if (getters["totalDeviceCount"].total !== data.total) {
                commit("allTrustListFalse")
                this.commit("scrollBatchLoad/enrolled/allTrustListFalse")
                this.commit("scrollBatchLoad/disconnected/allTrustListFalse")

                let dataChangeCount = data.connected - getters["totalDataCount"]
                if (dataChangeCount > 0 && state.loadStart) {
                    //資料有多
                    commit("setEmptyObjects",dataChangeCount);
                    // this.commit("scrollBatchLoad/enrolled/pushEmptyObject", data.total - getters["totalDeviceCount"].total);
                    // this.commit("scrollBatchLoad/disconnected/pushEmptyObject", data.disconnected - getters["totalDeviceCount"].disconnected);
                }
            }
        },
    },
};
export default connected;
