import getters from "@/store/scrollBatchLoad/getters.js";
import mutations from "@/store/scrollBatchLoad/mutations.js";
import actions from "@/store/scrollBatchLoad/actions.js";

// import convertUnixTimestamp from "@/utilit/convertUnixTimestamp";
const enrolled = {
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
        dataNum: 1,
    },
    getters:{
        ...getters,
        totalDeviceCount:(state, getters, rootState)=>rootState.scrollBatchLoad.totalDeviceCount,
    },
    mutations:{
        ...mutations,
        setNewData(state, data) {
            state.totalDataCount = data.total
            this.commit("scrollBatchLoad/setTotalData",data)
            state.allData.push(...data.list);
            state.batchesTrustList.push(true);
        },
    },
    actions: {
        ...actions,
        async batchLoadData({ dispatch, commit, state }, url) {
            state.loading = true;
            if (state.dataNum > 2) {
                url = "/data/devices/enrolledNew.json";
            }
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
        async checkTotalCountChange({ commit, state, getters }, data) {
            if (getters["totalDeviceCount"].total > 0 
            && getters["totalDeviceCount"].total !== data.total) {
                commit("allTrustListFalse");
                this.commit("scrollBatchLoad/connected/allTrustListFalse");
                this.commit("scrollBatchLoad/disconnected/allTrustListFalse");
                state.dataChangeCount =data.total - getters["totalDeviceCount"].total;

                this.commit("scrollBatchLoad/newUrl"); //
                if (state.dataChangeCount > 0 && state.loadStart) {
                    console.log("checkTotalCountChange/setEmptyObjects/enroll");
                    //資料有多
                    console.log(state.allData);
                    console.log(state.dataChangeCount);
                    commit("setEmptyObjects", state.dataChangeCount);
                }
            }
        },
    },
};
export default enrolled;
