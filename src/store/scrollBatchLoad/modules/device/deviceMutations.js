const deviceMutations = {
    setNewData(state, data) {
        this.commit("scrollBatchLoad/setTotalData",data)
        if(state.filterOn){
            state.filterData.push(...data.list);
            state.filterTrustList.push(true);
        }else{
            state.allData.push(...data.list);
            state.batchesTrustList.push(true);
        }
    },
    pushEmptyObject(state,length){
        let emptyObjects = Array.from({ length }, () => ({}));
        state.allData.push(...emptyObjects)
        // console.log("pushEmptyObject",state.allData);
    }
};
export default deviceMutations;