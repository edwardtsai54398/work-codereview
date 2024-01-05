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
    async getUntrustData({ dispatch, commit,state }, url) {
        state.loading = true;
        console.log("getUntrustData");
        let res = await dispatch("getDataAPI", { url });
        commit("setFalseData", res.list);
        state.loading = false;
    },
    
}
export default actions;