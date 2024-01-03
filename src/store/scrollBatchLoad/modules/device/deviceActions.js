const actions = {
    async batchLoadData({ dispatch, commit, state }, url) {
        state.loading = true;
        try {
            state.dataNum += 1;
            let res = await dispatch("getDataAPI", { url });
            console.log(res);
            await dispatch("checkTotalCountChange", res);
            if (!state.loadStart) {
                state.loadStart = true
            }
            commit("setNewData", res);
        } catch (error) {
            console.error("An error occurred:", error.message);
        }
        state.loading = false;
    },
    async getNextUntrustData({ dispatch, commit,state }, url) {
        state.loading = true;
        console.log("getNextUntrustData");
        let res = await dispatch("getDataAPI", { url });
        dispatch("checkTotalCountChange", res)
        commit("setNextFalseData", res.list);
        state.loading = false;
    },
    async getFormerZoneData({ dispatch, commit, state }, url) {
        state.loading = true;
        console.log("getFormerZoneData");
        let res = await dispatch("getDataAPI", { url });
        dispatch("checkTotalCountChange", res)
        commit("setFormerFalseData", res.list);
        state.loading = false;
    },
}
export default actions;