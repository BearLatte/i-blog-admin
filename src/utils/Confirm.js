const confirm = (message, okCallback, type) => {
  ElMessageBox.confirm(message, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: type ? type : 'info',
    dangerouslyUseHTMLString: true
  })
    .then(() => {
      okCallback()
    })
    .catch(() => {})
}

export default confirm
