const getters= {
    allDataReference:(state)=>state.filterOn ? state.filterData : state.allData,
    dataLoadTrust:(state)=> state.filterOn ? !state.filterTrustList.some((boolean)=>!boolean) : !state.batchesTrustList.some((boolean)=>!boolean),
    dataLoadDone:(state) =>state.filterOn ? state.filterData.length === state.totalDataCount  : state.allData.length === state.totalDataCount 
        && state.allData.length !== 0
}
export default getters