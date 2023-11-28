import { createStore } from 'vuex'
import scrollBatchLoad from './scrollBatchLoad';
import groupHealth from './groupHealth';
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
    }
})

export default store