// import state from "@/store/scrollBatchLoad/state.js"
import getters from "@/store/scrollBatchLoad/getters.js";
import mutations from "@/store/scrollBatchLoad/mutations.js";
import actions from "@/store/scrollBatchLoad/actions.js";
import deviceGetters from "@/store/scrollBatchLoad/modules/device/deviceGetters.js";
import deviceActions from "@/store/scrollBatchLoad/modules/device/deviceActions.js";

// import convertUnixTimestamp from "@/utilit/convertUnixTimestamp";
const disconnected = {
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
    mutations:{
        ...mutations,
        setNewData(state, data) {
            state.totalDataCount = data.disconnected
            this.commit("scrollBatchLoad/setTotalData", data)
            state.allData.push(...data.list);
            state.batchesTrustList.push(true)
        },
    },
    actions:{
        ...actions,
        ...deviceActions,
        async checkTotalCountChange({commit, state, getters }, data){
            console.log("discconet/checkTotalCountChange",data);
            if (getters["totalDeviceCount"].total > 0 
            && getters["totalDeviceCount"].disconnected !== data.disconnected) {
                commit("allTrustListFalse")
                this.commit("scrollBatchLoad/connected/allTrustListFalse")
                this.commit("scrollBatchLoad/enrolled/allTrustListFalse")
                state.dataChangeCount = data.disconnected - getters["totalDeviceCount"].disconnected;
                console.log(state.dataChangeCount);
                if (state.dataChangeCount > 0 && state.loadStart) {
                    //資料有多
                    commit("setEmptyObjects",state.dataChangeCount);
                }
            }
        },
    }
};
export default disconnected;
