<template>
  <el-form :model="searchForm">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item label="昵称" prop="nickName" label-width="48px">
          <el-input
            placeholder="请输入昵称，支持模糊搜索"
            v-model="searchForm.nickName"
            @keyup.enter="loadDataList"
          >
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="手机号" prop="phone" label-width="55px">
          <el-input
            placeholder="请输入手机号，支持模糊搜索"
            v-model="searchForm.phone"
            @keyup.enter="loadDataList"
          >
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item>
          <el-button type="danger" @click="searchBtnClick">搜索</el-button>
          <el-button
            type="danger"
            v-if="currentUserRoleType !== 2"
            @click="modeifyUserInfo($event, 'add')"
          >
            新增成员
          </el-button>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
  <Table
    :columns="columns"
    :dataSource="userListData"
    :fetch="loadDataList"
    :showPagination="true"
    class="user-data-table"
  >
    <!-- 头像 -->
    <template #avatar="{ row }">
      <Cover :cover="row.avatar" :width="60"></Cover>
    </template>

    <!-- 用户信息 -->
    <template #userInfo="{ row }">
      <div>昵称：{{ row.nickName }}</div>
      <div>职业：{{ row.profession }}</div>
      <div>手机号：{{ row.phone }}</div>
    </template>

    <!-- 账号状态 -->
    <template #status="{ row }">
      <div v-show="row.status === 0" style="color: #f56c6c">
        {{ row.statusName }}
      </div>
      <div v-show="row.status === 1" style="color: #01ef5c">
        {{ row.statusName }}
      </div>
      <div v-show="row.status === 2" style="color: #e5c07b">
        {{ row.statusName }}
      </div>
    </template>

    <!-- 时间 -->
    <template #time="{ row }">
      <div>创建时间：{{ proxy.$func.dateformatter(row.createdAt) }}</div>
      <div>登录时间：{{ proxy.$func.dateformatter(row.lastLoginTime) }}</div>
    </template>

    <!-- 操作 -->
    <template #op="{ row }">
      <div v-if="currentUserRoleType === 2" :style="{ color: '#ddd' }">
        权限不够
      </div>
      <div class="op" v-else>
        <a
          href="javascript:void(0)"
          class="a-link"
          @click="modeifyUserInfo($event, 'update', row)"
        >
          修改
        </a>
        <el-divider direction="vertical" />
        <a
          href="javascript:void(0)"
          class="a-link"
          :disabled="row.status === 0"
          :class="[row.status === 0 ? 'not-allow' : 'a-link']"
          :style="{ pointerEvents: row.status === 0 ? 'none' : 'auto' }"
          @click="changeStatus(row.id, row.status === 1 ? 2 : 1)"
        >
          {{ row.status === 1 ? '禁用' : '启用' }}
        </a>
        <el-divider direction="vertical" />
        <a
          href="javascript:void(0)"
          class="a-link"
          @click="showChangePwdDialog(row)"
        >
          修改密码
        </a>
        <el-divider direction="vertical" />
        <a href="javascript:void(0)" class="a-link" @click="deleteUser(row)">
          {{ row.status === 0 ? '恢复' : '删除' }}
        </a>
        <template v-if="currentUserRoleType === 0">
          <el-divider direction="vertical" />
          <a
            href="javascript:void(0)"
            class="a-link"
            @click="removeUserFromDB(row)"
          >
            销毁
          </a>
        </template>
      </div>
    </template>
  </Table>
  <Dialog
    :isShow="dialogConfig.isShow"
    :buttons="dialogConfig.buttons"
    :title="dialogConfig.title"
    @close="closeDialog"
    width="700px"
  >
    <el-form
      :model="userForm"
      :rules="userFormRules"
      ref="userFormRef"
      label-width="68px"
    >
      <el-row>
        <el-col :span="24">
          <el-form-item label="头像" prop="avatar">
            <CoverUpload v-model="userForm.avatar"></CoverUpload>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="modifyType === 'add'">
        <el-col :span="24">
          <el-alert
            title="温馨提示：账号为空时默认账号为手机号，默认密码为888888"
            type="warning"
            show-icon
            :closable="false"
            style="margin: 0 25px 10px; height: 30px; width: 634px"
          >
          </el-alert>
        </el-col>
      </el-row>
      <el-row :gutter="30">
        <el-col :span="12">
          <el-form-item label="账号" prop="account">
            <el-input
              placeholder="请输入用户名"
              v-model="userForm.account"
              :disabled="modifyType === 'update'"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="昵称" prop="nickName">
            <el-input placeholder="请输入昵称" v-model="userForm.nickName">
            </el-input>
          </el-form-item>
          <el-form-item label="编辑器" prop="editorType">
            <el-radio-group v-model="userForm.editorType">
              <el-radio :label="0">Markdown</el-radio>
              <el-radio :label="1">富文本</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input placeholder="请输入手机号" v-model="userForm.phone">
            </el-input>
          </el-form-item>
          <el-form-item label="职业" prop="profession">
            <el-input
              placeholder="请输入职业信息"
              v-model="userForm.profession"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="角色" prop="roleType">
            <el-radio-group v-model="userForm.roleType">
              <el-radio :label="1">管理员</el-radio>
              <el-radio :label="2">普通用户</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="个人简介" prop="introduction">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRow: 4 }"
              placeholder="请输入个人简介"
              v-model="userForm.introduction"
            >
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </Dialog>
  <Dialog
    :isShow="changePasswordDialogConfig.isShow"
    :title="changePasswordDialogConfig.title"
    :buttons="changePasswordDialogConfig.buttons"
    width="500px"
    @close="changePasswordDialogConfig.isShow = false"
  >
    <el-form
      :model="passwordFormData"
      :rules="passwordFormDataRules"
      label-width="100px"
      ref="passwordFormRef"
    >
      <el-form-item label="密码" prop="password">
        <el-input
          placeholder="请输入新密码"
          v-model="passwordFormData.password"
          type="password"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="重复密码" prop="rePassword">
        <el-input
          placeholder="请再次输入新密码"
          v-model="passwordFormData.rePassword"
          type="password"
        >
        </el-input>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script setup>
import { useStore } from 'vuex'
import { reactive, getCurrentInstance, watch, ref, nextTick } from 'vue'
import crypt from '@/utils/crypt.js'

const api = {
  // 用户的增删改查
  modifyUser: '/user',
  // 获取用户列表
  loadUserList: '/user/list',
  // 修改用户状态
  changeUserStatus: '/user/changeStatus'
}

const { proxy } = getCurrentInstance()
const store = useStore()
const searchForm = reactive({})
const userForm = ref({})
const userFormRef = ref(null)
const modifyType = ref(null)
const passwordFormData = ref({})
const passwordFormRef = ref(null)

const checkRePassword = (rule, value, callback) => {
  if (value !== passwordFormData.value.password) {
    return callback(new Error('两次输入的密码不一样，请检查后重新输入'))
  }
  callback()
}

const userFormRules = {
  id: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 15, message: '昵称格式为2~15个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { validator: proxy.$func.checkMobile, trigger: 'blur' }
  ],
  editorType: [
    { required: true, message: '请选择默认编辑器', trigger: 'blur' }
  ],
  roleType: [{ required: true, message: '请选择账户角色', trigger: 'blur' }]
}

const passwordFormDataRules = {
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: proxy.$func.checkPassword, trigger: 'blur' }
  ],
  rePassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: checkRePassword, trigger: 'blur' }
  ]
}

const columns = [
  {
    label: '头像',
    prop: 'avatar',
    width: 70,
    scopedSlots: 'avatar'
  },
  {
    label: '用户信息',
    prop: 'userInfo',
    scopedSlots: 'userInfo'
  },
  {
    label: '默认编辑器',
    prop: 'editorTypeName',
    width: 120
  },
  {
    label: '角色',
    prop: 'roleTypeName',
    width: 90
  },
  {
    label: '状态',
    prop: 'status',
    width: 70,
    scopedSlots: 'status'
  },
  {
    label: '时间',
    prop: 'time',
    width: 220,
    scopedSlots: 'time'
  },
  {
    label: '操作',
    prop: 'op',
    width: 230,
    scopedSlots: 'op'
  }
]

// 弹出框设置
const dialogConfig = reactive({
  isShow: false,
  buttons: [
    {
      btnId: '1',
      text: '确定',
      type: 'danger',
      click: (e) => {
        proxy.$func.unFocus(e)
        submitUserInfo()
      }
    }
  ]
})

const changePasswordDialogConfig = reactive({
  isShow: false,
  title: '修改密码',
  buttons: [
    {
      btnId: '1',
      type: 'danger',
      text: '确定',
      click: (e) => {
        proxy.$func.unFocus(e)
        submitChangePassword()
      }
    }
  ]
})
// 用户列表信息
const userListData = reactive({})
// 当前用户
const currentUserRoleType = ref(null)

// 方法
watch(
  () => store.state.userInfo,
  (newVal, _) => {
    currentUserRoleType.value = newVal.roleType
  },
  { immediate: true, deep: true }
)

// 加载数据列表
const loadDataList = async () => {
  const params = {
    pageNo: userListData.pageNo,
    pageSize: userListData.pageSize
  }
  Object.assign(params, searchForm)

  const result = await proxy.$request({
    url: api.loadUserList,
    method: 'GET',
    params
  })
  if (!result) return
  Object.assign(userListData, result.data)
}

// 搜索按钮点击
const searchBtnClick = (e) => {
  proxy.$func.unFocus(e)
  loadDataList()
}

// 关闭弹框
const closeDialog = () => {
  userFormRef.value.resetFields()
  dialogConfig.isShow = false
}
// 新增成员
const modeifyUserInfo = (e, type, data) => {
  proxy.$func.unFocus(e)
  modifyType.value = type
  if (type === 'add') {
    dialogConfig.title = '添加成员'
    userForm.value = {}
  } else {
    dialogConfig.title = '修改成员信息'
    userForm.value = { ...data }
  }
  dialogConfig.isShow = true
}

// 提交用户信息到服务器
const submitUserInfo = () => {
  userFormRef.value.validate(async (valid) => {
    if (!valid) return
    const params = {
      ...userForm.value,
      account: userForm.value.account
        ? userForm.value.account
        : userForm.value.phone
    }
    const result = await proxy.$request({
      url: api.modifyUser,
      method: 'POST',
      params
    })
    if (!result) return
    proxy.$message.success(result.message)
    userFormRef.value.resetFields()
    closeDialog()
    loadDataList()
  })
}

// 改变用户状态
const changeStatus = async (userId, status) => {
  const params = { id: userId, status: status }
  const result = await proxy.$request({
    url: api.changeUserStatus,
    method: 'PUT',
    params
  })
  if (!result) return
  proxy.$message.success(result.message)
  loadDataList()
}

const deleteUser = async (user) => {
  if (user.status !== 0) {
    proxy.$confirm(
      `确定删除名为<strong style="color: orange">${user.nickName}</strong>的用户吗?`,
      () => {
        console.log('这个方法执行了')
        changeStatus(user.id, 0)
      },
      'warning'
    )
  } else {
    changeStatus(user.id, 1)
  }
}

// 从数据库删除掉用户
const removeUserFromDB = (user) => {
  proxy.$confirm(
    `<strong  style="color: red">危险提示：</strong>确定永久删除昵称为<strong style="color: orange">${user.nickName}</strong>的用户吗? 此操作将删除用户所有资料，包括所有博客内容`,
    async () => {
      const result = await proxy.$request({
        url: api.modifyUser + '/' + user.id,
        method: 'DELETE'
      })
      console.log(result)
      loadDataList()
    },
    'warning'
  )
}

const showChangePwdDialog = (user) => {
  changePasswordDialogConfig.isShow = true
  nextTick(() => {
    passwordFormRef.value.resetFields()
    passwordFormData.value.userId = user.id
  })
}

const submitChangePassword = () => {
  passwordFormRef.value.validate(async (valid) => {
    if (!valid) return
    // 执行密码加密
    const params = {
      id: passwordFormData.value.userId,
      password: crypt(passwordFormData.value.password)
    }
    const result = await proxy.$request({
      url: '/user/changePassword',
      method: 'PUT',
      params: params
    })

    console.log(result)
    if (!result) return
    proxy.$message.success(result.message)
    changePasswordDialogConfig.isShow = false
    passwordFormRef.value.resetFields()
  })
}
</script>

<style lang="less" scoped>
.user-data-table {
  margin-top: 10px;
  height: calc(100vh - 170px);
}

:deep(.el-alert__title) {
  line-height: 30px;
}
</style>
