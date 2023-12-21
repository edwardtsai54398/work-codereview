import axios from "axios";

export default {
    namespaced: true,
    state: {
        batchLoad: true,
        getDataLen: 0,
        keyField: "",
        offset: 0,
        dataChangeCount: 0,
        dataLoadDone: false,
        loadStart: false,
        dataNum: 1,
        allData: [],
        batchesTrustList: [],
        totalDataCount: 0,
    },
    getters: {},
    mutations: {
        setProps(state, { getDataLen, keyField }) {
            state.getDataLen = getDataLen;
            state.keyField = keyField;
        },
        resetAllData(state) {
            state.offset = 0;
            state.allData = [];
            state.dataChangeCount = 0;
            state.dataLoadDone = false;
            state.dataNum = 1;
            state.batchesTrustList = [];
            state.loadStart = false;
            state.totalDataCount = 0;
        },
        setFirstBatch(state, data) {
            state.allData.push(...data.list);
            state.batchesTrustList.push(true);
            console.log(data.list);
            state.totalDataCount = data.total;
            state.loadStart = true;
        },
        setNewData(state, data) {
            if (state.totalDataCount !== data.total) {
                for (let i = 0; i < state.offset / state.getDataLen; i++) {
                    state.batchesTrustList[i] = false;
                }
                state.dataChangeCount = data.total - state.totalDataCount;
                if (state.dataChangeCount > 0) {
                    //資料有多
                    this.commit(
                        "scrollBatchLoad/setEmptyObjects",
                        state.dataChangeCount
                    );
                }
                state.totalDataCount = data.total;
            }
            if (
                data.list.length + state.allData.length ===
                state.totalDataCount
            ) {
                state.dataLoadDone = true;
                console.log("dataLoadDone");
            }
            console.log(data.list);
            state.allData.push(...data.list);
            state.batchesTrustList.push(true);
        },
        setOffset(state, offset) {
            state.offset = offset;
        },
        setFormerFalseData(state, data) {
            console.log(data);
            let firstIndex = state.allData.findIndex(
                (gotData) => gotData[state.keyField] === data[0][state.keyField]
            );
            let endIndex = state.allData.findIndex(
                (gotData) =>
                    gotData[state.keyField] ===
                    data[state.getDataLen - 1][state.keyField]
            );
            let changeCount = state.getDataLen - (endIndex - firstIndex + 1);
            if (state.dataChangeCount > 0) {
                state.dataChangeCount = state.dataChangeCount - changeCount;
            }
            data.forEach((newData, index) => {
                state.allData[state.offset + index] = newData;
            });
            state.batchesTrustList[state.offset / state.getDataLen] = true;
            console.log(state.allData);
            if (state.dataChangeCount > 0) {
                this.commit(
                    "scrollBatchLoad/setEmptyObjects",
                    state.dataChangeCount
                );
            }
        },
        setEmptyObjects(state, length) {
            let emptyObjects = Array.from({ length }, () => ({}));
            state.allData.splice(
                state.offset - length,
                length,
                ...emptyObjects
            );
        },
    },
    actions: {
        async batchLoadData({ dispatch, commit, state }, url) {
            if (!state.dataLoadDone) {
                let res;
                if (!state.allData[state.offset]) {
                    if (state.dataNum <= 3) {
                        try {
                            res = await axios.get(`${url}data${state.dataNum}.json`);
                            res = res.data;
                            state.dataNum += 1;
                            if (!state.loadStart) {
                                commit("setFirstBatch", res);
                            } else {
                                commit("setNewData", res);
                            }
                        } catch (error) {
                            console.error("An error occurred:", error.message);
                        }
                    } else {
                        // let res = await dispatch("getDataAPI", {url: `${url}dataNew.json`,});
                        // let res = await dispatch("getDataAPI", {url: `${url}dataLost.json`});
                        let res = await dispatch("getDataAPI", {
                            url: `${url}dataTotalSame.json`,
                        });
                        commit("setNewData", res);
                    }
                    //實際發API
                    // let params = new URLSearchParams();
                    // params.append("offset", state.offset);
                    // params.append("requestNum", state.offset);
                    // res = await axios.post(url,params);
                    // if (!state.loadStart) {
                    //     commit("setFirstBatch", res.data);
                    // } else {
                    //     commit("setNewData", res.data);
                    // }
                }
            }
        },
        async getFormerZoneData({ dispatch, commit }, url) {
            // let res = await dispatch("getDataAPI", {url: `${url}dataNew.json`,});
            // let res = await dispatch("getDataAPI", {url: `${url}dataLost.json`});
            let res = await dispatch("getDataAPI", {
                url: `${url}dataTotalSame.json`,
            });
            commit("setFormerFalseData", res.list);
            // let params = new URLSearchParams();
            // params.append("offset", state.offset);
            // params.append("requestNum", state.offset);
            // res = await axios.post(url,params);
            // commit("setFormerFalseData", res.data.list);
        },
        async getDataAPI({ state }, { url }) {
            //這裡只是模仿API抓index
            try {
                let res = await axios.get(`${url}`);
                let getData = res.data.list.filter((data) => {
                    return (
                        data.index >= state.offset &&
                        data.index < state.offset + state.getDataLen
                    );
                });
                getData = { list: getData, total: res.data.total };
                return getData;
            } catch (error) {
                console.error("An error occurred:", error.message);
            }
        },
    },
    modules: {},
};
