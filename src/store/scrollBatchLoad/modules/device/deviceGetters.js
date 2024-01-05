const getters= {
    dataLoadDone:(state, getters) => state.allData.length === getters["totalDataCount"] 
        && state.allData.length !== 0,
    totalDeviceCount:(state, getters, rootState)=>rootState.scrollBatchLoad.totalDeviceCount,
}
export default getters