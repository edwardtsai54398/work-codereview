export default {
    // namespaced: true,
    state: {
        include:[],
    },
    getters:{},
    mutations:{
        clearKeepInclude(state){
            state.include.length = 0
        },
        pushInclude(state,compoName){
            if(!state.include.some((component)=>component === compoName)){
                state.include.push(compoName)
            }
        },
    },
    actions:{},
    modules: {},
};