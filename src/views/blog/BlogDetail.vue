<template>
  <div>
    <Window
      :isShow="windowConfig.isShow"
      :buttons="windowConfig.buttons"
      :showCancel="false"
      @close="closeWindow"
    >
      <div class="blog-detail-title">{{ blog.title }}</div>
      <div class="blog-detail-content" v-html="blog.content"></div>
    </Window>
  </div>
</template>

<script setup>
import {
  computed,
  getCurrentInstance,
  nextTick,
  onMounted,
  reactive,
  ref
} from 'vue'

// 代码高亮显示需要的两个组件
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-light.css'

const { proxy } = getCurrentInstance()

// 数据
const blog = reactive({})

const windowConfig = reactive({
  isShow: false,
  buttons: [
    {
      // 唯一标识符，用于绑定循环的 key 值
      btnId: '1',
      // 按钮类型
      type: 'danger',
      text: '确定',
      click: () => {
        closeWindow()
      }
    }
  ]
})

// 方法
const closeWindow = () => {
  windowConfig.isShow = false
}

const showDetail = async (blogId) => {
  const result = await proxy.$request({
    url: `/blog/${blogId}`,
    method: 'GET'
  })
  if (!result) return
  windowConfig.isShow = true
  Object.assign(blog, result.data)

  // 将代码找出来高亮显示
  nextTick(() => {
    const blocks = document.querySelectorAll('pre code')
    blocks.forEach((block) => {
      hljs.highlightElement(block)
    })
  })
}

// 对外暴露显示详情方法方法
defineExpose({ showDetail })
</script>

<style lang="less" scoped>
.blog-detail-title {
  font-size: 18px;
  text-align: center;
}

.blog-detail-content {
  padding: 5px 20px;
  :deep(img) {
    width: 100%;
  }
  :deep(blockquote) {
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #f0b751;
  }
  :deep(pre) {
    position: relative;
    white-space: pre-wrap;
    padding: 40px 10px 10px;
    background-color: #192133;
    border-radius: 5px;
    border: 1px solid #324560;
  }

  :deep(pre > code) {
    word-wrap: break-word;
    background-color: #192133;
    color: #aaa;
    font-weight: 400;
  }
  :deep(code) {
    background-color: #6952b6;
    padding: 5px;
    border-radius: 5px;
    font-weight: 700;
    color: #fff;
  }

  :deep(pre::before) {
    content: '';
    position: absolute;
    -webkit-border-radius: 50%;
    border-radius: 50%;
    background: #fc625d;
    width: 12px;
    height: 12px;
    top: 10px;
    left: 12px;
    -webkit-box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
    box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
    z-index: 2;
  }
}
</style>
