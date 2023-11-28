import arr from "@/assets/data/batchLoadData";

export default {
    namespaced: true,
    state: {
        arr,
        newData: [],
    },
    getters: {},
    mutations: {
        deleteData(state, i) {
            state.arr.splice(i, 1);
            this.commit("scrollBatchLoad/reorder")
        },
        addData(state, id) {
            let data = {
                id,
                index: 100,
            };
            state.arr.splice(100, 0, data);
            this.commit("scrollBatchLoad/reorder")
        },
        reorder(state) {
            state.arr.forEach((data, index) => {
                data.index = index;
            });
        },

    },
    actions: {
        batchLoad(state, { startIndex, dataLen }) {
            let endIndex = startIndex + dataLen;
            if (startIndex + dataLen > state.state.arr.length) {
                endIndex = state.state.arr.length;
            }
            state.state.newData = state.state.arr.slice(startIndex, endIndex);

        },
    },
    modules: {},
};
