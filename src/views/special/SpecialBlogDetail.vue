<template>
  <div>
    <Window
      :isShow="windowConfig.isShow"
      :buttons="windowConfig.buttons"
      :showCancel="false"
      @close="closeWindow"
    >
      <el-row :gutter="10">
        <el-col :span="16">
          <el-card class="content-card">
            <template #header>
              <div class="card-header">
                <span>文章详情</span>
              </div>
            </template>
            <div v-if="blog.title">
              <div class="blog-detail-title">{{ blog.title }}</div>
              <div class="blog-detail-content" v-html="blog.content"></div>
            </div>
            <div v-else class="no-data">请选择专题文章查看详情</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="list-card">
            <template #header>
              <div class="card-header">
                <span>专题文章</span>
              </div>
            </template>
            <div style="margin-bottom: 5px">
              <el-alert
                title="温馨提示：红色标识表示该博客为草稿状态"
                type="info"
                show-icon
                :closable="false"
              >
              </el-alert>
            </div>
            <el-tree
              class="tree-panel"
              ref="treeRef"
              :data="treeList"
              defaultExpandAll
              node-key="id"
              :expand-on-click-node="false"
              :props="treeProps"
              :highlight-current="true"
              @node-click="treeNodeClick"
            >
              <template #default="{ node, data }">
                <span class="custom-node-style">
                  <span class="node-title">
                    {{ data.title }}
                    <i class="draft-identify" v-show="data.publishStatus === 0">
                    </i>
                  </span>
                </span>
              </template>
            </el-tree>
          </el-card>
        </el-col>
      </el-row>
    </Window>
  </div>
</template>

<script setup>
import { getCurrentInstance, nextTick, reactive, ref } from 'vue'

// 代码高亮显示需要的两个组件
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-light.css'

const { proxy } = getCurrentInstance()

// 数据
const blog = ref({})
// 文章树数据
const treeList = ref([])
const currentBlogId = ref(null)
const treeRef = ref(null)

// 属性展示专题
const treeProps = {
  children: 'children',
  label: 'title',
  value: 'blogId'
}

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

const showDetail = async (blogData) => {
  // 当前选中的文章id
  currentBlogId.value = blogData.id
  // 获取文章树
  loadBlogList(blogData.categoryId)
  // 获取文章详情
  showBlogDetail(blogData.id)
  // 将窗口显示出来
  windowConfig.isShow = true
}

// 对外暴露显示详情方法方法
defineExpose({ showDetail })

const treeNodeClick = (data) => {
  if (data.id === -1) {
    blog.value = {}
    return
  }
  showBlogDetail(data.id)
}

// 获取文章树
const loadBlogList = async (categoryId) => {
  const result = await proxy.$request({
    url: `/special/blogs/${categoryId}`,
    method: 'GET'
  })
  if (!result) return
  treeList.value = result.data

  nextTick(() => {
    treeRef.value.setCurrentKey(currentBlogId.value)
  })
}

// 获取文章详情
const showBlogDetail = async (blogId) => {
  const result = await proxy.$request({
    url: `/blog/${blogId}`,
    method: 'GET'
  })
  if (!result) return
  blog.value = result.data
  // 将代码找出来高亮显示
  nextTick(() => {
    const blocks = document.querySelectorAll('pre code')
    blocks.forEach((block) => {
      hljs.highlightElement(block)
    })
  })
}
</script>

<style lang="less" scoped>
.content-card {
  .blog-detail-title {
    font-size: 18px;
    text-align: center;
  }

  .blog-detail-content {
    height: calc(100vh - 317px);
    overflow: auto;
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
}
.list-card {
  .tree-panel {
    height: calc(100vh - 343px);
    overflow: auto;
    .custom-node-style {
      display: flex;
      flex: 1;
      justify-content: space-between;
      .node-title {
        position: relative;
        font-size: 12px;
        line-height: 20px;
        .draft-identify {
          position: absolute;
          top: 2px;
          right: -7px;
          content: '';
          width: 6px;
          height: 6px;
          border: 1px solid #ddd;
          border-radius: 50%;
          background-color: rgb(245, 94, 94);
        }
      }

      .el-divider--vertical {
        margin: 0 3px;
      }
    }
  }
}
</style>
