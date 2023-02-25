<template>
  <div>
    <el-form :model="searchForm" label-width="80px" @submit.prevent>
      <el-row :gutter="20">
        <el-col :span="18">
          <el-form-item label="文章标题" prop="titleFuzzy">
            <el-input
              v-model="searchForm.titleFuzzy"
              placeholder="请输入文章标题，支持模糊搜索"
              @keyup.enter="searchClick"
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-button type="danger" @click="searchClick">搜索</el-button>
        </el-col>
      </el-row>
    </el-form>
    <Table
      :columns="columns"
      :dataSource="tableData"
      :fetch="loadBlogDataList"
      :showPagination="true"
      class="delblog-table"
    >
      <!-- 封面信息 -->
      <template #cover="{ row }">
        <Cover :cover="row.cover" :width="80"></Cover>
      </template>

      <!-- 文章信息 -->
      <template #blogInfo="{ row }">
        <div>标题：{{ row.title }}</div>
        <div>分类：{{ row.categoryName }}</div>
        <div>作者：{{ row.nickName }}</div>
        <div>类型：{{ row.blogType === 0 ? '博客' : '专题' }}</div>
      </template>

      <!-- 创作类型 -->
      <template #typeName="{ row }">
        <div>
          类型：
          <span v-if="row.sourceType === 0">原创</span>
          <span v-if="row.sourceType === 1">转载</span>
        </div>
        <div v-if="row.sourceType === 1">转载地址：{{ row.reprintUri }}</div>
      </template>

      <!-- 发布状态 -->
      <template #statusName="{ row }">
        <span v-if="row.publishStatus == 1" :style="{ color: 'green' }">
          {{ row.publishStatusName }}
        </span>
        <span v-else :style="{ color: 'red' }">
          {{ row.publishStatusName }}
        </span>
      </template>

      <!-- 时间 -->
      <template #time="{ row }">
        <div>创建时间：{{ proxy.$func.dateformatter(row.createdAt) }}</div>
        <div>更新时间：{{ proxy.$func.dateformatter(row.updatedAt) }}</div>
      </template>

      <!-- 操作 -->
      <template #op="{ row }">
        <template
          v-if="
            store.state.userInfo.roleType === 2 &&
            store.state.userInfo.id !== row.userId
          "
        >
          ----
        </template>
        <template v-else>
          <a href="javascript:void(0)" class="a-link" @click="restore(row)">
            还原
          </a>
          <el-divider direction="vertical" />
          <a href="javascript:void(0)" class="a-link" @click="deleteBlog(row)">
            删除
          </a>
        </template>
      </template>
    </Table>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import { reactive, ref, getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()
const store = useStore()
const searchForm = reactive({})
// 表格数据
const tableData = reactive({})

// 表格字段列
const columns = [
  {
    label: '封面',
    prop: 'cover',
    width: 80,
    scopedSlots: 'cover'
  },
  {
    label: '文章信息',
    prop: 'blogInfo',
    scopedSlots: 'blogInfo'
  },
  {
    label: '编辑器',
    prop: 'editorTypeName',
    width: 100
  },
  {
    label: '博客类型',
    prop: 'typeName',
    width: 200,
    scopedSlots: 'typeName'
  },
  {
    label: '评论',
    prop: 'allowCommentTypeName',
    width: 70
  },
  {
    label: '时间',
    prop: 'time',
    width: 230,
    scopedSlots: 'time'
  },
  {
    label: '操作',
    prop: 'op',
    width: 120,
    scopedSlots: 'op'
  }
]

const api = {
  getBlogs: '/blog/delBlogs',
  blogEdit: '/blog'
}

const searchClick = (e) => {
  proxy.$func.unFocus(e)
  loadBlogDataList()
}

const loadBlogDataList = async () => {
  let params = {
    pageNo: tableData.pageNo,
    pageSize: tableData.pageSize
  }
  Object.assign(params, searchForm)

  const result = await proxy.$request({
    url: api.getBlogs,
    method: 'GET',
    params: params
  })
  Object.assign(tableData, result.data)
}

// 永久删除博客
const deleteBlog = (blog) => {
  proxy.$confirm(
    `确定要将标题为<strong style="color: orange">${blog.title}</strong>的博客永久删除吗?`,
    async () => {
      const result = await proxy.$request({
        url: api.blogEdit + '/' + blog.id,
        method: 'DELETE'
      })
      if (!result) return
      proxy.$message.success(result.message)
      loadBlogDataList()
    },
    'warning'
  )
}

// 还原博客
const restore = async (blog) => {
  const result = await proxy.$request({
    url: api.blogEdit + '/' + blog.id,
    method: 'PUT',
    params: { delType: 0 }
  })
  if (!result) return
  proxy.$message.success(result.message)
  loadBlogDataList()
}
</script>

<style lang="less" scoped>
.delblog-table {
  height: calc(100vh - 150px);
}
</style>
