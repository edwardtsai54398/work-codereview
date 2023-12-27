// import state from "@/store/scrollBatchLoad/state.js";
import getters from "@/store/scrollBatchLoad/getters.js";
import mutations from "@/store/scrollBatchLoad/mutations.js";
import actions from "@/store/scrollBatchLoad/actions.js";

import convertUnixTimestamp from "@/utilit/convertUnixTimestamp";
const connected = {
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
        dataNum: 1,
    },
    getters,
    mutations: {
        ...mutations,
        setFirstBatch(state, data) {
            data.list.forEach((data) => {
                data.timestamp = convertUnixTimestamp(data.timestamp);
            });
            state.allData.push(...data.list);
            state.batchesTrustList.push(true);
            state.totalDataCount = data.connected;
            state.loadStart = true;
        },
        setNewData(state, data) {
            if (state.totalDataCount !== data.connected) {
                for (let i = 0; i < state.offset / state.getDataLen; i++) {
                    state.batchesTrustList[i] = false;
                }
                this.commit("scrollBatchLoad/disconnected/resetAllData");
                this.commit("scrollBatchLoad/enrolled/resetAllData");
                state.dataChangeCount = data.connected - state.totalDataCount;
                if (state.dataChangeCount > 0) {
                    //資料有多
                    this.commit(
                        "scrollBatchLoad/setEmptyObjects",
                        state.dataChangeCount
                    );
                }
                state.totalDataCount = data.connected;
            }
            data.list.forEach((data) => {
                data.timestamp = convertUnixTimestamp(data.timestamp);
            });

            state.allData.push(...data.list);
            state.batchesTrustList.push(true);
        },
    },
    actions: {
        ...actions,
        async batchLoadData({ dispatch, commit, state }, url) {
            if (!state.dataLoadDone && !state.allData[state.offset]) {
                state.loading = true;
                if (state.dataNum > 1) {
                    url = "/data/devices/connectedNew.json";
                    
                }
                try {
                    state.dataNum += 1;
                    let res = await dispatch("getDataAPI", { url });
                    if (!state.loadStart) {
                        commit("setFirstBatch", res);
                    } else {
                        commit("setNewData", res);
                    }
                } catch (error) {
                    console.error("An error occurred:", error.message);
                }
                state.loading = false;
            }
        },
    },
};
export default connected;
