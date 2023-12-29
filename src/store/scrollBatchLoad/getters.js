const getters= {
    dataLoadTrust:(state)=>!state.batchesTrustList.some((boolean)=>!boolean),
    dataLoadDone:(state) => state.allData.length === state.totalDataCount 
        && state.allData.length !== 0
}
export default getters