import { createStore } from 'vuex'

const store = createStore({
  state: {
    userInfo: {
      id: 0,
      avatar: '',
      nickName: '',
      editorType: 0,
      roleType: 2
    }
  },
  mutations: {
    // 接收几个参数，用于修改store存的值
    updateUserInfo(state, userInfo) {
      state.userInfo.id = userInfo.id
      state.userInfo.roleType = userInfo.roleType
      state.userInfo.avatar = userInfo.avatar
      state.userInfo.nickName = userInfo.nickName
      state.userInfo.editorType = userInfo.editorType
    }
  },
  actions: {}
})

export default store
