const getters= {
    dataLoadDone(state) {
        return state.allData.length === state.totalDataCount
    },
    
}
export default getters