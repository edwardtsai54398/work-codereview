import axios from "axios";

export default {
    namespaced: true,
    state: {
        offset: 0,
        dataChangeCount: 0,
        dataLoadDone: false,
        loadStart: false,
        dataNum: 1,
        getDataLen: 0,
        keyField: "",
        allData: [],
        batchesTrustList:[],
        totalDataCount: 0,
    },
    getters: {},
    mutations: {
        setProps(state, { getDataLen, keyField }) {
            state.getDataLen = getDataLen;
            state.keyField = keyField;
        },
        setFirstBatch(state, data) {
            state.allData.push(...data.list);
            state.batchesTrustList.push(true)
            console.log(data.list);
            state.totalDataCount = data.total;
            state.loadStart = true;
        },
        setNewData(state, data) {
            if (state.totalDataCount !== data.total) {
                for(let i=0;i<state.offset/state.getDataLen;i++){
                    state.batchesTrustList[i] = false
                }
                state.dataChangeCount = data.total - state.totalDataCount
                if(state.dataChangeCount>0){
                    //資料有多
                    this.commit("scrollBatchLoad/setEmptyObjects", state.dataChangeCount)
                }
            }
            state.totalDataCount = data.total;
            if (data.list.length + state.allData.length === state.totalDataCount) {
                state.dataLoadDone = true;
                console.log("dataLoadDone");
            }
            console.log(data.list);
            state.allData.push(...data.list);
            state.batchesTrustList.push(true)
            
        },
        setOffset(state, offset) {
            state.offset = offset;
        },
        setFormerFalseData(state,data){
            console.log(data);
            let firstIndex = state.allData.findIndex((gotData)=>gotData[state.keyField] === data[0][state.keyField])
            console.log("firstIndex", firstIndex);
            let endIndex = state.allData.findIndex((gotData)=>gotData[state.keyField] === data[state.getDataLen-1][state.keyField])
            console.log("endIndex", endIndex);
            let changeCount = state.getDataLen - (endIndex - firstIndex+1)
            console.log("changeCount", changeCount);
            state.dataChangeCount = state.dataChangeCount - changeCount
            data.forEach((newData,index)=>{
                state.allData[state.offset+index] = newData
            })
            state.batchesTrustList[state.offset/state.getDataLen] = true
            console.log(state.allData);
            if(state.dataChangeCount>0){
                this.commit("scrollBatchLoad/setEmptyObjects", state.dataChangeCount)
            }
        },
        setEmptyObjects(state, length){
            let emptyObjects = Array.from({length},()=>({}))
            state.allData.splice(state.offset-length, length, ...emptyObjects)
        },
    },
    actions: {
        async batchLoadData({ dispatch, commit, state }, url) {
            if (!state.dataLoadDone) {
                let res;
                if(!state.allData[state.offset]){
                    if (state.dataNum <= 3) {
                        res = await axios.get(`${url}data${state.dataNum}.json`);
                        res = res.data;
                        state.dataNum += 1;
                        if (!state.loadStart) {
                            commit("setFirstBatch", res);
                        } else {
                            // console.log(res);
                            commit("setNewData", res);
                        }
                    } else {
                        let res = await dispatch("getDataAPI", {url: `${url}dataNew.json`});
                        // let res = await dispatch("getDataAPI", {url: `${url}dataLost.json`});
                        commit("setNewData", res);                 
                    }
                }
            }
        },
        async getFormerZoneData({ dispatch,commit }, url) {
            let res = await dispatch("getDataAPI", {url: `${url}dataNew.json`});
            // let res = await dispatch("getDataAPI", {url: `${url}dataLost.json`});
            console.log("getFormerZoneData");
            commit("setFormerFalseData", res.list);
        },
        async getDataAPI({state}, { url }) {
            //這裡只是模仿API抓index
            let res = await axios.get(`${url}`);
            let getData = res.data.list.filter((data) => {
                return (
                    data.index >= state.offset &&
                    data.index < state.offset + state.getDataLen
                );
            });
            getData = { list: getData, total: res.data.total };
            return getData
        },
    },
    modules: {},
};
