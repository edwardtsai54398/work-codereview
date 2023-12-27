import axios from "axios";
const actions = {
    async batchLoadData({ dispatch, commit, state }, url) {
        if (!state.dataLoadDone && !state.allData[state.offset]) {
            state.loading = true;
            try {
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
        let res = await dispatch("getDataAPI", { url });
        commit("setFormerFalseData", res.list);
    },
    async getDataAPI({ state }, { url }) {
        //這裡只是模仿API抓index
        try {
            let res = await axios.get(`${url}`);
            let getData = res.data.result.list.filter((data) => {
                return (
                    data.index >= state.offset &&
                    data.index < state.offset + state.getDataLen
                );
            });
            getData = {
                list: getData,
                total: res.data.result.total,
                connected: res.data.result.connected,
                disconnected: res.data.result.disconnected,
            };
            return getData;
        } catch (error) {
            console.error("An error occurred:", error.message);
        }
    },
};
export default actions;
