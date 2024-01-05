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
    async getUntrustData({ dispatch, commit,state }, url) {
        state.loading = true;
        console.log("getNextUntrustData");
        let res = await dispatch("getDataAPI", { url });
        commit("setFalseData", res.list);
        state.loading = false;
    },
    async checkTotalCountChange({commit, state }, data){
        if (state.totalDataCount !== data.total) {
            commit("allTrustListFalse")
            let dataChangeCount = data.total - state.totalDataCount;
            if (dataChangeCount > 0) {
                //資料有多
                commit("setEmptyObjects", data.list);
            }
        }
    },
    async getDataAPI({ state }, { url }) {
        //這裡只是模仿API抓index
        console.log(`getData:${state.offset}~${state.offset + state.getDataLen-1}`);
        try {
            let res = await axios.get(`${url}`);
            let getData = res.data.result.list.filter((data) => 
                state.filterOn
                ? (data.index >= state.offset && data.index < state.offset + state.getDataLen && data.os == "Windows")
                : (data.index >= state.offset && data.index < state.offset + state.getDataLen)
            );
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
