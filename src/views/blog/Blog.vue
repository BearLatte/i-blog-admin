<template>
  <div class="top-panel">
    <el-form :model="searchFormData" label-width="50px">
      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item label="名称" prop="categoryName">
            <el-input
              placeholder="请输入名称，支持模糊搜索"
              v-model="searchFormData.titleFuzzy"
              @keyup.enter="searchBtnAction"
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="状态" prop="publishStatus">
            <el-select
              v-model="searchFormData.publishStatus"
              clearable
              placeholder="请选择状态"
              :style="{ width: '100%' }"
            >
              <el-option :value="-1" label="全部"></el-option>
              <el-option :value="0" label="草稿"></el-option>
              <el-option :value="1" label="已发布"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="分类" prop="categoryId">
            <el-select
              v-model="searchFormData.categoryId"
              clearable
              placeholder="请选择分类"
              :style="{ width: '100%' }"
            >
              <el-option :value="-1" label="全部"></el-option>
              <el-option
                :value="item.id"
                :label="item.categoryName"
                v-for="item in categoryList"
                :key="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-button type="danger" @click="searchBtnAction"> 搜索 </el-button>
          <el-button type="danger" @click="showEdit($event, 'add')">
            新增博客
          </el-button>
        </el-col>
      </el-row>
    </el-form>
  </div>
  <Table
    :columns="columns"
    :dataSource="tableData"
    :fetch="loadBlogDataList"
    :showPagination="true"
    class="blog-data-table"
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
      <div class="op">
        <template v-if="row.userId !== store.state.userInfo.id"> --- </template>
        <template v-else>
          <a
            href="javascript:void(0)"
            class="a-link"
            @click="showEdit($event, 'update', row)"
          >
            修改
          </a>
          <el-divider direction="vertical" />
          <a
            href="javascript:void(0)"
            class="a-link"
            @click="removeBlog2RecycleBin(row)"
          >
            删除
          </a>
        </template>

        <el-divider direction="vertical" />
        <a
          href="javascript:void(0)"
          class="a-link"
          @click="showBlogDetail(row.id)"
        >
          预览
        </a>
      </div>
    </template>
  </Table>
  <!-- 博客编辑组件 -->
  <BlogEdit ref="blogEditRef" @callback="loadBlogDataList" />

  <!-- 查看博客详情页面 -->
  <BlogDetail ref="blogDetailRef" />
</template>

<script setup>
import { useStore } from 'vuex'
import { getCurrentInstance, onMounted, reactive, ref, watch } from 'vue'
import BlogEdit from './BlogEdit.vue'
import BlogDetail from './BlogDetail.vue'

const { proxy } = getCurrentInstance()
const store = useStore()

// 接口地址
const api = {
  loadCategoies: '/category',
  blogEdit: '/blog'
}
// 搜索关键字字段
const searchFormData = reactive({})
// 分类列表
const categoryList = ref([])
// 博客数据
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
    label: '类型',
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
    label: '状态',
    prop: 'statusName',
    width: 70,
    scopedSlots: 'statusName'
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
    width: 150,
    scopedSlots: 'op'
  }
]

// 编辑新增窗口的引用
const blogEditRef = ref(null)

// 详情窗口的引用
const blogDetailRef = ref(null)

const currentUser = reactive({})

// 钩子调用
onMounted(async () => {
  console.log(store.state.userInfo)
  // 获取所有分类
  const result = await proxy.$request({
    url: api.loadCategoies,
    method: 'GET'
  })
  categoryList.value = result.data
})

// watch(
//   () => store.state.userInfo,
//   (newVal, _) => {
//     const roleTypt = newVal.roleType
//     const userId = newVal.id
//     Object.assign(currentUser, { roleTypt, userId })
//   },
//   { immediate: true, deep: true }
// )

// 加载博客列表数据
const loadBlogDataList = async () => {
  let params = {
    pageNo: tableData.pageNo,
    pageSize: tableData.pageSize
  }
  Object.assign(params, searchFormData)

  const result = await proxy.$request({
    url: api.blogEdit,
    method: 'GET',
    params: params
  })
  Object.assign(tableData, result.data)
}

// 搜索按钮的点击实现
const searchBtnAction = (e) => {
  proxy.$func.unFocus(e)
  if (Object.keys(searchFormData).length < 1) return
  loadBlogDataList()
}

// 新增按钮的点击事件
const showEdit = (event, type, data) => {
  proxy.$func.unFocus(event)
  if (categoryList.value.filter((item) => item.id !== 1).length < 1)
    return proxy.$message.warning('请至少创建一个分类再进行新增博客')
  blogEditRef.value.init(type, data)
}

// 显示详情
const showBlogDetail = (blogId) => {
  blogDetailRef.value.showDetail(blogId)
}

//  移动博客到回收站
const removeBlog2RecycleBin = (blog) => {
  proxy.$confirm(
    `确定要将标题为<strong style="color: orange">${blog.title}</strong>的博客移动到回收站吗?`,
    async () => {
      const result = await proxy.$request({
        url: api.blogEdit + '/' + blog.id,
        method: 'PUT',
        params: { delType: 1 }
      })
      if (!result) return
      proxy.$message.success(result.message)
      loadBlogDataList()
    }
  )
}
</script>

<style lang="less" scoped>
.blog-data-table {
  height: calc(100vh - 170px);
}
</style>
