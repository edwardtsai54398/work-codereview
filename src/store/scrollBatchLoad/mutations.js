const mutations = {
    setProps(state, { getDataLen, keyField }) {
        state.getDataLen = getDataLen;
        state.keyField = keyField;
    },
    resetAllData(state) {
        state.offset = 0;
        if(state.filterOn){
            state.filterData = [];
            state.filterTrustList = [];
        }else{
            state.allData = [];
            state.batchesTrustList = [];
        }
        state.loadStart = false;
        state.totalDataCount = 0;
    },
    resetLoadStart(state){
        state.offset = 0;
        state.loadStart = false;
    },
    setNewData(state, data) {
        state.totalDataCount = data.total;
        if(state.filterOn){
            state.filterData.push(...data.list);
            state.filterTrustList.push(true);
        }else{
            state.allData.push(...data.list);
            state.batchesTrustList.push(true);
        }
    },
    setOffset(state, offset) {
        state.offset = offset;
    },
    setFilterOn(state, value){
        state.filterOn = value
        if(!value){
            state.filterData = []
            state.filterTrustList = []
        }
    },
    allTrustListFalse(state) {
        if(state.filterOn){
            for (let i = 0; i < state.filterTrustList.length; i++) {
                state.filterTrustList[i] = false;
            }
        }
        for (let i = 0; i < state.batchesTrustList.length; i++) {
            state.batchesTrustList[i] = false;
        }
    },
    setFalseData(state, data) {
        console.log("setFalseData", data);
        let formerDatas = state.allData.filter(
            (obj, index) => index < state.offset
        );
        data.forEach((newData, index) => {
            if (formerDatas.length) {
                let sameObjIndex = formerDatas.findIndex(
                    (obj) => newData[state.keyField] == obj[state.keyField]
                );
                if (sameObjIndex >= 0) {
                    state.allData[sameObjIndex] = {};
                }
            }
            state.allData[state.offset + index] = newData;
        });
        console.log("setFalseData", state.allData);

        state.batchesTrustList[state.offset / state.getDataLen] = true;
    },
    setEmptyObjects(state, data) {
        let formerDatas = state.allData.filter((obj, index) => index < state.offset);
        if(state.filterOn){
            formerDatas = state.filterData.filter((obj, index) => index < state.offset);
        }
        data.forEach((newData) => {
            if (formerDatas.length) {
                let sameObjIndex = formerDatas.findIndex((obj) => newData[state.keyField] == obj[state.keyField]);
                if (sameObjIndex >= 0) {
                    if(state.filterOn){
                        state.filterData[sameObjIndex] = {};
                    }else{
                        state.allData[sameObjIndex] = {};
                    }
                }
            }
        });
        // console.log("setEmptyObjects", state.allData);
    },
};
export default mutations;
