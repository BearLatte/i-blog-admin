import axios from 'axios'
// 导入自己封装的消息弹出框
import message from '@/utils/Message'
// 导入路由器，便于执行编程式导航跳转
import router from '@/router'

// form 表单格式，默认值
const contentTypeForm = 'application/x-www-form-urlencoded;charset=UTF-8'
// json 格式
const contentTypeJson = 'application/json'
// formdata 格式
const contentTypeFile = 'multipart/form-data'

const request = (config) => {
  let { url, params, dataType, showLoading, method } = config
  dataType = dataType ? config.dataType : 'form'
  showLoading = showLoading == undefined ? true : showLoading
  method = method == undefined ? 'GET' : method

  let contentType = contentTypeForm

  if (dataType === 'json') {
    contentType = contentTypeJson
  } else if (dataType === 'file') {
    contentType = contentTypeFile

    let param = new FormData()

    for (const key in params) {
      param.append(key, params[key])
    }

    params = param
  }

  const instance = axios.create({
    baseURL: '/api',
    timeout: 10 * 1000,
    headers: {
      'Content-Type': contentType,
      'X-Requested-With': 'XMLHttpRequest'
    }
  })

  let loading = null
  // 请求前拦截
  instance.interceptors.request.use(
    (config) => {
      // 将 token 放入请求头中
      config.headers['Authorization'] = window.sessionStorage.getItem('token')
      if (showLoading) {
        loading = ElLoading.service({
          lock: true,
          text: '加载中......',
          background: 'rgba(0, 0, 0, 0.7)'
        })
      }
      return config
    },
    (_) => {
      if (showLoading && loading) {
        loading.close()
        message.error('发送请求失败')
        return Promise.reject('发送请求失败')
      }
    }
  )
  // 设置请求后拦截
  instance.interceptors.response.use(
    (response) => {
      if (showLoading && loading) {
        loading.close()
      }

      const responseData = response.data

      // 处理返回信息
      if (responseData.status === 0) {
        if (responseData.refreshToken) {
          window.sessionStorage.setItem('token', responseData.refreshToken)
        }
        // 请求成功的返回
        return responseData
      } else if (responseData.status === 401) {
        // token 过期，鉴权失败,清除 token，强制跳转到登录页
        window.sessionStorage.clear()
        return router.push('/login')
      } else {
        // 失败后执行的逻辑
        if (config.errorCallback) {
          config.errorCallback()
        }
        // 请求失败返回
        return Promise.reject(responseData.message)
      }
    },
    (err) => {
      console.log(err)
      if (showLoading && loading) {
        loading.close()
        return Promise.reject('网络异常')
      }
    }
  )

  if (method.toLowerCase() === 'post') {
    return instance.post(url, params).catch((error) => {
      message.error(error)
      return null
    })
  } else if (method.toLowerCase() === 'delete') {
    return instance.delete(url, params).catch((error) => {
      message.error(error)
      return null
    })
  } else if (method.toLowerCase() === 'put') {
    return instance.put(url, params).catch((error) => {
      message.error(error)
      return null
    })
  } else if (method.toLowerCase() === 'options') {
    return instance.options(url, params).catch((error) => {
      message.error(error)
      return null
    })
  } else {
    return instance.get(url, { params: params }).catch((error) => {
      message.error(error)
      return null
    })
  }

  // const result = new Promise((resulve, reject) => {
  //   instance.post(url, params).then(res => {
  //     resulve(res)
  //   }).catch(error => {
  //     message.error(error)
  //   })
  // })
  // return result
}

export default request
