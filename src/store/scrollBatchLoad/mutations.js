function setEmptyObjects(offset, allData, changeCount){
    let emptyObjects = Array.from({ length:changeCount }, () => ({}));
    if(offset>0){
        console.log(emptyObjects);
        allData.splice(
            offset - changeCount,
            changeCount,
            ...emptyObjects
        );
    }
}
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
        console.log("setNewData",state.allData);
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
        console.log("setNextFalseData",data);
        data.forEach((newData, index) => {
            state.allData[state.offset + index] = newData;
        });
        state.batchesTrustList[state.offset / state.getDataLen] = true;
    },
    setFormerFalseData(state, data) {
        console.log("setFormerFalseData");
        console.log(data);
        let firstIndex = state.allData.findIndex(
            (gotData) => gotData[state.keyField] === data[0][state.keyField]
        );
        console.log("firstIndex",firstIndex);
        let endIndex = state.allData.findIndex(
            (gotData) =>gotData[state.keyField] ===data[data.length - 1][state.keyField]
            );
        console.log("endIndex",endIndex);
        let changeCount = state.getDataLen - (endIndex - firstIndex + 1);
            console.log("changeCount",changeCount);
        if (state.dataChangeCount > 0) {
            state.dataChangeCount = state.dataChangeCount - changeCount;
            console.log(state.dataChangeCount);
        }

        data.forEach((newData, index) => {
            state.allData[state.offset + index] = newData;
        });
        state.batchesTrustList[state.offset / state.getDataLen] = true;
        if (state.dataChangeCount > 0) {
            setEmptyObjects(state.offset, state.allData, state.dataChangeCount)
            console.log("dataChangeCount",state.dataChangeCount,state.allData);
        }
    },
    setEmptyObjects(state, length) {
        setEmptyObjects(state.offset, state.allData, length)
        console.log("setEmptyObjects", state.allData);
    },
}
export default mutations