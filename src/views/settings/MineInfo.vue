<template>
  <el-form
    :model="formData"
    :rules="formDataRules"
    ref="formDataRef"
    label-width="100px"
  >
    <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item label="头像" prop="avatar">
          <CoverUpload v-model="formData.avatar"></CoverUpload>
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input placeholder="请输入昵称" v-model="formData.nickName">
          </el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input placeholder="请输入手机号" v-model="formData.phone">
          </el-input>
        </el-form-item>
        <el-form-item label="密码">
          <a
            href="javascript:void(0);"
            class="a-link"
            @click="showUpdatePasswordDialog"
          >
            修改密码
          </a>
        </el-form-item>
        <el-form-item label="职业" prop="profession">
          <el-input placeholder="请输入职业信息" v-model="formData.profession">
          </el-input>
        </el-form-item>
        <el-form-item label="默认编辑器" prop="editorType">
          <el-radio-group v-model="formData.editorType">
            <el-radio :label="0">Markdown</el-radio>
            <el-radio :label="1">富文本</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="个人简介" prop="introduction">
          <el-input
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 4 }"
            placeholder="请输入个人简介"
            v-model="formData.introduction"
          >
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="saveMineInfo">保存</el-button>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
  <Dialog
    :isShow="dialogConfig.isShow"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    width="500px"
    @close="dialogConfig.isShow = false"
  >
    <el-form
      :model="passwordFormData"
      :rules="formDataRules"
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
import crypt from '@/utils/crypt.js'
import { onMounted, ref, getCurrentInstance, reactive, nextTick } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const { proxy } = getCurrentInstance()

const checkRePassword = (rule, value, callback) => {
  if (value !== passwordFormData.password) {
    return callback(new Error('两次输入的密码不一样，请检查后重新输入'))
  }
  callback()
}

const formData = ref({})
const passwordFormData = reactive({})
const formDataRules = {
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 15, message: '昵称的长度在2~15个字符之间', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { validator: proxy.$func.checkMobile, trigger: 'blur' }
  ],
  editorType: [
    { required: true, message: '请选择默认的编辑器', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: proxy.$func.checkPassword, trigger: 'blur' }
  ],
  rePassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: checkRePassword, trigger: 'blur' }
  ]
}
const formDataRef = ref(null)
const passwordFormRef = ref(null)

const dialogConfig = reactive({
  isShow: false,
  title: '修改密码',
  buttons: [
    {
      btnId: '1',
      type: 'danger',
      text: '确定',
      click: (e) => {
        proxy.$func.unFocus(e)
        submitModifyPassword()
      }
    }
  ]
})

onMounted(async () => {
  // 获取用户信息
  const result = await proxy.$request({
    url: '/user/current',
    method: 'GET'
  })

  if (!result) return
  formData.value = result.data
})

const saveMineInfo = (e) => {
  proxy.$func.unFocus(e)
  formDataRef.value.validate(async (valid) => {
    console.log(valid)
    if (!valid) return
    const result = await proxy.$request({
      url: '/user/current',
      method: 'PUT',
      params: formData.value
    })

    if (!result) return
    proxy.$message.success(result.message)
    formData.value = result.data
    store.commit('updateUserInfo', {
      id: formData.value.id,
      nickName: formData.value.nickName,
      avatar: formData.value.avatar,
      roleType: formData.value.roleType,
      editorType: formData.value.editorType
    })
  })
}

const showUpdatePasswordDialog = () => {
  dialogConfig.isShow = true
  nextTick(() => {
    passwordFormRef.value.resetFields()
  })
}

const submitModifyPassword = () => {
  passwordFormRef.value.validate(async (valid) => {
    if (!valid) return
    // 执行密码加密
    const password = crypt(passwordFormData.password)
    const result = await proxy.$request({
      url: '/user/changePassword',
      method: 'PUT',
      params: { password: password }
    })

    console.log(result)
    if (!result) return
    proxy.$message.success(result.message)
    dialogConfig.isShow = false
    passwordFormRef.value.resetFields()
  })
}
</script>
