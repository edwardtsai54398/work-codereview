
import actions from "./actions"
import mutations from "./mutations"
// import getters from "./getters"

import enrolled from "./modules/enrolled"
import connected from "./modules/connected"
import disconnected from "./modules/disconnected"
export default {
    namespaced: true,
    state: {
        totalDataCount: 0,
        totalDeviceCount: {
            total:0,
            disconnected: 0,
            connected:0,
        },
        enrollUrl: "/data/devices/enrolled.json",//
        connectUrl: "/data/devices/connected.json",//
        disconnectUrl: "/data/devices/disconnected.json",//
    },
    getters:{},
    mutations:{
        ...mutations,
        setTotalData(state, data){
            state.totalDeviceCount.total = data.total;
            state.totalDeviceCount.disconnected = data.disconnected;
            state.totalDeviceCount.connected = data.connected;
        },
        newUrl(state){
            console.log("new");
            state.enrollUrl = "/data/devices/enrolledNew.json"
            state.connectUrl = "/data/devices/connectedNew.json"
            state.disconnectUrl = "/data/devices/disconnectedNew.json"
        },//
    },
    actions,
    modules: {
        enrolled,
        connected,
        disconnected
    },
};
