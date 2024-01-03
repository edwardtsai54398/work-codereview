
import actions from "./actions"
import mutations from "./mutations"

import enrolled from "./modules/device/modules/enrolled"
import connected from "./modules/device/modules/connected"
import disconnected from "./modules/device/modules/disconnected"
const prefixURL = ""
// const prefixURL = "/work-codereview"
export default {
    namespaced: true,
    state: {
        totalDataCount: 0,
        totalDeviceCount: {
            total:0,
            disconnected: 0,
            connected:0,
        },
        enrollUrl: `${prefixURL}/data/devices/enrolled.json`,//
        connectUrl: `${prefixURL}/data/devices/connected.json`,//
        disconnectUrl: `${prefixURL}/data/devices/disconnected.json`,//
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
            state.enrollUrl = `${prefixURL}/data/devices/enrolledNew.json`
            state.connectUrl = `${prefixURL}/data/devices/connectedNew.json`
            state.disconnectUrl = `${prefixURL}/data/devices/disconnectedNew.json`
        },//
    },
    actions,
    modules: {
        enrolled,
        connected,
        disconnected
    },
};
