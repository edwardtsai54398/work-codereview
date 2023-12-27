
import actions from "./actions"
import mutations from "./mutations"
import getters from "./getters"

import enrolled from "./modules/enrolled"
import connected from "./modules/connected"
import disconnected from "./modules/disconnected"
export default {
    namespaced: true,
    state: {
        getDataLen: 0,
        keyField: "",
        offset: 0,
        dataChangeCount: 0,
        dataLoadDone: false,
        loadStart: false,
        loading: false,
        allData: [],
        batchesTrustList: [],
        totalDataCount: 0,
    },
    getters,
    mutations,
    actions,
    modules: {
        enrolled,
        connected,
        disconnected
    },
};
