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
    <Dialog
      :isShow="dialogConfig.isShow"
      :title="dialogConfig.title"
      @close="dialogConfig.isShow = false"
      :buttons="dialogConfig.buttons"
      :closeCallback="dialogConfig.closeCallback"
    >
      <el-form
        :model="blogFormData"
        :rules="blogFormDataRules"
        ref="settingsFormRef"
        label-width="80px"
        class="blog-setting-form"
      >
        <el-form-item label="博客分类" prop="categoryId">
          <el-select
            clearable
            placeholder="请选择博客分类"
            v-model="blogFormData.categoryId"
          >
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.categoryName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="封面" prop="cover">
          <CoverUpload v-model="blogFormData.cover"></CoverUpload>
        </el-form-item>
        <el-form-item label="博客类型" prop="sourceType">
          <el-radio-group v-model="blogFormData.sourceType">
            <el-radio :label="0">原创</el-radio>
            <el-radio :label="1">转载</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="原文地址"
          prop="reprintUri"
          v-if="blogFormData.sourceType === 1"
        >
          <el-input
            placeholder="请输入原文地址"
            v-model="blogFormData.reprintUri"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="评论" prop="allowComment">
          <div class="allow-comment">
            <el-radio-group v-model="blogFormData.allowComment">
              <el-radio :label="1">允许</el-radio>
              <el-radio :label="0">不允许</el-radio>
            </el-radio-group>
            <span class="info"
              >请先在评论设置里设置好相应参数，评论才会生效</span
            >
          </div>
        </el-form-item>
        <el-form-item label="博客摘要" prop="summary">
          <el-input
            type="textarea"
            v-model="blogFormData.summary"
            placeholder="请简短描述博客的内容"
            :autosize="{ minRows: 4, maxRows: 4 }"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="博客标签" prop="tag">
          <div class="tag-input-panel">
            <span class="info" v-if="blogFormData.tag.length === 0">
              添加标签更容易被搜索引擎收录
            </span>
            <div class="tag-list">
              <el-tag
                v-for="(item, index) in blogFormData.tag"
                :key="index"
                :closable="true"
                @close="deleteTag(index)"
                class="tag-item"
                size="small"
              >
                {{ item }}
              </el-tag>

              <span
                class="iconfont icon-add-bold"
                v-show="!isShowTagInput"
                @click="showAddTagHandler"
              >
              </span>
              <el-input
                class="tag-input"
                ref="tagInputRef"
                v-show="isShowTagInput"
                @blur="insertTag2Form"
                @keyup.enter="insertTag2Form"
                v-model="tagInputValue"
              >
              </el-input>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </Dialog>
  </Window>
</template>

<script setup>
import { toInteger } from 'lodash'
import {
  getCurrentInstance,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref
} from 'vue'

import { useStore, mapState } from 'vuex'
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
  // 博客的正删改查接口，使用 RESTFUL 区分
  blogEdit: '/blog',
  // 自动保存接口
  autoSave: '/blog/autoSave'
}

// 编辑器的高度
const markdownEditorHeight = ref()
const htmlEditorHeight = ref()

// 博客表单数据
const blogFormData = ref({ tag: [] })
// reactive({ tag: [] })
const blogFormDataRef = ref(null)
const settingsFormRef = ref(null)
// 自定义验证博客内容的规则
const checkBlogContent = (rule, value, callback) => {
  const regConteng = /^<p><br><\/p>$/
  if (regConteng.test(value)) return callback(new Error('请输入博客正文'))
  callback()
}
const blogFormDataRules = {
  title: [{ required: true, message: '请输入博客标题' }],
  content: [{ validator: checkBlogContent, trigger: 'blur' }],
  markdownContent: [{ required: true, message: '请输入博客正文' }],
  categoryId: [{ required: true, message: '请选择博客分类' }],
  sourceType: [{ required: true, message: '请选择博客类型' }],
  reprintUri: [{ required: true, message: '请输入博客转载地址' }],
  allowComment: [{ required: true, message: '请选择是否允许评论' }]
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
        blogFormDataRef.value.validate((valid) => {
          if (valid) {
            cleanTimerInteval()
            // 清除掉自动保存的分类信息
            blogFormData.value.categoryId =
              blogFormData.value.categoryId === 1
                ? null
                : blogFormData.value.categoryId

            // 显示出弹框
            dialogConfig.isShow = true
          }
        })
      }
    }
  ]
})

// 点击确定按钮时弹出框的配置项
const dialogConfig = reactive({
  isShow: false,
  title: '博客设置',
  buttons: [
    {
      type: 'danger',
      text: '确定',
      click: (e) => {
        proxy.$func.unFocus(e)
        submitBlog()
      }
    }
  ],
  closeCallback: () => {
    if (windowConfig.isShow === true) {
      startTimerInteval()
    }
  }
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

  // 获取分类数据
  const result = await proxy.$request({
    url: '/category',
    method: 'GET'
  })

  categoryList.value = result.data.filter((cate) => cate.id !== 1)
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
  if (settingsFormRef.value) {
    settingsFormRef.value.resetFields()
  }

  // 关闭自动保存的定时器
  cleanTimerInteval()

  // 退出之后刷新一下列表
  emit('callback')
}

// 当处于markdown编辑器时填充html内容
const setHtmlContent = (htmlContent) => {
  blogFormData.value.content = htmlContent
}

// 删除标签方法实现
const deleteTag = (index) => {
  blogFormData.value.tag.splice(index, 1)
}

// 显示新增标签的逻辑
const showAddTagHandler = () => {
  // 1. 显示出输入框
  isShowTagInput.value = true
  // 2. 让输入框获取焦点
  nextTick(() => {
    tagInputRef.value.focus()
  })
}

// 插入tag 到表单中
const insertTag2Form = () => {
  // 1. 隐藏输入框
  isShowTagInput.value = false

  // 2. 空值不用加
  if (!tagInputValue.value) return

  // 3. 重复值不加
  if (blogFormData.value.tag.indexOf(tagInputValue.value) !== -1) {
    tagInputValue.value = undefined
    return
  }

  // 4. 将输入框中的值插入到 form 中
  blogFormData.value.tag.push(tagInputValue.value)

  tagInputValue.value = undefined
}

// 初始化方法
const init = (type, data) => {
  windowConfig.isShow = true
  nextTick(() => {
    // 开启自动保存的定时器
    startTimerInteval()
    blogFormDataRef.value.resetFields()
    blogFormData.value = { tag: [] }
    if (type === 'add') {
      // 获取用户信息
      blogFormData.value.editorType = store.state.userInfo.editorType
    } else {
      getBlogDetail(data)
    }
  })
}

// 对外暴露初始化方法到
defineExpose({ init })

// 获取博客详情
const getBlogDetail = (data) => {
  const formData = { ...data, tag: data.tag ? data.tag.split('|') : [] }
  blogFormData.value = formData
}

// 自动保存
const autoSave = async () => {
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
    params: { ...blogFormData.value, tag: blogFormData.value.tag.join('|') }
  })

  if (!result) return

  if (result.data[0].tag) {
    result.data[0].tag = result.data[0].tag.split('|')
  } else {
    result.data[0].tag = []
  }

  Object.assign(blogFormData.value, result.data[0])
}

// 提交博客数据到后台
const submitBlog = () => {
  settingsFormRef.value.validate(async (valid) => {
    if (!valid) return
    const params = { ...blogFormData.value }
    params.tag = params.tag.join('|')
    // 发送请求，新增博客
    const result = await proxy.$request({
      url: api.blogEdit,
      method: 'POST',
      params
    })

    if (!result) return
    proxy.$message.success(result.message)
    dialogConfig.isShow = false
    settingsFormRef.value.resetFields()
    closeWindow()
    emit('callback')
  })
}
</script>

<style lang="less" scoped>
.editor-form {
  :deep(.el-form-item) {
    margin-bottom: 15px;
  }

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

.blog-setting-form {
  .allow-comment {
    display: flex;
    .info {
      margin-left: 10px;
      color: #b0b0b0;
      font-size: 13px;
    }
  }
  .tag-input-panel {
    display: flex;
    align-items: center;

    .info {
      font-size: 13px;
      color: #b0b0b0;
      margin-right: 10px;
    }

    .tag-list {
      float: left;
      .tag-item {
        margin-right: 10px;
      }

      .icon-add-bold {
        cursor: pointer;
        color: red;
      }
      .tag-input {
        width: 100px;
      }
    }
  }
}
</style>
