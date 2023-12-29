const mutations= {
    setProps(state, { getDataLen, keyField }) {
        state.getDataLen = getDataLen;
        state.keyField = keyField;
    },
    resetAllData(state) {
        state.offset = 0;
        state.allData = [];
        state.dataChangeCount = 0;
        state.batchesTrustList = [];
        state.loadStart = false;
        state.totalDataCount = 0;
    },
    setNewData(state, data) {
        state.totalDataCount = data.total
        state.allData.push(...data.list);
        console.log(state.allData);
        state.batchesTrustList.push(true);
    },
    setOffset(state, offset) {
        state.offset = offset;
    },
    allTrustListFalse(state){
        for (let i = 0; i < state.batchesTrustList.length; i++) {
            state.batchesTrustList[i] = false;
        }
    },
    setNextFalseData(state, data){
        console.log(data);
        data.forEach((newData, index) => {
            state.allData[state.offset + index] = newData;
        });
        state.batchesTrustList[state.offset / state.getDataLen] = true;
    },
    setFormerFalseData(state, data) {
        console.log(state.allData);
        console.log(data);
        let firstIndex = state.allData.findIndex(
            (gotData) => gotData[state.keyField] === data[0][state.keyField]
        );
        
        let endIndex = state.allData.findIndex(
            (gotData) =>gotData[state.keyField] ===data[data.length - 1][state.keyField]
        );
        let changeCount = state.getDataLen - (endIndex - firstIndex + 1);
        if (state.dataChangeCount > 0) {
            state.dataChangeCount = state.dataChangeCount - changeCount;
        }
        //
        data.forEach((newData, index) => {
            state.allData[state.offset + index] = newData;
        });
        state.batchesTrustList[state.offset / state.getDataLen] = true;
        if (state.dataChangeCount > 0) {
            this.commit(
                "scrollBatchLoad/setEmptyObjects",
                state.dataChangeCount
            );
        }
    },
    setEmptyObjects(state, length) {
        let emptyObjects = Array.from({ length }, () => ({}));
        state.allData.splice(
            state.offset - length,
            length,
            ...emptyObjects
        );
    },
    
}
export default mutations