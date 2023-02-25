<template>
  <div class="login-body">
    <div class="login-panel">
      <div class="login-title">用户登录</div>
      <el-form
        :model="loginFormData"
        :rules="loginFormRoles"
        ref="loginFormRef"
      >
        <el-form-item prop="account">
          <el-input placeholder="请输入账号" v-model="loginFormData.account">
            <template #prefix>
              <span class="iconfont icon-account"></span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            placeholder="请输入密码"
            type="password"
            v-model="loginFormData.password"
          >
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="checkCode">
          <div class="check-code-panel">
            <el-input
              placeholder="请输入验证码"
              v-model="loginFormData.checkCode"
            >
              <template #prefix>
                <span class="iconfont icon-yanzhengma"></span>
              </template>
            </el-input>
            <img
              :src="checkCodeUrl"
              class="check-code"
              @click="changeCheckCode"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="login"
            >登录</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { getCurrentInstance, onMounted, reactive, ref } from 'vue'
import crypt from '@/utils/crypt.js'
import VueCookies from 'vue-cookies'

export default {
  setup() {
    // 网络 api
    const api = {
      checkCode: '/api/auth/checkCode',
      login: '/auth/login'
    }
    const { proxy } = getCurrentInstance()
    // 拼接验证码获取路径
    const checkCodeUrl = ref(api.checkCode)
    const changeCheckCode = () => {
      checkCodeUrl.value = `${api.checkCode}?${new Date().getTime()}`
    }

    // 表单相关
    const loginFormRef = ref()
    const loginFormData = reactive({})
    const loginFormRoles = {
      account: [
        { required: true, message: '账号不能为空' },
        { min: 2, max: 15, message: '账号长度为5~15个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '密码不能为空' },
        {
          min: 6,
          max: 16,
          message: '密码长度错误，需要6~16位，字母或数字',
          trigger: 'blur'
        }
      ],
      checkCode: [{ required: true, message: '验证码不能为空' }]
    }

    // 页面挂载完成钩子
    onMounted(() => {
      // 读取 cookie 中的信息
      const accountInfo = VueCookies.get('accountInfo')
      Object.assign(loginFormData, accountInfo)

      // 绑定回车键弹起的响应
      document.addEventListener('keyup', (e) => {
        if (e.code === 'Enter') {
          login()
        }
      })
    })

    // 登录按钮点击事件
    const login = () => {
      loginFormRef.value.validate(async (valid) => {
        if (!valid) return

        // 组装登录参数
        const loginParams = {
          account: loginFormData.account,
          password: crypt(loginFormData.password),
          checkCode: loginFormData.checkCode
        }
        const result = await proxy.$request({
          url: api.login,
          method: 'POST',
          params: loginParams,
          // 传入一个请求失败处理逻辑，将图片验证码刷新
          errorCallback: () => {
            changeCheckCode()
          }
        })
        // 如果返回值为空，阻止继续执行
        if (!result) return

        // 登录成功回调时，将 token 保存到 sessionStroage
        proxy.$message.success(result.message)
        window.sessionStorage.setItem('token', result.data)

        // 登录成功时将账号记录在cookie中
        const accountInfo = { ...loginParams, password: '', checkCode: '' }
        VueCookies.set('accountInfo', accountInfo, '7d')

        // 跳转到框架页面
        setTimeout(() => {
          proxy.$router.push('/')
        }, 500)
      })
    }

    return {
      // 属性
      checkCodeUrl,
      loginFormRef,
      loginFormData,
      loginFormRoles,

      // 方法
      changeCheckCode,
      login
    }
  }
}
</script>

<style lang="less" scoped>
.login-body {
  width: 100%;
  height: calc(100vh);
  background-size: cover;
  background-position: center;
  background-image: url('../assets/login_bg.jpg');
  min-width: 550px;
  min-height: 600px;

  .login-panel {
    float: right;
    margin-right: 100px;
    margin-top: 200px;
    padding: 20px;
    width: 350px;
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: 5px;
    box-shadow: 2px 2px 10px #888888;

    .login-title {
      font-size: 18px;
      text-align: center;
      margin-bottom: 10px;
      color: #888888;
    }

    .check-code-panel {
      display: flex;

      .check-code {
        margin-left: 10px;
        cursor: pointer;
      }
    }
  }
}
</style>
