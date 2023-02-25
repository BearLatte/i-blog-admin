<template>
  <Window
    :isShow="windowConfig.isShow"
    :buttons="windowConfig.buttons"
    @close="closeWindow"
  >
    <el-form
      :model="blogFormData"
      :rules="blogFormDataRules"
      ref="blogFormDataRef"
      class="editor-form"
    >
      <el-form-item prop="title">
        <el-input
          v-model="blogFormData.title"
          placeholder="请输入博客标题"
          class="title-input"
        >
        </el-input>
      </el-form-item>
      <el-form-item v-if="blogFormData.editorType === 1" prop="content">
        <HtmlEditor
          v-model="blogFormData.content"
          :height="htmlEditorHeight"
          :style="{ width: '100%' }"
        >
        </HtmlEditor>
      </el-form-item>
      <el-form-item v-else prop="markdownContent">
        <MarkdownEditor
          v-model="blogFormData.markdownContent"
          :height="markdownEditorHeight"
          @htmlContent="setHtmlContent"
          class="blog-editor-markdown"
        >
        </MarkdownEditor>
      </el-form-item>
    </el-form>
  </Window>
</template>

<script setup>
import {
  getCurrentInstance,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref
} from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const emit = defineEmits(['callback'])
const { proxy } = getCurrentInstance()

const props = defineProps({
  isShow: {
    type: Boolean,
    default: false
  }
})

// 需要用到的接口
const api = {
  // 获取用户信息
  getUser: '/user',
  // 专题下博客的增删改查接口，使用 RESTFUL 区分
  blogEdit: '/special/blog',
  // 自动保存接口
  autoSave: '/special/blog/autoSave'
}

// 编辑器的高度
const markdownEditorHeight = ref()
const htmlEditorHeight = ref()

// 博客表单数据
const blogFormData = ref({})
const blogFormDataRef = ref(null)
// 自定义验证博客内容的规则
const checkBlogContent = (_, value, callback) => {
  const regConteng = /^<p><br><\/p>$/
  if (regConteng.test(value)) return callback(new Error('请输入博客正文'))
  callback()
}
const blogFormDataRules = {
  title: [{ required: true, message: '请输入博客标题' }],
  content: [{ validator: checkBlogContent, trigger: 'blur' }],
  markdownContent: [{ required: true, message: '请输入博客正文' }]
}

// 分类列表
const categoryList = ref([])
// 标签输入内容
const tagList = ref([])
// 是否显示新增标签的flag
const isShowTagInput = ref(false)
// tag 输入框的值
const tagInputValue = ref()
// 标签输入框的引用
const tagInputRef = ref(null)

// 新增或者修改博客弹出框的配置数据
const windowConfig = reactive({
  isShow: false,
  buttons: [
    {
      // 唯一标识符，用于绑定循环的 key 值
      btnId: '1',
      // 按钮类型
      type: 'danger',
      text: '确定',
      // 按钮的点击事件
      click: (e) => {
        proxy.$func.unFocus(e)
        submitBlog()
      }
    }
  ]
})

// 自动保存的定时器
let timer = ref(null)

// 开启定时器,一分钟自动保存一次
const startTimerInteval = () => {
  if (timer.value === null) {
    timer.value = setInterval(() => {
      autoSave()
    }, 20000)
  }
}

// 清除定时器的方法
const cleanTimerInteval = () => {
  if (timer.value !== null) {
    clearInterval(timer.value)
    timer.value = null
  }
}

// 组件挂载完成的钩子
onMounted(async () => {
  getEditorHeight()
  window.addEventListener('resize', getEditorHeight)
})

// 组件卸载的钩子
onUnmounted(() => {
  cleanTimerInteval()
})

// 动态获取window的高度
const getEditorHeight = () => {
  markdownEditorHeight.value = window.innerHeight - 270
  htmlEditorHeight.value = window.innerHeight - 355
}

// 隐藏新增或者修改的弹出框
const closeWindow = () => {
  // 关闭window
  windowConfig.isShow = false
  // 清空数据
  blogFormDataRef.value.resetFields()

  // 关闭定时器
  cleanTimerInteval()

  // 退出之后刷新一下列表
  emit('callback')
}

// 当处于markdown编辑器时填充html内容
const setHtmlContent = (htmlContent) => {
  blogFormData.value.content = htmlContent
}

// 初始化方法
const init = (type, data) => {
  blogFormData.value = {}
  windowConfig.isShow = true
  nextTick(() => {
    // 开启自动保存的定时器
    startTimerInteval()
    blogFormDataRef.value.resetFields()
    blogFormData.value.pBlogId = data.id === -1 ? null : data.id
    blogFormData.value.categoryId = data.categoryId
    if (type === 'add') {
      // 获取用户信息
      blogFormData.value.editorType = store.state.userInfo.editorType
    } else {
      blogFormData.value = data
    }
  })
}

// 对外暴露初始化方法到
defineExpose({ init })

// 自动保存
const autoSave = async () => {
  console.log('自动保存')
  const emptHtmlReg = /^<p><br><\/p>$/
  if (
    proxy.$func.isEmpty(blogFormData.value.content) ||
    proxy.$func.isEmpty(blogFormData.value.title) ||
    emptHtmlReg.test(blogFormData.value.content)
  ) {
    return
  }

  const result = await proxy.$request({
    url: api.autoSave,
    method: 'POST',
    showLoading: false,
    params: blogFormData.value
  })

  if (!result) return

  blogFormData.value = result.data[0]
}

const submitBlog = () => {
  blogFormDataRef.value.validate(async (valid) => {
    if (valid) {
      const result = await proxy.$request({
        url: api.blogEdit,
        method: 'POST',
        params: blogFormData.value
      })

      if (!result) return
      proxy.$message.success(result.message)
      closeWindow()
    }
  })
}
</script>

<style lang="less" scoped>
.editor-form {
  .title-input {
    border-bottom: 1px solid #ddd;
    margin-bottom: 9px;
    :deep(.el-input__wrapper) {
      box-shadow: none;
      input {
        font-size: 18px;
      }
    }
  }
}
</style>
