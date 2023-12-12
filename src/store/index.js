import { createStore } from 'vuex'
import scrollBatchLoad from './scrollBatchLoad';
import groupHealth from './groupHealth';
import columnControl from './columnControl/columnControl.js';
const store = createStore({
    state: {
        user:{
            isPremium: true,
            role: 'administrator'
        },
    },
    modules: {
        scrollBatchLoad,
        groupHealth,
        columnControl,
    }
})

export default store