// 解决 Element-Plus 按钮点击不失焦的问题
export const unFocus = function (event) {
  event.target.blur()
  if (event.target.nodeName === 'SPAN') {
    event.target.parentNode.blur()
  }
}

// 判断字符串是否为空
export const isEmpty = function (str) {
  if (
    typeof str === 'undefined' ||
    str === '' ||
    str === null ||
    (typeof str === 'string' && str.trim().length === 0)
  ) {
    return true
  } else {
    return false
  }
}

// 去除字符串两边的空格
export const stringTrim = (str) => {
  if (typeof str === 'string') {
    return str.trim()
  }

  return str
}

// 时间格式化器
export const dateformatter = (time) => {
  const date = new Date(time)
  const year = date.getFullYear()
  const month =
    date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
  const minutes =
    date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  const seconds =
    date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()

  return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`
}

export const checkMobile = (rule, value, callback) => {
  // 验证手机号的正则
  const phoneReg =
    /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
  if (phoneReg.test(value)) return callback()
  callback(new Error('请输入正确的手机号!'))
}

export const checkPassword = (rule, value, callback) => {
  // 验证密码的正则,至少包含字母、数字、特殊字符，6-15位
  const passwordReg = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[^\da-zA-Z\s]).{6,15}$/
  if (passwordReg.test(value)) return callback()
  callback(new Error('密码格式不正确，至少包含字母、数字、特殊字符'))
}