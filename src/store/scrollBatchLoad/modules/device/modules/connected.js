import getters from "@/store/scrollBatchLoad/getters.js";
import mutations from "@/store/scrollBatchLoad/mutations.js";
import actions from "@/store/scrollBatchLoad/actions.js";
import deviceGetters from "@/store/scrollBatchLoad/modules/device/deviceGetters.js";
import deviceActions from "@/store/scrollBatchLoad/modules/device/deviceActions.js";

// import convertUnixTimestamp from "@/utilit/convertUnixTimestamp";
const connected = {
    namespaced: true,
    state: {
        getDataLen: 0,
        keyField: "",
        offset: 0,
        dataChangeCount: 0,
        loadStart: false,
        loading: false,
        allData: [],
        batchesTrustList: [],
        totalDataCount: 0,
    },
    getters:{
        ...getters,
        ...deviceGetters
    },
    mutations: {
        ...mutations,
        setNewData(state, data) {
            state.totalDataCount = data.connected
            this.commit("scrollBatchLoad/setTotalData", data)
            state.allData.push(...data.list);
            state.batchesTrustList.push(true)
        },
    },
    actions: {
        ...actions,
        ...deviceActions,
        async checkTotalCountChange({commit, state, getters }, data){
            if (getters["totalDeviceCount"].total !== data.total) {
                commit("allTrustListFalse")
                this.commit("scrollBatchLoad/enrolled/allTrustListFalse")
                this.commit("scrollBatchLoad/disconnected/allTrustListFalse")
                state.dataChangeCount = data.total - getters["totalDeviceCount"].total;
                if (state.dataChangeCount > 0 && state.loadStart) {
                    //資料有多
                    commit("setEmptyObjects",state.dataChangeCount);
                }
            }
        },
    },
};
export default connected;
