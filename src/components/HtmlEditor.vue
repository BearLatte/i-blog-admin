<template>
  <div class="editor-html">
    <div style="border: 1px solid #ccc">
      <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
      />
      <Editor
        :style="{
          height: height + 'px',
          'overflow-y': 'hidden'
        }"
        v-model="valueHtml"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
        @onChange="onChange"
      />
    </div>
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css' // 引入 css

import { ref, shallowRef, computed, getCurrentInstance } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { width } from 'dom7'

const { proxy } = getCurrentInstance()

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()
const toolbarConfig = {}
const mode = ref('default')
const editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    // 上传图片的逻辑
    uploadImage: {
      server: '/api/file/upload',
      fieldName: 'file',
      maxFileSize: 3 * 1024 * 1024, // 3M
      // 最多可上传几个文件，默认为 100
      maxNumberOfFiles: 10,
      // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
      allowedFileTypes: ['image/*'],
      // 自定义增加 http  header
      headers: {
        Authorization: window.sessionStorage.getItem('token')
      },
      customInsert(res, insertFn) {
        insertFn(proxy.$globalInfo.fileUrl + res.data)
      },

      // 上传错误，或者触发 timeout 超时
      onError(file, err, res) {
        if (err) return proxy.$message.error(err)
        console.log(`${file.name} 上传出错`, err, res)
      }
    },
    uploadVideo: {
      server: '/api/file/upload',
      fieldName: 'file',
      // 单个文件的最大体积限制，默认为 10M
      maxFileSize: 100 * 1024 * 1024, // 5M
      allowedFileTypes: ['video/*'],
      headers: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 跨域是否传递 cookie ，默认为 false
      withCredentials: true,
      timeout: 60 * 1000, // 60 秒, 默认时间是 30 秒
      customInsert(res, insertFn) {
        insertFn(proxy.$globalInfo.fileUrl + res.data)
      }
    }
  }
}
const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

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

const valueHtml = computed({
  get() {
    return props.modelValue
  },
  set(newValue) {
    emit('update:modelValue', newValue)
  }
})

const onChange = (editor) => {
  emit('update:modelValue', editor.getHtml())
}
</script>

<style lang="less" scoped></style>
