import getters from "@/store/scrollBatchLoad/getters.js";
import mutations from "@/store/scrollBatchLoad/mutations.js";
import actions from "@/store/scrollBatchLoad/actions.js";

import convertUnixTimestamp from "@/utilit/convertUnixTimestamp";
const enrolled = {
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
        enrolled: 0,
        disconnected: 0,
        connected: 0,
        dataNum: 1,
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
            state.totalDataCount = data.total;
            state.enrolled = data.total;
            state.disconnected = data.disconnected;
            state.connected = data.connected;
            state.loadStart = true;
        },
        setNewData(state, data) {
            if (state.totalDataCount !== data.total) {
                for (let i = 0; i < state.batchesTrustList.length; i++) {
                    state.batchesTrustList[i] = false;
                }
                this.commit("scrollBatchLoad/disconnected/resetAllData");
                this.commit("scrollBatchLoad/connected/resetAllData");
                state.dataChangeCount = data.total - state.totalDataCount;
                if (state.dataChangeCount > 0) {
                    //資料有多
                    this.commit(
                        "scrollBatchLoad/enrolled/setEmptyObjects",
                        state.dataChangeCount
                    );
                    console.log(state.allData);
                }
                state.totalDataCount = data.total;
                state.enrolled = data.total;
                state.disconnected = data.disconnected;
                state.connected = data.connected;
            }
            data.list.forEach((data) => {
                data.timestamp = convertUnixTimestamp(data.timestamp);
            });
            console.log(data.list);

            state.allData.push(...data.list);
            state.batchesTrustList.push(true);
        },
    },
    actions: {
        ...actions,
        async batchLoadData({ dispatch, commit, state }, url) {
            if (!state.dataLoadDone && !state.allData[state.offset]) {
                state.loading = true;
                if (state.dataNum > 2) {
                    url = "/data/devices/enrolledNew.json";
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
        async getFormerZoneData({ dispatch, commit }, url) {
            url = "/data/devices/enrolledNew.json";
            let res = await dispatch("getDataAPI", { url });
            console.log(res);
            commit("setFormerFalseData", res.list);
        },
    },
};
export default enrolled;
