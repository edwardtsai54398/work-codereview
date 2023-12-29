import axios from "axios";
const actions = {
    async batchLoadData({ dispatch, commit, state }, url) {
            state.loading = true;
            try {
                let res = await dispatch("getDataAPI", { url });
                if (!state.loadStart) {
                    state.loadStart = true;
                } else {
                    await dispatch("checkTotalCountChange",res)
                }
                commit("setNewData", res);
            } catch (error) {
                console.error("An error occurred:", error.message);
            }
            state.loading = false;
    },
    async getNextUntrustData({ dispatch, commit }, url) {
        let res = await dispatch("getDataAPI", { url });
        commit("setNextFalseData", res.list);
    },
    async getFormerZoneData({ dispatch, commit }, url) {
        let res = await dispatch("getDataAPI", { url });
        commit("setFormerFalseData", res.list);
    },
    async checkTotalCountChange({commit, state }, data){
        if (state.totalDataCount !== data.total) {
            commit("allTrustListFalse")
            state.dataChangeCount = data.total - state.totalDataCount;
            console.log("dataChangeCount", state.dataChangeCount);
            if (state.dataChangeCount > 0) {
                //資料有多
                commit("setEmptyObjects",state.dataChangeCount);
            }
        }
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
