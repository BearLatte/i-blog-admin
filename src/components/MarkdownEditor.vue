<template>
  <v-md-editor
    v-model="text"
    :height="height + 'px'"
    :disabled-menus="[]"
    :include-level="[1, 2, 3, 4, 5, 6]"
    @upload-image="handleUploadImage"
    @change="change"
    placeholder="请输入内容....."
  >
  </v-md-editor>
</template>

<script setup>
import VMdEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'
import { computed, getCurrentInstance } from 'vue'

// highlightjs
import hljs from 'highlight.js'

VMdEditor.use(githubTheme, {
  Hljs: hljs
})

const emit = defineEmits()

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: 500
  }
})

const { proxy } = getCurrentInstance()

// vue3 不支持直接双向绑定 prop，使用计算属性给 prop 赋值
const text = computed({
  get() {
    return props.modelValue
  },
  set(newValue) {
    emit('update:modelValue', newValue)
  }
})

// 图片上传
const handleUploadImage = async (event, insertImage, files) => {
  const fileSize = files[0].size / 1024 / 1024
  if (fileSize > 10) {
    proxy.$message.error('图片过大，请压缩后进行上传，最大图片质量为 10m')
    return
  }

  const result = await proxy.$request({
    url: 'file/upload',
    method: 'POST',
    dataType: 'file',
    params: {
      file: files[0]
    }
  })

  if (!result) return

  insertImage({
    url: proxy.$globalInfo.fileUrl + result.data,
    desc: '图片'
  })
}

// 改变事件
const change = (markdownContent, htmlContent) => {
  emit('update:modelValue', markdownContent)
  emit('htmlContent', htmlContent)
}
</script>

<style lang="scss" scoped></style>
