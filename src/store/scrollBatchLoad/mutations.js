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
    setFirstBatch(state, data) {
        state.allData.push(...data.list);
        state.batchesTrustList.push(true);
        state.totalDataCount = data.total;
        state.loadStart = true;
    },
    setNewData(state, data) {
        if (state.totalDataCount !== data.total) {
            for (let i = 0; i < state.offset / state.getDataLen; i++) {
                state.batchesTrustList[i] = false;
            }
            state.dataChangeCount = data.total - state.totalDataCount;
            if (state.dataChangeCount > 0) {
                //資料有多
                this.commit("scrollBatchLoad/setEmptyObjects",state.dataChangeCount);
            }
            state.totalDataCount = data.total;
        }
        console.log(data.list);
        state.allData.push(...data.list);
        state.batchesTrustList.push(true);
    },
    setOffset(state, offset) {
        state.offset = offset;
    },
    setFormerFalseData(state, data) {
        let firstIndex = state.allData.findIndex(
            (gotData) => gotData[state.keyField] === data[0][state.keyField]
        );
        
        let endIndex = state.allData.findIndex(
            (gotData) =>gotData[state.keyField] ===data[state.getDataLen - 1][state.keyField]
        );
        let changeCount = state.getDataLen - (endIndex - firstIndex + 1);
        if (state.dataChangeCount > 0) {
            state.dataChangeCount = state.dataChangeCount - changeCount;
        }
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