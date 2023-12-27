// import state from "@/store/scrollBatchLoad/state.js"
import getters from "@/store/scrollBatchLoad/getters.js";
import mutations from "@/store/scrollBatchLoad/mutations.js";
import actions from "@/store/scrollBatchLoad/actions.js";

import convertUnixTimestamp from "@/utilit/convertUnixTimestamp";
const disconnected = {
    namespaced: true,
    state: {
        getDataLen: 0,
        keyField: "",
        offset: 0,
        dataChangeCount: 0,
        dataLoadDone: false,
        loadStart: false,
        loading: false,
        allData: [],
        batchesTrustList: [],
        totalDataCount: 0,
    },
    getters,
    mutations: {
        ...mutations,
        setFirstBatch(state, data) {
            data.list.forEach((data) => {
                data.timestamp = convertUnixTimestamp(data.timestamp);
            });
            console.log(data.list);
            state.allData.push(...data.list);
            state.batchesTrustList.push(true);
            state.totalDataCount = data.disconnected;
            state.loadStart = true;
        },
        setNewData(state, data) {
            if (state.totalDataCount !== data.disconnected) {
                for (let i = 0; i < state.offset / state.getDataLen; i++) {
                    state.batchesTrustList[i] = false;
                }
                this.commit("scrollBatchLoad/enrolled/resetAllData");
                this.commit("scrollBatchLoad/connected/resetAllData");
                state.dataChangeCount =data.disconnected - state.totalDataCount;
                if (state.dataChangeCount > 0) {
                    //資料有多
                    this.commit(
                        "scrollBatchLoad/setEmptyObjects",
                        state.dataChangeCount
                    );
                }
                state.totalDataCount = data.disconnected;
            }
            data.list.forEach((data) => {
                data.timestamp = convertUnixTimestamp(data.timestamp);
            });
            console.log(data.list);

            state.allData.push(...data.list);
            state.batchesTrustList.push(true);
        },
    },
    actions,
};
export default disconnected;
