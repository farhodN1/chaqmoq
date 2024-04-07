import Vuex from 'vuex';


export default new Vuex.Store({
    state: {
      targetData: {username: 'choose a chat'}
    },
    mutations: {
      setTargetData(state, data) {
        state.targetData = data;
      }
    },
    actions: {
      updateTargetData(context, data) {
        context.commit('setTargetData', data);
      }
    },
    getters: {
      getTargetData: state => state.targetData
    }
  });
  