<template>
  <div class="common-layout">
    <el-container>
      <el-header class="header">
        <div class="logo">iBlog后台管理系统</div>
        <div class="user-info">
          <span>欢迎回来，</span>
          <el-dropdown trigger="click">
            <span class="el-dropdown-link nickname">
              {{ currentUserInfo.nickName }}
              <el-icon class="iconfont icon-open-down"> </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="go2mine"> 个人信息 </el-dropdown-item>
                <el-dropdown-item @click="logout"> 退出 </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <img :src="avatarUrl" class="avatar" />
        </div>
      </el-header>
      <el-container class="framework-container">
        <el-aside width="200px" class="aside">
          <div>
            <!-- <el-button class="public-btn">发布</el-button> -->
            <div class="menu-panel">
              <ul>
                <li
                  v-for="menu in menuList"
                  :key="menu.menuId"
                  class="menu-list-item"
                >
                  <span class="menu-title-p" @click="menu.open = !menu.open">
                    <span :class="['iconfont', menu.icon]"></span>
                    <span class="menu-title">{{ menu.title }}</span>
                    <span
                      v-show="!menu.open"
                      class="iconfont open-close icon-open-down"
                    >
                    </span>
                    <span
                      v-show="menu.open"
                      class="iconfont open-close icon-open-up"
                    >
                    </span>
                  </span>
                  <ul class="sub-menu" v-show="menu.open">
                    <li v-for="submenu in menu.children" :key="submenu.id">
                      <router-link
                        :to="submenu.path"
                        :class="[
                          'sub-menu-item',
                          activePath === submenu.path ? 'submenu-active' : ''
                        ]"
                        v-if="
                          submenu.roleType == null ||
                          submenu.roleType == store.state.userInfo.roleType
                        "
                        >{{ submenu.title }}</router-link
                      >
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </el-aside>
        <el-main class="main">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script setup>
import {
  computed,
  getCurrentInstance,
  onMounted,
  watch,
  reactive,
  ref
} from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import router from '../router'

// 获取全局对象
const { proxy } = getCurrentInstance()
const store = useStore()
const api = {
  getUserInfo: '/user/current'
}
const menuList = ref([
  {
    menuId: '1',
    title: '博客',
    icon: 'icon-blog',
    open: true,
    children: [
      {
        id: '1',
        title: '博客管理',
        path: '/blog/list'
      },
      {
        id: '2',
        title: '分类管理',
        path: '/blog/categories'
      }
    ]
  },
  {
    menuId: '2',
    title: '专题',
    icon: 'icon-zhuanti',
    open: true,
    children: [
      {
        id: '1',
        title: '专题管理',
        path: '/special/list'
      }
    ]
  },
  {
    menuId: '3',
    title: '设置',
    icon: 'icon-settings',
    open: true,
    children: [
      {
        id: '1',
        title: '个人信息设置',
        path: '/setting/mine'
      },
      {
        id: '2',
        title: '博客成员',
        path: '/setting/users'
      },
      {
        id: '3',
        title: '系统设置',
        path: '/setting/systemSetting',
        roleType: 0
      }
    ]
  },
  {
    menuId: '4',
    title: '回收站',
    icon: 'icon-delete',
    open: true,
    children: [
      {
        id: '1',
        title: '回收站',
        path: '/recovery/list'
      }
    ]
  }
])
const currentUserInfo = reactive({})

// 路由对象
const route = useRoute()

// 头像地址
let avatarUrl = computed(() => {
  // 小细节，如果用户头像没有值时，返回空值，避免发生多次请求
  return currentUserInfo.avatar
    ? proxy.$globalInfo.fileUrl + currentUserInfo.avatar
    : null
})

// 获取当前用户数据
const getUserInfo = async () => {
  // 获取用户信息
  let userInfo = store.state.userInfo
  // 如果用户id为空，从sessionStorege里获取
  if (userInfo.id === null) {
    userInfo = window.sessionStorage.getItem('userInfo').toJSON()
  }

  Object.assign(currentUserInfo, userInfo)

  const result = await proxy.$request({
    url: api.getUserInfo,
    method: 'GET'
  })
  Object.assign(currentUserInfo, result.data)
  store.commit('updateUserInfo', {
    id: result.data.id,
    nickName: result.data.nickName,
    avatar: result.data.avatar,
    roleType: result.data.roleType,
    editorType: result.data.editorType
  })
}

window.addEventListener('beforeunload', () => {
  window.sessionStorage.setItem(
    'userInfo',
    JSON.stringify(store.state.userInfo)
  )
})

// 组件挂载完成发送请求获取用户信息
onMounted(async () => {
  getUserInfo()
})

const activePath = ref(null)

const go2mine = () => {
  router.push('/setting/mine')
}

const logout = () => {
  proxy.$confirm('确定要退出吗？', async () => {
    // 删除token
    window.sessionStorage.removeItem('token')
    window.sessionStorage.removeItem('userInfo')
    router.push('/login')
  })
}

watch(
  route,
  (newValue) => {
    activePath.value = newValue.fullPath
  },
  { immediate: true, deep: true }
)

watch(
  () => store.state.userInfo,
  (newVal, _) => {
    const avatar = newVal.avatar
    const nickName = newVal.nickName
    Object.assign(currentUserInfo, { avatar, nickName })
  },
  { immediate: true, deep: true }
)
</script>

<style lang="less" scoped>
.common-layout {
  min-width: 550px;
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #ddd;

    .logo {
      font-size: 30px;
      color: #448aff;
    }

    .user-info {
      display: flex;
      align-items: center;

      .nickname {
        color: #448aff;
        cursor: pointer;
      }

      .icon-open-down {
        font-size: 14px;
      }

      .avatar {
        margin-left: 15px;
        width: 50px;
        border-radius: 50%;
        border: 1px solid #ddd;
      }
    }
  }

  .framework-container {
    padding-top: 10px;
    background-color: #f5f6f7;

    .aside {
      padding: 0 15px;
      width: 230px;
      height: calc(100vh - 70px);

      .public-btn {
        margin-bottom: 30px;
        width: 100%;
        height: 40px;
        background-color: #448aff;
        color: #fff;
      }

      // 菜单项目
      .menu-panel {
        ul,
        li {
          padding: 0;
          margin: 0;
          list-style: none;
        }

        .menu-title-p {
          cursor: pointer;
          line-height: 35px;
          display: flex;
          padding: 0 10px;
          border-radius: 3px;
          margin-bottom: 10px;

          .iconfont {
            font-size: 16px;
            color: #91949a;
          }

          .menu-title {
            flex: 1;
            margin-left: 15px;
            color: #3f4042;
            line-height: 35px;
          }

          .open-close {
            width: 20px;
          }
        }

        .sub-menu {
          font-size: 14px;

          .sub-menu-item {
            display: block;
            padding: 0 0 0 40px;
            border-radius: 3px;
            line-height: 35px;
            margin-bottom: 10px;
            color: #3f4042;
            text-decoration: none;
          }

          .sub-menu-item:hover {
            color: #fff;
            background-color: #448aff;
          }

          .submenu-active {
            color: #fff;
            background-color: #448aff;
          }
        }

        .menu-title-p:hover {
          background: #448aff;
        }

        .menu-title-p:hover .menu-title,
        .menu-title-p:hover .iconfont {
          color: #fff;
        }
      }
    }

    .main {
      position: relative;
      border-radius: 8px;
      background-color: #fff;
      padding: 20px 10px 10px 10px;
      min-width: 1050px;
    }
  }
}
</style>
